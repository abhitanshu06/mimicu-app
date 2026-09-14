import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;
let connectionPromise = null;

/**
 * Connect to MongoDB database
 * Connects once and reuses the active connection.
 */
export async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (!config.MONGODB_URI) {
    const errorMsg = '[MongoDB] Missing MONGODB_URI in environment configuration.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  connectionPromise = mongoose.connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 5000,
  })
    .then((conn) => {
      isConnected = true;
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      
      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Runtime connection error:', err.message);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected from database.');
        isConnected = false;
        connectionPromise = null;
      });

      return conn.connection;
    })
    .catch((err) => {
      isConnected = false;
      connectionPromise = null;
      console.warn(`[MongoDB] Connection notice: ${err.message}. Operating in resilient hybrid fallback mode.`);
      return null;
    });

  return connectionPromise;
}

/**
 * Check if MongoDB is currently connected
 * @returns {boolean}
 */
export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Gracefully close the database connection
 */
export async function disconnectDB() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    console.log('[MongoDB] Connection closed gracefully.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnect:', err.message);
  }
}
