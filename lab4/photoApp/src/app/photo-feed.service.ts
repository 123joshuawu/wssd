import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class PhotoFeedService {
  feed = this.socket.fromEvent('feed');

  constructor(private socket: Socket) {}

  next(amount?: number) {
    this.socket.emit('next', { amount });
  }

  query(query: string, add: boolean = true) {
    this.socket.emit('query', { query, add });
  }

  window(window: number) {
    this.socket.emit('window', { window });
  }

  reset() {
    this.socket.emit('reset');
  }
}
