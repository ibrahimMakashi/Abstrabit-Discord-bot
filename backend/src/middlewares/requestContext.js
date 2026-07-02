import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { logger } from '../config/logger.js';

export const requestContextMiddleware = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
});
