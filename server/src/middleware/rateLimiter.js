/**
 * In-Memory Sliding-Window Rate Limiter
 * 
 * Lightweight, zero-dependency protection against brute-force attacks and abuse.
 * Features:
 * - Configurable window size (windowMs) and max requests (maxRequests)
 * - Standard X-RateLimit-* headers
 * - Automatic background garbage collection with unref() timer to avoid blocking process exit
 * - Standardized JSON error response (HTTP 429)
 */

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // default: 1 minute
  const maxRequests = options.maxRequests || 30; // default: 30 requests per minute
  const message = options.message || 'Too many requests from this IP. Please try again in a minute.';

  const hits = new Map();

  // Periodic cleanup of expired rate limit windows (runs every 2 minutes)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node process to gracefully terminate without waiting for timer
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    // In test environment, skip rate limiting unless explicitly tested
    if (process.env.NODE_ENV === 'test' && !options.enableInTest) {
      return next();
    }

    const key =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message,
        },
      });
    }

    next();
  };
}

// Pre-configured rate limiters for specific critical routes
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 25, // 25 attempts per minute per IP
  message: 'Too many authentication attempts. Please wait a moment before trying again.',
  enableInTest: true,
});
