const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const serviceAccount = require('./tekcode.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tek-code.firebaseio.com/',
});

const { SessionsClient } = require('dialogflow');

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;

    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath('tek-code', sessionId);

    const responses = await sessionClient.detectIntent({ session, queryInput });

    const result = responses[0].queryResult;

    response.send(result);
  });
});

const { WebhookClient } = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions.https.onRequest(
  async (request, response) => {
    const agent = new WebhookClient({ request, response });

    const result = request.body.queryResult;

    function welcome(agent) {
      agent.add(
        `Bienvenido a soporte de TekCode, tiene a disposicion las siguientes opciones:

    1. Contacto para proyectos.
    2. Que es Tek-Code?
    3. Crear perfil de cliente.`
      );
    }

    function fallback(agent) {
      agent.add(`Sorry, can you try again?`);
    }

    async function updateProfileHandler(agent) {
      const db = admin.firestore();
      const profile = db.collection('users').doc('henry');

      const { fullname } = result.parameters;

      try {
        await profile.set({ fullname });
      } catch (e) {
        console.log('error in final user response:', e);
      }

      agent.add(`Hemos recibido su mensaje, pronto nos pondremos en contacto!`);
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('ProjectsContact', updateProfileHandler);
    agent.handleRequest(intentMap);
  }
);
