import { User } from '../models/User.js';
import { Playlist } from '../models/Playlist.js';
import { isDBConnected } from '../config/db.js';
import { getTrackById } from '../../../src/data/tracks.js';
import { VIBES } from '../../../src/config/vibes.js';

// In-memory fallback library store for offline/mock development
const memoryLibraries = new Map();

function getMemoryLib(userId) {
  if (!memoryLibraries.has(userId)) {
    memoryLibraries.set(userId, {
      likedTrackIds: [],
      savedVibeIds: [],
      recentlyPlayed: [],
    });
  }
  return memoryLibraries.get(userId);
}

/**
 * Get aggregate user library
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserLibrary(userId) {
  if (isDBConnected()) {
    const user = await User.findOne({ id: userId }).lean();
    const playlists = await Playlist.find({ ownerId: userId }).lean();

    return {
      likedTrackIds: user?.likedTrackIds || [],
      savedVibeIds: user?.savedVibeIds || [],
      recentlyPlayed: user?.recentlyPlayed || [],
      playlists: playlists || [],
    };
  }

  const lib = getMemoryLib(userId);
  return {
    likedTrackIds: lib.likedTrackIds,
    savedVibeIds: lib.savedVibeIds,
    recentlyPlayed: lib.recentlyPlayed,
    playlists: [],
  };
}

/**
 * Like a track (idempotent)
 * @param {string} userId
 * @param {string} trackId
 */
export async function likeTrack(userId, trackId) {
  const track = getTrackById(trackId);
  if (!track) {
    const err = new Error(`Track "${trackId}" not found`);
    err.status = 404;
    err.code = 'TRACK_NOT_FOUND';
    throw err;
  }

  if (isDBConnected()) {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $addToSet: { likedTrackIds: trackId } },
      { new: true }
    ).lean();
    return user?.likedTrackIds || [];
  }

  const lib = getMemoryLib(userId);
  if (!lib.likedTrackIds.includes(trackId)) {
    lib.likedTrackIds.push(trackId);
  }
  return lib.likedTrackIds;
}

/**
 * Unlike a track (idempotent)
 * @param {string} userId
 * @param {string} trackId
 */
export async function unlikeTrack(userId, trackId) {
  if (isDBConnected()) {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $pull: { likedTrackIds: trackId } },
      { new: true }
    ).lean();
    return user?.likedTrackIds || [];
  }

  const lib = getMemoryLib(userId);
  lib.likedTrackIds = lib.likedTrackIds.filter((id) => id !== trackId);
  return lib.likedTrackIds;
}

/**
 * Save a vibe (idempotent, validates against canonical 15 vibes)
 * @param {string} userId
 * @param {string} vibeId
 */
export async function saveVibe(userId, vibeId) {
  if (!VIBES[vibeId]) {
    const err = new Error(`Vibe "${vibeId}" is not one of the 15 canonical vibes`);
    err.status = 404;
    err.code = 'VIBE_NOT_FOUND';
    throw err;
  }

  if (isDBConnected()) {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $addToSet: { savedVibeIds: vibeId } },
      { new: true }
    ).lean();
    return user?.savedVibeIds || [];
  }

  const lib = getMemoryLib(userId);
  if (!lib.savedVibeIds.includes(vibeId)) {
    lib.savedVibeIds.push(vibeId);
  }
  return lib.savedVibeIds;
}

/**
 * Unsave a vibe (idempotent)
 * @param {string} userId
 * @param {string} vibeId
 */
export async function unsaveVibe(userId, vibeId) {
  if (isDBConnected()) {
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $pull: { savedVibeIds: vibeId } },
      { new: true }
    ).lean();
    return user?.savedVibeIds || [];
  }

  const lib = getMemoryLib(userId);
  lib.savedVibeIds = lib.savedVibeIds.filter((id) => id !== vibeId);
  return lib.savedVibeIds;
}

/**
 * Record a recently played track
 * Bumps to front and caps history at 50 items
 * @param {string} userId
 * @param {string} trackId
 */
