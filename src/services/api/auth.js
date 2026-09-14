import { apiClient } from './client.js';

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function registerApi(name, email, password) {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Log in with existing credentials
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object, token: string }>}
 */
export async function loginApi(email, password) {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Log out and clear session cookie
 * @returns {Promise<{ success: boolean }>}
 */
export async function logoutApi() {
  return await apiClient('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Fetch current authenticated user session
 * @returns {Promise<{ success: boolean, user: Object }>}
 */
export async function fetchCurrentUserApi() {
  return await apiClient('/auth/me');
}

/**
 * Update user profile
 * @param {Object} data - { name, avatar }
 * @returns {Promise<{ success: boolean, user: Object }>}
 */
export async function updateProfileApi(data) {
  return await apiClient('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
