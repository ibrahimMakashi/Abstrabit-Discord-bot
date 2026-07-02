import { env } from './env.js';

const normalizeOrigin = (origin) => (origin ? origin.replace(/\/$/, '') : '');

const DEVELOPMENT_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173',
]);

const extraOrigins = env.SOCKET_EXTRA_ORIGINS.split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

export const getFrontendOrigin = () => normalizeOrigin(env.FRONTEND_URL);

export const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalized = normalizeOrigin(origin);

  if (normalized === getFrontendOrigin()) {
    return true;
  }

  if (extraOrigins.includes(normalized)) {
    return true;
  }

  if (env.NODE_ENV !== 'production') {
    return DEVELOPMENT_ORIGINS.has(normalized);
  }

  return false;
};
