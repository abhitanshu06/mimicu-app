import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { isDBConnected } from '../config/db.js';

/**
 * Extract token from request cookies or Authorization header
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export function extractToken(req) {
  // 1. Check HTTP-only cookie
  if (req.cookies && (req.cookies.token || req.cookies.mimicu_auth_token)) {
    return req.cookies.token || req.cookies.mimicu_auth_token;
  }

  // 2. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Required Authentication Middleware
 * Validates JWT, verifies user, and attaches req.user
 */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required to access this resource',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    if (!userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid session token payload',
        },
      });
    }

    if (isDBConnected()) {
      const user = await User.findOne({ id: userId }).lean();
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User account not found or session expired',
          },
        });
      }
      delete user.passwordHash;
      delete user._id;
      delete user.__v;
      req.user = user;
    } else {
      // In disconnected/test mock state, attach decoded payload identity
      req.user = {
        id: userId,
        email: decoded.email || 'user@mimicu.internal',
        name: decoded.name || 'Mimicu Explorer',
        avatar: decoded.avatar || '',
      };
    }

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid session token',
      },
    });
  }
}

/**
 * Optional Authentication Middleware
 * Attaches req.user if valid token present, does not reject if missing
 */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    if (userId) {
      if (isDBConnected()) {
        const user = await User.findOne({ id: userId }).lean();
        if (user) {
          delete user.passwordHash;
          delete user._id;
          delete user.__v;
          req.user = user;
        }
      } else {
        req.user = {
          id: userId,
          email: decoded.email || 'user@mimicu.internal',
          name: decoded.name || 'Mimicu Explorer',
        };
      }
    }
  } catch (_) {
    // Ignore invalid optional tokens
  }

  next();
}
