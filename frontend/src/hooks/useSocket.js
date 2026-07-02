import { useEffect, useRef, useState } from 'react';
import { getSharedSocket } from '../lib/socket.js';

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

    const socket = getSharedSocket();

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
    } else if (!socket.active) {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('command:created', handleCommandCreated);
      socket.off('report:processed', handleReportProcessed);
    };
  }, [enabled]);

  return { isConnected };
};
