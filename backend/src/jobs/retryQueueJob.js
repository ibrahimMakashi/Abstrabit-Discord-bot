import cron from 'node-cron';
import { processRetryQueue } from '../services/retryQueueService.js';
import { logger } from '../config/logger.js';

export const startRetryQueueJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      await processRetryQueue();
    } catch (error) {
      logger.error({ err: error }, 'Retry queue processing failed');
    }
  });
};
