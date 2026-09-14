import helmet from 'helmet';
import cors from 'cors';
import { config } from '../config/env.js';

export function setupSecurityMiddleware(app) {
  // Helmet with cross-origin audio streaming support
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // Environment-driven CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, native media players, server-to-server)
        if (!origin || config.ALLOWED_ORIGINS.includes(origin) || !config.IS_PROD) {
          callback(null, true);
        } else {
          callback(new Error('Blocked by CORS policy'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
      exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
    })
  );
}
