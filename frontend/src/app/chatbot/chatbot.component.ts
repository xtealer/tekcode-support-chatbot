import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

const dialogflowURL = 'https://us-central1-tek-code.cloudfunctions.net/dialogflowGateway';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  messages = [];
  loading = false;

  sessionId = uuidv4();

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.addBotMessage(`Bienvenido a soporte de TekCode, tiene a disposicion las siguientes opciones:

    1. Contacto para proyectos.
    2. Que es Tek-Code?
    3. Crear perfil de cliente.`);
  }

  addUserMessage(text) {
    this.messages.push({
      text,
      sender: 'Tu',
      reply: true,
      date: new Date(),
    });
  }

  addBotMessage(text) {
    this.messages.push({
      text,
      sender: 'Robot',
      avatar: '/assets/bot.png',
      date: new Date(),
    });
  }

  handleUserMessage(event) {
    const text = event.message;
    this.addUserMessage(text);

    this.loading = true;

    this.http
      .post<any>(dialogflowURL, {
        sessionId: this.sessionId,
        queryInput: {
          text: {
            text,
            languageCode: 'es',
          },
        },
      })
      .subscribe((res) => {
        this.addBotMessage(res.fulfillmentText);
        this.loading = false;
      });
  }
}
