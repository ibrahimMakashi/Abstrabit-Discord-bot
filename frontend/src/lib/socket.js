import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/env.js';

let socketInstance = null;

export const getSharedSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });
  }

  return socketInstance;
};
