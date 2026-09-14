import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = parseInt(process.env.PORT || '5000', 10);
const nodeEnv = process.env.NODE_ENV || 'development';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const mongodbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mimicu';
const audioStoragePath = path.resolve(__dirname, '../../', process.env.AUDIO_STORAGE_PATH || './audio');

const jwtSecret = process.env.JWT_SECRET || 'mimicu_super_secret_jwt_key_phase9_dev_2026';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const cookieSecret = process.env.COOKIE_SECRET || 'mimicu_cookie_secret_phase9';

if (nodeEnv === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('dev')) {
    console.warn('[SECURITY RISK] JWT_SECRET is using development default in production environment!');
  }
  if (!process.env.COOKIE_SECRET) {
    console.warn('[SECURITY RISK] COOKIE_SECRET is not explicitly configured in production environment!');
  }
}

export const config = Object.freeze({
  PORT: port,
  NODE_ENV: nodeEnv,
  IS_PROD: nodeEnv === 'production',
  CLIENT_URL: clientUrl,
  ALLOWED_ORIGINS: clientUrl.split(',').map((u) => u.trim()),
  MONGODB_URI: mongodbUri,
  AUDIO_STORAGE_PATH: audioStoragePath,
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: jwtExpiresIn,
  COOKIE_SECRET: cookieSecret,
});
