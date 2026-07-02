import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/env.js';

export const useSocket = ({ enabled, onCommandCreated, onReportProcessed }) => {
  const [isConnected, setIsConnected] = useState(false);
  const onCommandCreatedRef = useRef(onCommandCreated);
  const onReportProcessedRef = useRef(onReportProcessed);

  useEffect(() => {
    onCommandCreatedRef.current = onCommandCreated;
  }, [onCommandCreated]);

  useEffect(() => {
    onReportProcessedRef.current = onReportProcessed;
  }, [onReportProcessed]);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return undefined;
    }

    const socket = io(getSocketUrl(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleCommandCreated = (payload) => onCommandCreatedRef.current?.(payload);
    const handleReportProcessed = (payload) => onReportProcessedRef.current?.(payload);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('command:created', handleCommandCreated);
    socket.on('report:processed', handleReportProcessed);

    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('command:created', handleCommandCreated);
      socket.off('report:processed', handleReportProcessed);
      socket.disconnect();
      setIsConnected(false);
    };
  }, [enabled]);

  return { isConnected };
};
