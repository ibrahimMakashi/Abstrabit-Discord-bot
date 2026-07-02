import { env, isProduction } from '../config/env.js';

const accessMaxAge = 15 * 60 * 1000;
const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

/** Cross-origin SPA + API needs SameSite=None when cookies are Secure. */
export const getCookieSameSite = () => {
  if (env.COOKIE_SAME_SITE) {
    return env.COOKIE_SAME_SITE;
  }

  if (env.COOKIE_SECURE || isProduction) {
    return 'none';
  }

  return 'lax';
};

const baseCookieOptions = {
  httpOnly: true,
  sameSite: getCookieSameSite(),
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

export const csrfCookieOptions = {
  httpOnly: false,
  sameSite: getCookieSameSite(),
  secure: env.COOKIE_SECURE || isProduction,
  path: '/',
};
