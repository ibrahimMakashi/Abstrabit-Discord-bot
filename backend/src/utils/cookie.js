import { env, isProduction } from '../config/env.js';

const accessMaxAge = 15 * 60 * 1000;
const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'strict' : 'lax',
  secure: env.COOKIE_SECURE || isProduction,
  path: '/',
};

if (env.COOKIE_DOMAIN) {
  baseCookieOptions.domain = env.COOKIE_DOMAIN;
}

export const accessCookieOptions = {
  ...baseCookieOptions,
  maxAge: accessMaxAge,
};

export const refreshCookieOptions = {
  ...baseCookieOptions,
  maxAge: refreshMaxAge,
};

export const clearCookieOptions = {
  ...baseCookieOptions,
  maxAge: 0,
};
