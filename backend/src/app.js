import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import { doubleCsrf } from 'csrf-csrf';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env.js';
import { requestContextMiddleware } from './middlewares/requestContext.js';
import { ensureDatabaseMiddleware } from './middlewares/ensureDatabase.js';
import { mongoSanitizeMiddleware } from './middlewares/mongoSanitize.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import interactionRoutes from './routes/interactionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { apiResponse } from './utils/apiResponse.js';
import { isDatabaseConnected } from './database/mongoose.js';
import { requireAuth, requireRole } from './middlewares/auth.js';
import { csrfCookieOptions } from './utils/cookie.js';

const app = express();

const getCsrfSessionIdentifier = (req) =>
  req.cookies.accessToken || req.cookies.refreshToken || 'anonymous';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  // Must not use req.user here — CSRF middleware runs before route-level requireAuth.
  getSessionIdentifier: getCsrfSessionIdentifier,
  cookieName: 'csrf-token',
  cookieOptions: csrfCookieOptions,
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('trust proxy', 1);

app.use(ensureDatabaseMiddleware);

// Discord interactions must be registered before body parsers and sanitizers.
app.use('/api/interactions', express.raw({ type: 'application/json' }));
app.use('/api/interactions', interactionRoutes);

app.use(requestContextMiddleware);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitizeMiddleware());
app.use(xss());
app.use(limiter);

app.get('/health', (req, res) =>
  res.json(
    apiResponse({
      message: 'Service healthy',
      data: {
        uptime: process.uptime(),
        databaseConnected: isDatabaseConnected(),
      },
    }),
  ),
);

app.get('/api/csrf-token', requireAuth, requireRole('admin'), (req, res) => {
  res.status(StatusCodes.OK).json(
    apiResponse({
      message: 'CSRF token generated',
      data: {
        csrfToken: generateCsrfToken(req, res),
      },
    }),
  );
});

app.use('/api/auth', authRoutes);
app.use('/api', doubleCsrfProtection, apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
