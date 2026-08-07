import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', {
  autoConnect: false, // nos conectamos manualmente cuando el usuario ya inició sesión
});