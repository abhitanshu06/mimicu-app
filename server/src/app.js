import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { setupSecurityMiddleware } from './middleware/security.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { config } from './config/env.js';

export function createApp() {
  const app = express();

  // 1. Security & CORS middleware
  setupSecurityMiddleware(app);

  // 2. Cookie parser for HTTP-only JWT sessions
  app.use(cookieParser(config.COOKIE_SECRET));

  // 3. Body parsers with sensible limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 3. Request logging in development or non-test
  if (config.NODE_ENV !== 'test') {
    app.use(morgan(config.IS_PROD ? 'combined' : 'dev'));
  }

  // 4. API Routes
  app.use('/api', apiRouter);

  // 5. Unmatched route 404 handler
  app.use(notFoundHandler);

  // 6. Centralized error handler
  app.use(errorHandler);

  return app;
}
