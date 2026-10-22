import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;
