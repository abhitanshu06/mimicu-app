import { apiClient } from './client.js';

const DEMO_PLAYLISTS = [
  {
    id: 'playlist-late-night-lofi',
    name: 'Midnight Tapri Lo-Fi',
    description: 'Curated acoustic and lo-fi cuts for quiet hours.',
    cover: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #f59e0b 100%)',
    trackIds: ['track-3am-1', 'track-chai-1', 'track-focus-2'],
    ownerId: 'guest-user',
  },
];

/**
 * Fetch all playlists from API with fallback
 * @returns {Promise<Array>}
 */
export async function fetchPlaylists() {
  try {
    const res = await apiClient('/playlists');
    if (res && res.success && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (err) {
    console.warn('[API:Playlists] Backend unavailable or failed, using demo fallback:', err.message);
  }
  return DEMO_PLAYLISTS;
}

/**
 * Fetch a single playlist by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function fetchPlaylistById(id) {
  if (!id) return null;
  try {
    const res = await apiClient(`/playlists/${encodeURIComponent(id)}`);
    if (res && res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.warn(`[API:Playlists] Failed to fetch playlist "${id}":`, err.message);
  }
  return DEMO_PLAYLISTS.find((p) => p.id === id) || null;
}
