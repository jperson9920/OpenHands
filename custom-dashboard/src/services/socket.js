import { io } from 'socket.io-client';

let socket = null;

export default {
  connect(apiUrl) {
    if (socket) return socket;
    try {
      // socket.io-client accepts an http(s) URL and will negotiate the WS endpoint
      socket = io(apiUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });
      return socket;
    } catch (e) {
      console.error('Socket connect error', e);
      return null;
    }
  },

  on(event, fn) {
    if (!socket) return;
    socket.on(event, fn);
  },

  emit(event, payload) {
    if (!socket) return;
    socket.emit(event, payload);
  },

  disconnect() {
    if (!socket) return;
    socket.disconnect();
    socket = null;
  }
};