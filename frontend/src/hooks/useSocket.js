import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/env.js';

export const useSocket = ({ enabled, onCommandCreated, onReportProcessed }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return undefined;
    }

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('command:created', (payload) => {
      onCommandCreated?.(payload);
    });
    socket.on('report:processed', (payload) => {
      onReportProcessed?.(payload);
    });

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
      setIsConnected(false);
    };
  }, [enabled, onCommandCreated, onReportProcessed]);

  return { isConnected };
};
