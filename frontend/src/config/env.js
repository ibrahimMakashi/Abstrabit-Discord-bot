const trim = (value) => (typeof value === 'string' ? value.trim() : '');

/** API base URL — e.g. https://your-backend.vercel.app/api or /api (local Vite proxy). */
export const API_BASE_URL = trim(import.meta.env.VITE_API_BASE_URL) || '/api';

/** Socket.io server origin — derived from API URL or VITE_SOCKET_URL. */
export const getSocketUrl = () => {
  const socketUrl = trim(import.meta.env.VITE_SOCKET_URL);
  if (socketUrl) {
    return socketUrl;
  }

  // When API points at a full backend URL, connect socket there directly (avoids Vite ws proxy).
  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }

  // Relative API URL (e.g. /api) — use Vite origin; /socket.io is proxied in vite.config.js.
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};
