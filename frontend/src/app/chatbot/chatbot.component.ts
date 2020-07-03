import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

const dialogflowURL =
  'https://us-central1-supportbot-apmvng.cloudfunctions.net/dialogflowGateway';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class ChatbotComponent implements OnInit {
  messages = [];
  loading = false;

  sessionId = uuidv4();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.addBotMessage('Human presence detected 🤖. How can I help you?');
  }

  addUserMessage(text) {
    this.messages.push({
      text,
      sender: 'You',
      reply: true,
      date: new Date(),
    });
  }

  addBotMessage(text) {
    this.messages.push({
      text,
      sender: 'Bot',
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
            languageCode: 'en-US',
          },
        },
      })
      .subscribe((res) => {
        this.addBotMessage(res.fulfillmentText);
        this.loading = false;
      });
  }
}
