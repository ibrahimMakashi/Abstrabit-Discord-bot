import { useEffect, useRef } from 'react';
import { useSocket } from './useSocket';

const DEV_REFRESH_MS = 10000;
const trim = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Socket-driven refresh with optional dev polling fallback.
 * Polling is enabled in dev only when VITE_SOCKET_URL is not set (local-only socket).
 */
export const useRealtimeRefresh = ({ enabled = true, onRefresh }) => {
  const onRefreshRef = useRef(onRefresh);
  const useDevPolling =
    import.meta.env.DEV && !trim(import.meta.env.VITE_SOCKET_URL);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const triggerRefresh = () => {
    onRefreshRef.current?.();
  };

  const { isConnected } = useSocket({
    enabled,
    onCommandCreated: triggerRefresh,
    onReportProcessed: triggerRefresh,
  });

  useEffect(() => {
    if (!enabled || !useDevPolling) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      onRefreshRef.current?.();
    }, DEV_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, useDevPolling]);

  return { isConnected, useDevPolling };
};
