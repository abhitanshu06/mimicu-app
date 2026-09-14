import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { config } from '../config/env.js';

// In-memory fallback map for offline/dev test resilience
const memoryUsers = new Map();

/**
 * Generate a JWT token with minimal identity payload
 * @param {Object} user
 * @returns {string}
 */
export function generateAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN || '7d',
    }
  );
}

/**
 * Cookie options for secure HTTP-only session token
 */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: config.IS_PROD,
    sameSite: config.IS_PROD ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
}

/**
 * Register a new user
 * @param {Object} param0
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function registerUser({ name, email, password }) {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    const err = new Error('Name must be at least 2 characters');
    err.status = 400;
    err.code = 'INVALID_NAME';
    throw err;
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    const err = new Error('Please provide a valid email address');
    err.status = 400;
    err.code = 'INVALID_EMAIL';
    throw err;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const err = new Error('Password must be at least 6 characters');
    err.status = 400;
    err.code = 'INVALID_PASSWORD';
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  if (isDBConnected()) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
  } else if (memoryUsers.has(normalizedEmail)) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const avatarGradients = [
    'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
    'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  ];
  const avatar = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

  let newUser;

  if (isDBConnected()) {
    newUser = await User.create({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      avatar,
      likedTrackIds: [],
      recentlyPlayed: [],
      savedVibeIds: [],
      playlistIds: [],
    });
    newUser = newUser.toJSON();
  } else {
    newUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      avatar,
      passwordHash,
      likedTrackIds: [],
      recentlyPlayed: [],
      savedVibeIds: [],
      playlistIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryUsers.set(normalizedEmail, newUser);
    // Sanitize copy
    const sanitized = { ...newUser };
    delete sanitized.passwordHash;
    newUser = sanitized;
  }

  const token = generateAuthToken(newUser);
  return { user: newUser, token };
}

/**
 * Authenticate existing user with email and password
 * @param {Object} param0
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    err.code = 'MISSING_CREDENTIALS';
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();
  let userRecord;

  if (isDBConnected()) {
    userRecord = await User.findOne({ email: normalizedEmail });
  } else {
    userRecord = memoryUsers.get(normalizedEmail);
  }

  if (!userRecord) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  let sanitizedUser;
  if (isDBConnected()) {
    sanitizedUser = userRecord.toJSON();
  } else {
    sanitizedUser = { ...userRecord };
    delete sanitizedUser.passwordHash;
  }

  const token = generateAuthToken(sanitizedUser);
  return { user: sanitizedUser, token };
}

/**
 * Get user by canonical ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getUserById(id) {
  if (!id) return null;

  if (isDBConnected()) {
    const user = await User.findOne({ id }).lean();
    if (user) {
      delete user.passwordHash;
      delete user._id;
      delete user.__v;
      return user;
    }
  } else {
    for (const u of memoryUsers.values()) {
      if (u.id === id) {
        const copy = { ...u };
        delete copy.passwordHash;
        return copy;
      }
    }
  }

  return null;
}

/**
 * Update allowed profile fields
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateUserProfile(userId, { name, avatar }) {
  const allowed = {};
  if (name && typeof name === 'string' && name.trim().length >= 2) {
    allowed.name = name.trim();
  }
  if (avatar && typeof avatar === 'string') {
    allowed.avatar = avatar.trim();
  }

  if (isDBConnected()) {
    const updated = await User.findOneAndUpdate(
      { id: userId },
      { $set: allowed },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    delete updated.passwordHash;
    delete updated._id;
    delete updated.__v;
    return updated;
  } else {
    for (const [key, u] of memoryUsers.entries()) {
      if (u.id === userId) {
        Object.assign(u, allowed, { updatedAt: new Date() });
        memoryUsers.set(key, u);
        const copy = { ...u };
        delete copy.passwordHash;
        return copy;
      }
    }
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
}
