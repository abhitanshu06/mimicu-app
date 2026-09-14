import { config } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // Prevent duplicate headers
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const isProd = config.IS_PROD;

  if (!isProd && statusCode === 500) {
    console.error('[ServerError]', err);
  }

  res.status(statusCode).json({
    error: {
      code: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR'),
      message: isProd && statusCode === 500 ? 'An internal server error occurred.' : (err.message || 'Error processing request'),
    },
  });
}