export async function recordRecentPlay(userId, trackId) {
  const track = getTrackById(trackId);
  if (!track) {
    const err = new Error(`Track "${trackId}" not found`);
    err.status = 404;
    err.code = 'TRACK_NOT_FOUND';
    throw err;
  }

  const maxHistory = 50;
  const newEntry = { trackId, playedAt: new Date() };

  if (isDBConnected()) {
    // 1. Remove any previous occurrence
    await User.updateOne({ id: userId }, { $pull: { recentlyPlayed: { trackId } } });

    // 2. Prepend new entry and slice to maxHistory
    const user = await User.findOneAndUpdate(
      { id: userId },
      {
        $push: {
          recentlyPlayed: {
            $each: [newEntry],
            $position: 0,
            $slice: maxHistory,
          },
        },
      },
      { new: true }
    ).lean();

    return user?.recentlyPlayed || [];
  }

  const lib = getMemoryLib(userId);
  lib.recentlyPlayed = [newEntry, ...lib.recentlyPlayed.filter((e) => e.trackId !== trackId)].slice(0, maxHistory);
  return lib.recentlyPlayed;
}

/**
 * Clear recently played history
 * @param {string} userId
 */
export async function clearRecentHistory(userId) {
  if (isDBConnected()) {
    await User.updateOne({ id: userId }, { $set: { recentlyPlayed: [] } });
    return [];
  }

  const lib = getMemoryLib(userId);
  lib.recentlyPlayed = [];
  return [];
}

/**
 * Sync & merge guest localStorage data into authenticated user account
 * @param {string} userId
 * @param {Object} guestData
 */
export async function syncGuestData(userId, { likedTrackIds = [], savedVibeIds = [], recentlyPlayed = [], playlists = [] }) {
  // Validate tracks and vibes
  const validLikes = likedTrackIds.filter((id) => Boolean(getTrackById(id)));
  const validVibes = savedVibeIds.filter((id) => Boolean(VIBES[id]));

  if (isDBConnected()) {
    // 1. Merge likes and vibes via $addToSet
    if (validLikes.length > 0) {
      await User.updateOne({ id: userId }, { $addToSet: { likedTrackIds: { $each: validLikes } } });
    }
    if (validVibes.length > 0) {
      await User.updateOne({ id: userId }, { $addToSet: { savedVibeIds: { $each: validVibes } } });
    }

    // 2. Merge recently played
    if (Array.isArray(recentlyPlayed) && recentlyPlayed.length > 0) {
      for (const item of recentlyPlayed.slice(0, 20)) {
        const trackId = typeof item === 'string' ? item : item.trackId;
        if (getTrackById(trackId)) {
          await recordRecentPlay(userId, trackId);
        }
      }
    }

    // 3. Migrate guest playlists
    if (Array.isArray(playlists) && playlists.length > 0) {
      for (const pl of playlists) {
        if (!pl.name) continue;
        const plId = pl.id && !pl.id.startsWith('playlist-starter') ? pl.id : `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const exists = await Playlist.findOne({ id: plId });
        if (!exists) {
          await Playlist.create({
            id: plId,
            name: pl.name,
            description: pl.description || '',
            cover: pl.cover || pl.coverArt || '',
            trackIds: pl.trackIds || [],
            ownerId: userId,
          });
        }
      }
    }

    return await getUserLibrary(userId);
  }

  // Offline/Mock fallback
  const lib = getMemoryLib(userId);
  for (const id of validLikes) {
    if (!lib.likedTrackIds.includes(id)) lib.likedTrackIds.push(id);
  }
  for (const id of validVibes) {
    if (!lib.savedVibeIds.includes(id)) lib.savedVibeIds.push(id);
  }
  return {
    likedTrackIds: lib.likedTrackIds,
    savedVibeIds: lib.savedVibeIds,
    recentlyPlayed: lib.recentlyPlayed,
    playlists: [],
  };
}
