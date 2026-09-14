import { Track } from '../models/Track.js';
import { isDBConnected } from '../config/db.js';
import { TRACKS, getTrackById } from '../../../src/data/tracks.js';

/**
 * Fetch all tracks
 * @returns {Promise<Array>}
 */
export async function getAllTracks() {
  if (isDBConnected()) {
    try {
      const dbTracks = await Track.find().lean();
      if (dbTracks && dbTracks.length > 0) {
        return dbTracks;
      }
    } catch (err) {
      console.warn('[TrackService] DB query failed, using canonical dataset:', err.message);
    }
  }

  // Canonical fallback
  return TRACKS;
}

/**
 * Fetch a single track by canonical ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getTrack(id) {
  if (!id) return null;

  if (isDBConnected()) {
    try {
      const dbTrack = await Track.findOne({ id }).lean();
      if (dbTrack) return dbTrack;
    } catch (err) {
      console.warn(`[TrackService] DB query for "${id}" failed, using fallback:`, err.message);
    }
  }

  // Canonical fallback
  return getTrackById(id);
}
