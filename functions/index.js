const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const serviceAccount = require('./supportbot-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://supportbot-apmvng.firebaseio.com',
});

const { SessionsClient } = require('dialogflow');

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const { queryInput, sessionId } = request.body;

    const sessionClient = new SessionsClient({ credentials: serviceAccount });
    const session = sessionClient.sessionPath('supportbot-apmvng', sessionId);

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
        `Welcome to Tek Code Customer Support!\n You can request the following actions:\n 1. Update your profile`
      );
    }

    function fallback(agent) {
      agent.add(`Sorry, can you try again?`);
    }

    async function updateProfileHandler(agent) {
      const db = admin.firestore();
      const profile = db.collection('users').doc('henry');

      const { name, color } = result.parameters;

      try {
        await profile.set({ name, color });
      } catch (e) {
        console.log('error in final user response:', e);
      }

      agent.add(`Welcome aboard ${color}-${name}!`);
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('UpdateProfile', updateProfileHandler);
    agent.handleRequest(intentMap);
  }
);
