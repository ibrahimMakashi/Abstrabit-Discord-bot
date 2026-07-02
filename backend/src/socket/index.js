import { Server } from 'socket.io';

let ioInstance = null;

import { env } from '../config/env.js';

let ioInstance = null;

const getAllowedSocketOrigin = () => env.FRONTEND_URL.replace(/\/$/, '');

export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigin = getAllowedSocketOrigin();

        if (!origin || origin.replace(/\/$/, '') === allowedOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    socket.emit('system:connected', {
      message: 'Realtime connection established',
      timestamp: new Date().toISOString(),
    });
  });

  return ioInstance;
};

export const getSocket = () => ioInstance;

export const emitSocketEvent = (event, payload) => {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
};
