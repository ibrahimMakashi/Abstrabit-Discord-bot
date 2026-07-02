import { Server } from 'socket.io';

let ioInstance = null;

export const initializeSocket = (server, corsOrigin) => {
  ioInstance = new Server(server, {
    cors: {
      origin: corsOrigin,
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
