import { apiClient } from './client.js';
import { VIBES, VIBE_LIST } from '../../config/vibes.js';

/**
 * Fetch all 15 canonical vibes from API with fallback
 * @returns {Promise<Array>}
 */
export async function fetchVibes() {
  try {
    const res = await apiClient('/vibes');
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    console.warn('[API:Vibes] Backend unavailable or failed, using canonical dataset:', err.message);
  }
  return VIBE_LIST;
}

/**
 * Fetch a single vibe by ID with fallback
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchVibeById(id) {
  if (!id) return null;
  try {
    const res = await apiClient(`/vibes/${encodeURIComponent(id)}`);
    if (res && res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn(`[API:Vibes] Failed to fetch vibe "${id}", using fallback:`, err.message);
  }
  return VIBES[id] || null;
}
