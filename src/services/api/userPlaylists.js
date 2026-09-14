import { apiClient } from './client.js';

/**
 * Fetch all user-owned playlists
 * @returns {Promise<Array>}
 */
export async function fetchUserPlaylistsApi() {
  const res = await apiClient('/me/playlists');
  return res.data;
}

/**
 * Fetch single user playlist
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function fetchUserPlaylistByIdApi(id) {
  const res = await apiClient(`/me/playlists/${encodeURIComponent(id)}`);
  return res.data;
}

/**
 * Create a new user playlist
 * @param {Object} data - { name, description, cover, trackIds }
 * @returns {Promise<Object>}
 */
export async function createUserPlaylistApi(data) {
  const res = await apiClient('/me/playlists', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Update user playlist metadata
 * @param {string} id
 * @param {Object} data - { name, description, cover }
 * @returns {Promise<Object>}
 */
export async function updateUserPlaylistApi(id, data) {
  const res = await apiClient(`/me/playlists/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.data;
}

/**
 * Delete a user playlist
 * @param {string} id
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteUserPlaylistApi(id) {
  return await apiClient(`/me/playlists/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/**
 * Add track to playlist
 * @param {string} playlistId
 * @param {string} trackId
 * @returns {Promise<Object>}
 */
export async function addTrackToUserPlaylistApi(playlistId, trackId) {
  const res = await apiClient(`/me/playlists/${encodeURIComponent(playlistId)}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ trackId }),
  });
  return res.data;
}

/**
 * Remove track from playlist
 * @param {string} playlistId
 * @param {string} trackId
 * @returns {Promise<Object>}
 */
export async function removeTrackFromUserPlaylistApi(playlistId, trackId) {
  const res = await apiClient(
    `/me/playlists/${encodeURIComponent(playlistId)}/tracks/${encodeURIComponent(trackId)}`,
    {
      method: 'DELETE',
    }
  );
  return res.data;
}

/**
 * Reorder playlist tracks
 * @param {string} playlistId
 * @param {number} fromIndex
 * @param {number} toIndex
 * @returns {Promise<Object>}
 */
export async function reorderUserPlaylistTracksApi(playlistId, fromIndex, toIndex) {
  const res = await apiClient(`/me/playlists/${encodeURIComponent(playlistId)}/tracks/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ fromIndex, toIndex }),
  });
  return res.data;
}
