import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private documentId: string | null = null;
  private isConnecting: boolean = false;
  public onContentUpdate = new Subject<{content: string, title: string}>();

  connectToDocument(documentId: string): void {
    if (this.documentId === documentId && this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    this.disconnect();
    this.documentId = documentId;
    this.socket = new WebSocket(`ws://localhost:3000/documents/ws?documentId=${documentId}`);
    this.socket.onopen = () => {
      this.isConnecting = false;
    };
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleSocketMessage(message);
    };
    this.socket.onclose = (event) => {
      this.isConnecting = false;
      if (event.code !== 1000 && event.code !== 1001 && this.documentId) {
        setTimeout(() => {
          if (this.documentId) {
            this.connectToDocument(this.documentId);
          }
        }, 1000);
      }
    };
    this.socket.onerror = (error) => {
      this.isConnecting = false;
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    this.documentId = null;
    this.isConnecting = false;
  }

  sendContentUpdate(content: string, title: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'content_update',
        content,
        title
      }));
    } else {
      if (this.documentId && !this.isConnecting) {
        this.connectToDocument(this.documentId);
      }
    }
  }

  getCurrentDocumentId(): string | null {
    return this.documentId;
  }

  private handleSocketMessage(message: any): void {
    switch (message.type) {
      case 'content_update':
        this.onContentUpdate.next({
          content: message.content,
          title: message.title
        });
        break;
      default:
        console.warn(message.type);
    }
  }
  ngOnDestroy(): void {
    this.disconnect();
  }
}
