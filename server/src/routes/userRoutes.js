import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getLibrary,
  getLikedTracks,
  postLikedTrack,
  deleteLikedTrack,
  getRecentTracks,
  postRecentTrack,
  deleteRecentHistory,
  getSavedVibes,
  postSavedVibe,
  deleteSavedVibe,
  syncLibrary,
} from '../controllers/userLibraryController.js';
import {
  getPlaylists,
  getPlaylist,
  postPlaylist,
  patchPlaylist,
  deletePlaylist,
  postPlaylistTrack,
  deletePlaylistTrack,
  patchPlaylistReorder,
} from '../controllers/userPlaylistController.js';

const router = Router();

// All /api/me endpoints require authenticated user session
router.use(requireAuth);

// 1. Library Aggregate & Sync
router.get('/library', getLibrary);
router.post('/library/sync', syncLibrary);

// 2. Liked Tracks
router.get('/liked', getLikedTracks);
router.post('/liked/:trackId', postLikedTrack);
router.delete('/liked/:trackId', deleteLikedTrack);

// 3. Recently Played
router.get('/recent', getRecentTracks);
router.post('/recent/:trackId', postRecentTrack);
router.delete('/recent', deleteRecentHistory);

// 4. Saved Vibes
router.get('/vibes', getSavedVibes);
router.post('/vibes/:vibeId', postSavedVibe);
router.delete('/vibes/:vibeId', deleteSavedVibe);

// 5. User Playlists
router.get('/playlists', getPlaylists);
router.post('/playlists', postPlaylist);
router.get('/playlists/:id', getPlaylist);
router.patch('/playlists/:id', patchPlaylist);
router.delete('/playlists/:id', deletePlaylist);
router.post('/playlists/:id/tracks', postPlaylistTrack);
router.delete('/playlists/:id/tracks/:trackId', deletePlaylistTrack);
router.patch('/playlists/:id/tracks/reorder', patchPlaylistReorder);

export default router;
