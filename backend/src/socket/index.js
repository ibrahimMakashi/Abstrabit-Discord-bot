import { Server } from 'socket.io';
import { isAllowedOrigin } from '../config/corsOrigins.js';

let ioInstance = null;

export const initializeSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
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

const serializePayload = (payload) => {
  if (!payload) {
    return payload;
  }

  if (typeof payload.toObject === 'function') {
    return payload.toObject();
  }

  if (typeof payload.toJSON === 'function') {
    return payload.toJSON();
  }

  return payload;
};

export const emitSocketEvent = (event, payload) => {
  if (ioInstance) {
    ioInstance.emit(event, serializePayload(payload));
  }
};
