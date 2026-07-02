import { useEffect, useRef, useState } from 'react';
import { subscribeSocketConnection, subscribeSocketEvent } from '../lib/socket.js';

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

    const unsubscribeConnection = subscribeSocketConnection(setIsConnected);
    const unsubscribeCommand = subscribeSocketEvent('command:created', (payload) => {
      onCommandCreatedRef.current?.(payload);
    });
    const unsubscribeReport = subscribeSocketEvent('report:processed', (payload) => {
      onReportProcessedRef.current?.(payload);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeCommand();
      unsubscribeReport();
    };
  }, [enabled]);

  return { isConnected };
};
