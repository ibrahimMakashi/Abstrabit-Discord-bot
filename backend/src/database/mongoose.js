import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null };
}

const cache = globalCache._mongooseCache;

export const connectDatabase = async () => {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    mongoose.set('strictQuery', true);

    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      })
      .then((connection) => {
        logger.info(
          { uri: env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@') },
          'MongoDB connected',
        );
        return connection;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};

export const ensureDatabaseConnected = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return connectDatabase();
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
