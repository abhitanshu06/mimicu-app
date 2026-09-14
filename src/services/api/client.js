/**
 * Centralized API Client for Mimicu
 * Provides resilient HTTP requests with timeout, error normalization, and fallback capability.
 */

const BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) || '/api';

/**
 * Get current API base URL
 * @returns {string}
 */
export function getApiBaseUrl() {
  return BASE_URL;
}

/**
 * Execute HTTP fetch request with timeout and error handling
 * @param {string} endpoint
 * @param {RequestInit & { timeout?: number }} options
 * @returns {Promise<any>}
 */
export async function apiClient(endpoint, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: 'include',
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        errorBody.error || errorBody.message || `Request failed with status ${response.status}`
      );
      error.status = response.status;
      error.data = errorBody;
      throw error;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Request timed out after ${timeout}ms`);
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    }
    throw err;
  }
}
