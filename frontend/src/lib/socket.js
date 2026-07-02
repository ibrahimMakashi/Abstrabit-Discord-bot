import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/env.js';

let socketInstance = null;
const connectionListeners = new Set();
const eventListeners = {
  'command:created': new Set(),
  'report:processed': new Set(),
};

const notifyConnection = (connected) => {
  connectionListeners.forEach((listener) => listener(connected));
};

const notifyEvent = (event, payload) => {
  eventListeners[event]?.forEach((listener) => listener(payload));
};

const attachSocketHandlers = (socket) => {
  socket.on('connect', () => notifyConnection(true));
  socket.on('disconnect', () => notifyConnection(false));
  socket.on('command:created', (payload) => notifyEvent('command:created', payload));
  socket.on('report:processed', (payload) => notifyEvent('report:processed', payload));
};

export const getSharedSocket = () => {
  if (!socketInstance) {
    socketInstance = io(getSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    attachSocketHandlers(socketInstance);
  }

  return socketInstance;
};

export const subscribeSocketConnection = (listener) => {
  const socket = getSharedSocket();
  connectionListeners.add(listener);
  listener(socket.connected);

  return () => {
    connectionListeners.delete(listener);
  };
};

export const subscribeSocketEvent = (event, listener) => {
  getSharedSocket();
  eventListeners[event]?.add(listener);

  return () => {
    eventListeners[event]?.delete(listener);
  };
};
