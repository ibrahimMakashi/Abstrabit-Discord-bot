import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Fail fast on serverless — do not queue queries while disconnected.
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

const globalCache = globalThis;

if (!globalCache._mongooseCache) {
  globalCache._mongooseCache = { conn: null, promise: null };
}

const cache = globalCache._mongooseCache;

const getSanitizedUri = () => env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@');

export const connectDatabase = async () => {
  if (!env.MONGODB_URI?.trim()) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 20000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        // Vercel/serverless often fails on IPv6 — force IPv4 for Atlas.
        family: 4,
      })
      .then((connection) => {
        logger.info({ uri: getSanitizedUri() }, 'MongoDB connected');
        return connection;
      })
      .catch((error) => {
        cache.promise = null;
        cache.conn = null;
        logger.error({ err: error, uri: getSanitizedUri() }, 'MongoDB connection failed');
        throw error;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    cache.promise = null;
    cache.conn = null;
    throw error;
  }
};

export const ensureDatabaseConnected = async () => connectDatabase();

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const getDatabaseStatus = async () => {
  try {
    await connectDatabase();
    return {
      connected: true,
      readyState: mongoose.connection.readyState,
    };
  } catch (error) {
    return {
      connected: false,
      readyState: mongoose.connection.readyState,
      error: error.message,
    };
  }
};
