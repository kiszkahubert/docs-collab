import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private documentId: string | null = null;

  constructor(private authService: AuthService) {}

  connectToDocument(documentId: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.documentId = documentId;
    this.socket = new WebSocket(`ws://localhost:3000/documents/ws?documentId=${documentId}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleSocketMessage(message);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendUpdate(update: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(update));
    }
  }

  private handleSocketMessage(message: any): void {
    switch (message.type) {
      case 'document_update':
        this.handleDocumentUpdate(message.data);
        break;
      case 'user_joined':
        this.handleUserJoined(message.data.userId);
        break;
      case 'user_left':
        this.handleUserLeft(message.data.userId);
        break;
      case 'initial_connection':
        this.handleInitialConnection(message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleDocumentUpdate(document: any): void {
    console.log('Document updated:', document);
  }

  private handleUserJoined(userId: string): void {
    console.log(`User ${userId} joined the document`);
  }

  private handleUserLeft(userId: string): void {
    console.log(`User ${userId} left the document`);
  }

  private handleInitialConnection(data: any): void {
    console.log('Initial connection:', data);
  }
}
