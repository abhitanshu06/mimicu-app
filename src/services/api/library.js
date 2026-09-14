import { apiClient } from './client.js';

/**
 * Fetch full user library
 * @returns {Promise<Object>}
 */
export async function fetchLibraryApi() {
  const res = await apiClient('/me/library');
  return res.data;
}

/**
 * Like a track
 * @param {string} trackId
 * @returns {Promise<Array<string>>}
 */
export async function likeTrackApi(trackId) {
  const res = await apiClient(`/me/liked/${encodeURIComponent(trackId)}`, {
    method: 'POST',
  });
  return res.data;
}

/**
 * Unlike a track
 * @param {string} trackId
 * @returns {Promise<Array<string>>}
 */
export async function unlikeTrackApi(trackId) {
  const res = await apiClient(`/me/liked/${encodeURIComponent(trackId)}`, {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Record recently played track
 * @param {string} trackId
 * @returns {Promise<Array>}
 */
export async function recordRecentPlayApi(trackId) {
  const res = await apiClient(`/me/recent/${encodeURIComponent(trackId)}`, {
    method: 'POST',
  });
  return res.data;
}

/**
 * Clear recently played history
 * @returns {Promise<Array>}
 */
export async function clearRecentHistoryApi() {
  const res = await apiClient('/me/recent', {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Save a vibe
 * @param {string} vibeId
 * @returns {Promise<Array<string>>}
 */
export async function saveVibeApi(vibeId) {
  const res = await apiClient(`/me/vibes/${encodeURIComponent(vibeId)}`, {
    method: 'POST',
  });
  return res.data;
}

/**
 * Unsave a vibe
 * @param {string} vibeId
 * @returns {Promise<Array<string>>}
 */
export async function unsaveVibeApi(vibeId) {
  const res = await apiClient(`/me/vibes/${encodeURIComponent(vibeId)}`, {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Sync guest localStorage data into authenticated user library
 * @param {Object} guestData
 * @returns {Promise<Object>}
 */
export async function syncLibraryApi(guestData) {
  const res = await apiClient('/me/library/sync', {
    method: 'POST',
    body: JSON.stringify(guestData),
  });
  return res.data;
}
