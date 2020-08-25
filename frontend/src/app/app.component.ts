import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private title: Title, private meta: Meta) {
    title.setTitle('TekCode Support');

    this.meta.updateTag({ name: 'description', content: 'Chatbot para atencion a clientes de Tek-Code.' });

    this.meta.updateTag({ name: 'og:url', content: 'https://chatbot.tek-code.com' });
  }
}
