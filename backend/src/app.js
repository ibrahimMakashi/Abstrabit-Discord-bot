import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import { StatusCodes } from 'http-status-codes';
import { env } from './config/env.js';
import { isAllowedOrigin } from './config/corsOrigins.js';
import { doubleCsrfProtection, generateCsrfToken } from './config/csrf.js';
import { requestContextMiddleware } from './middlewares/requestContext.js';
import { ensureDatabaseMiddleware } from './middlewares/ensureDatabase.js';
import { mongoSanitizeMiddleware } from './middlewares/mongoSanitize.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';
import interactionRoutes from './routes/interactionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { apiResponse } from './utils/apiResponse.js';
import { getDatabaseStatus } from './database/mongoose.js';
import { requireAuth, requireRole } from './middlewares/auth.js';

const app = express();

app.set('etag', false);

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
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

app.get('/health', async (req, res) => {
  const database = await getDatabaseStatus();

  res.status(database.connected ? 200 : 503).json(
    apiResponse({
      message: database.connected ? 'Service healthy' : 'Database unavailable',
      data: {
        uptime: process.uptime(),
        databaseConnected: database.connected,
        databaseReadyState: database.readyState,
        ...(database.error ? { databaseError: database.error } : {}),
      },
    }),
  );
});

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
