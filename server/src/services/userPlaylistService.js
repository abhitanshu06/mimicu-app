import { Playlist } from '../models/Playlist.js';
import { isDBConnected } from '../config/db.js';
import { getTrackById } from '../../../src/data/tracks.js';

// In-memory fallback playlists
const memoryPlaylists = new Map();

/**
 * Get all playlists owned by user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserPlaylists(userId) {
  if (isDBConnected()) {
    const playlists = await Playlist.find({ ownerId: userId }).lean();
    return playlists || [];
  }

  const userPlaylists = [];
  for (const pl of memoryPlaylists.values()) {
    if (pl.ownerId === userId) {
      userPlaylists.push(pl);
    }
  }
  return userPlaylists;
}

/**
 * Get single playlist by ID with ownership verification
 * @param {string} userId
 * @param {string} playlistId
 * @returns {Promise<Object>}
 */
export async function getUserPlaylistById(userId, playlistId) {
  let playlist;
  if (isDBConnected()) {
    playlist = await Playlist.findOne({ id: playlistId }).lean();
  } else {
    playlist = memoryPlaylists.get(playlistId);
  }

  if (!playlist) {
    const err = new Error(`Playlist "${playlistId}" not found`);
    err.status = 404;
    err.code = 'PLAYLIST_NOT_FOUND';
    throw err;
  }

  if (playlist.ownerId !== userId) {
    const err = new Error('You do not have permission to access or modify this playlist');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return playlist;
}

/**
 * Create a new user-owned playlist
 * @param {string} userId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createUserPlaylist(userId, { name, description = '', cover = '', trackIds = [] }) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    const err = new Error('Playlist name is required');
    err.status = 400;
    err.code = 'INVALID_PLAYLIST_NAME';
    throw err;
  }

  const id = `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const validTracks = (Array.isArray(trackIds) ? trackIds : []).filter((tid) => Boolean(getTrackById(tid)));

  const defaultCover =
    cover ||
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)';

  const docData = {
    id,
    name: name.trim(),
    description: description.trim(),
    cover: defaultCover,
    trackIds: validTracks,
    ownerId: userId,
  };

  if (isDBConnected()) {
    const created = await Playlist.create(docData);
    return created.toJSON();
  }

  const memoryDoc = { ...docData, createdAt: new Date(), updatedAt: new Date() };
  memoryPlaylists.set(id, memoryDoc);
  return memoryDoc;
}

/**
 * Update user playlist metadata
 * @param {string} userId
 * @param {string} playlistId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateUserPlaylist(userId, playlistId, { name, description, cover }) {
  // Check ownership
  await getUserPlaylistById(userId, playlistId);

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (cover !== undefined) updates.cover = cover.trim();

  if (isDBConnected()) {
    const updated = await Playlist.findOneAndUpdate(
      { id: playlistId },
      { $set: updates },
      { new: true }
    ).lean();
    return updated;
  }

  const pl = memoryPlaylists.get(playlistId);
  Object.assign(pl, updates, { updatedAt: new Date() });
  memoryPlaylists.set(playlistId, pl);
  return pl;
}

/**
 * Delete user playlist
 * @param {string} userId
 * @param {string} playlistId
 * @returns {Promise<boolean>}
 */
export async function deleteUserPlaylist(userId, playlistId) {
  // Check ownership
  await getUserPlaylistById(userId, playlistId);

  if (isDBConnected()) {
    await Playlist.deleteOne({ id: playlistId });
    return true;
  }

  memoryPlaylists.delete(playlistId);
  return true;
}

/**
 * Add track to playlist (deduplicated)
 * @param {string} userId
 * @param {string} playlistId
 * @param {string} trackId
 * @returns {Promise<Object>}
 */
export async function addTrackToPlaylist(userId, playlistId, trackId) {
  const pl = await getUserPlaylistById(userId, playlistId);
  const track = getTrackById(trackId);
  if (!track) {
    const err = new Error(`Track "${trackId}" not found`);
    err.status = 404;
    err.code = 'TRACK_NOT_FOUND';
    throw err;
  }

  if (isDBConnected()) {
    const updated = await Playlist.findOneAndUpdate(
      { id: playlistId },
      { $addToSet: { trackIds: trackId } },
      { new: true }
    ).lean();
    return updated;
  }

  if (!pl.trackIds.includes(trackId)) {
    pl.trackIds.push(trackId);
    pl.updatedAt = new Date();
  }
  return pl;
}

/**
 * Remove track from playlist
 * @param {string} userId
 * @param {string} playlistId
 * @param {string} trackId
 * @returns {Promise<Object>}
 */
export async function removeTrackFromPlaylist(userId, playlistId, trackId) {
  const pl = await getUserPlaylistById(userId, playlistId);

  if (isDBConnected()) {
    const updated = await Playlist.findOneAndUpdate(
      { id: playlistId },
      { $pull: { trackIds: trackId } },
      { new: true }
    ).lean();
    return updated;
  }

  pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
  pl.updatedAt = new Date();
  return pl;
}

/**
 * Reorder tracks in playlist
 * @param {string} userId
 * @param {string} playlistId
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Promise<Object>}
 */
export async function reorderPlaylistTracks(userId, playlistId, fromIndex, toIndex) {
  const pl = await getUserPlaylistById(userId, playlistId);
  const tracks = [...pl.trackIds];

  if (fromIndex < 0 || fromIndex >= tracks.length || toIndex < 0 || toIndex >= tracks.length) {
    const err = new Error('Invalid track indices for reordering');
    err.status = 400;
    err.code = 'INVALID_INDEX';
    throw err;
  }

  const [moved] = tracks.splice(fromIndex, 1);
  tracks.splice(toIndex, 0, moved);

  if (isDBConnected()) {
    const updated = await Playlist.findOneAndUpdate(
      { id: playlistId },
      { $set: { trackIds: tracks } },
      { new: true }
    ).lean();
    return updated;
  }

  pl.trackIds = tracks;
  pl.updatedAt = new Date();
  return pl;
}
