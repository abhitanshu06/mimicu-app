import { apiClient, getApiBaseUrl } from './client.js';
import { TRACKS, getTrackById } from '../../data/tracks.js';

/**
 * Fetch all tracks from API with fallback to canonical dataset
 * @returns {Promise<Array>}
 */
export async function fetchTracks() {
  try {
    const res = await apiClient('/tracks');
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.warn('[API:Tracks] Backend unavailable or failed, using canonical dataset:', err.message);
  }
  return TRACKS;
}

/**
 * Fetch a single track by ID with fallback
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchTrackById(id) {
  if (!id) return null;
  try {
    const res = await apiClient(`/tracks/${encodeURIComponent(id)}`);
    if (res && res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn(`[API:Tracks] Failed to fetch track "${id}", using fallback:`, err.message);
  }
  return getTrackById(id);
}

/**
 * Get HTTP streaming URL for a track
 * @param {string} trackId
 * @returns {string}
 */
export function getAudioStreamUrl(trackId) {
  if (!trackId) return '';
  return `${getApiBaseUrl()}/audio/${encodeURIComponent(trackId)}`;
}
