import { doubleCsrf } from 'csrf-csrf';
import { env } from './env.js';
import { csrfCookieOptions } from '../utils/cookie.js';

export const getCsrfSessionIdentifier = (req) =>
  req.cookies.accessToken || req.cookies.refreshToken || 'anonymous';

const csrf = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier: getCsrfSessionIdentifier,
  cookieName: 'csrf-token',
  cookieOptions: csrfCookieOptions,
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

export const { doubleCsrfProtection, generateCsrfToken } = csrf;
