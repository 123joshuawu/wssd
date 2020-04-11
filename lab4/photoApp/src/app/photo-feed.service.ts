import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root',
})
export class PhotoFeedService {
  feed = this.socket.fromEvent('feed');

  constructor(private socket: Socket) {}

  next(lastPhotoId: string) {
    this.socket.emit('next', { lastPhotoId });
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
