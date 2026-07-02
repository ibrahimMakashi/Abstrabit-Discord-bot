import { env } from './env.js';

const normalizeOrigin = (origin) => (origin ? origin.replace(/\/$/, '') : '');

const DEVELOPMENT_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://[::1]:5173',
]);

export const getFrontendOrigin = () => normalizeOrigin(env.FRONTEND_URL);

export const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalized = normalizeOrigin(origin);

  if (normalized === getFrontendOrigin()) {
    return true;
  }

  if (env.NODE_ENV !== 'production') {
    return DEVELOPMENT_ORIGINS.has(normalized);
  }

  return false;
};
