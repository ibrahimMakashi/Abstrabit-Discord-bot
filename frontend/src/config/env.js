const trim = (value) => (typeof value === 'string' ? value.trim() : '');

/** API base URL — e.g. https://your-backend.onrender.com/api or /api (local Vite proxy). */
export const API_BASE_URL = trim(import.meta.env.VITE_API_BASE_URL) || '/api';

/** Socket.io server origin — derived from API URL or VITE_SOCKET_URL. */
export const getSocketUrl = () => {
  const socketUrl = trim(import.meta.env.VITE_SOCKET_URL);
  if (socketUrl) {
    return socketUrl;
  }

  // Local dev: same origin as Vite so /socket.io is proxied (avoids cross-origin ws issues).
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};
