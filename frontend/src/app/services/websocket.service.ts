import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChangePayload {
  payloadContent: string;
  payloadIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client: Client;
  private messagesSubject = new BehaviorSubject<ChangePayload>({
    payloadContent: '',
    payloadIndex: 0
  });
  public messages$ = this.messagesSubject.asObservable();
  constructor() {
    this.client = new Client({
      webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws');
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    this.client.onConnect = () => {
      console.log('Conn established');
      this.client.subscribe('/topic/messages', (message: Message) => {
        const newMessage: ChangePayload = JSON.parse(message.body);
        this.messagesSubject.next(newMessage);
      });
    };
    this.client.onStompError = (frame) => {
      console.error(frame.headers['message']);
      console.error(frame.body);
    };
    this.client.activate();
  }
  sendMessage(payload: ChangePayload): void {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: '/app/send',
        body: JSON.stringify(payload)
      });
    } else {
      console.error('Conn err');
    }
  }
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
