import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const connectDatabase = async () => {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 10000,
  });

  logger.info({ uri: env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') }, 'MongoDB connected');
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
