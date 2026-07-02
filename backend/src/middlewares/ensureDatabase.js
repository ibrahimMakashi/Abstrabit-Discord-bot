import { ensureDatabaseConnected } from '../database/mongoose.js';
import { logger } from '../config/logger.js';

export const ensureDatabaseMiddleware = async (req, res, next) => {
  try {
    await ensureDatabaseConnected();
    next();
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    next(error);
  }
};
