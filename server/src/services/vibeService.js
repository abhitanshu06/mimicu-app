import { Vibe } from '../models/Vibe.js';
import { isDBConnected } from '../config/db.js';
import { VIBES, VIBE_LIST } from '../../../src/config/vibes.js';

/**
 * Fetch all 15 canonical vibes
 * @returns {Promise<Array>}
 */
export async function getAllVibes() {
  if (isDBConnected()) {
    try {
      const dbVibes = await Vibe.find().lean();
      if (dbVibes && dbVibes.length > 0) {
        return dbVibes;
      }
    } catch (err) {
      console.warn('[VibeService] DB query failed, using canonical dataset:', err.message);
    }
  }

  // Canonical fallback (exact 15 vibes)
  return VIBE_LIST;
}

/**
 * Fetch a single vibe by canonical ID or alias
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getVibe(id) {
  if (!id) return null;

  if (isDBConnected()) {
    try {
      const dbVibe = await Vibe.findOne({ id }).lean();
      if (dbVibe) return dbVibe;
    } catch (err) {
      console.warn(`[VibeService] DB query for "${id}" failed, using fallback:`, err.message);
    }
  }

  // Canonical fallback
  return VIBES[id] || null;
}
