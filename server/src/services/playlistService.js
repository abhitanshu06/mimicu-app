import { Playlist } from '../models/Playlist.js';
import { isDBConnected } from '../config/db.js';

// Default demo playlists for initial local state
const DEFAULT_DEMO_PLAYLISTS = [
  {
    id: 'playlist-late-night-lofi',
    name: 'Midnight Tapri Lo-Fi',
    description: 'Curated acoustic and lo-fi cuts for quiet hours.',
    cover: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #f59e0b 100%)',
    trackIds: ['track-3am-1', 'track-chai-1', 'track-focus-2'],
    ownerId: 'guest-user',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Fetch all playlists
 * @returns {Promise<Array>}
 */
export async function getAllPlaylists() {
  if (isDBConnected()) {
    try {
      const dbPlaylists = await Playlist.find().lean();
      return dbPlaylists || [];
    } catch (err) {
      console.warn('[PlaylistService] DB query failed, using demo fallback:', err.message);
    }
  }

  return DEFAULT_DEMO_PLAYLISTS;
}

/**
 * Fetch a single playlist by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getPlaylist(id) {
  if (!id) return null;

  if (isDBConnected()) {
    try {
      const dbPlaylist = await Playlist.findOne({ id }).lean();
      if (dbPlaylist) return dbPlaylist;
    } catch (err) {
      console.warn(`[PlaylistService] DB query for "${id}" failed:`, err.message);
    }
  }

  return DEFAULT_DEMO_PLAYLISTS.find((p) => p.id === id) || null;
}
