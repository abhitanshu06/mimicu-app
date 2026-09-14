import {
  getUserLibrary,
  likeTrack,
  unlikeTrack,
  saveVibe,
  unsaveVibe,
  recordRecentPlay,
  clearRecentHistory,
  syncGuestData,
} from '../services/userLibraryService.js';
import { getTrackById } from '../../../src/data/tracks.js';
import { VIBES } from '../../../src/config/vibes.js';

export async function getLibrary(req, res, next) {
  try {
    const library = await getUserLibrary(req.user.id);
    res.status(200).json({
      success: true,
      data: library,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLikedTracks(req, res, next) {
  try {
    const library = await getUserLibrary(req.user.id);
    const { resolve } = req.query;

    if (resolve === 'true') {
      const tracks = library.likedTrackIds
        .map((tid) => getTrackById(tid))
        .filter(Boolean);
      return res.status(200).json({
        success: true,
        count: tracks.length,
        data: tracks,
      });
    }

    res.status(200).json({
      success: true,
      count: library.likedTrackIds.length,
      data: library.likedTrackIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function postLikedTrack(req, res, next) {
  try {
    const { trackId } = req.params;
    const likedTrackIds = await likeTrack(req.user.id, trackId);
    res.status(200).json({
      success: true,
      message: 'Track liked successfully',
      data: likedTrackIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteLikedTrack(req, res, next) {
  try {
    const { trackId } = req.params;
    const likedTrackIds = await unlikeTrack(req.user.id, trackId);
    res.status(200).json({
      success: true,
      message: 'Track unliked successfully',
      data: likedTrackIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecentTracks(req, res, next) {
  try {
    const library = await getUserLibrary(req.user.id);
    const { resolve } = req.query;

    if (resolve === 'true') {
      const resolved = library.recentlyPlayed
        .map((item) => {
          const track = getTrackById(item.trackId);
          return track ? { ...track, playedAt: item.playedAt } : null;
        })
        .filter(Boolean);

      return res.status(200).json({
        success: true,
        count: resolved.length,
        data: resolved,
      });
    }

    res.status(200).json({
      success: true,
      count: library.recentlyPlayed.length,
      data: library.recentlyPlayed,
    });
  } catch (err) {
    next(err);
  }
}

export async function postRecentTrack(req, res, next) {
  try {
    const { trackId } = req.params;
    const recentlyPlayed = await recordRecentPlay(req.user.id, trackId);
    res.status(200).json({
      success: true,
      data: recentlyPlayed,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecentHistory(req, res, next) {
  try {
    await clearRecentHistory(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Recently played history cleared',
      data: [],
    });
  } catch (err) {
    next(err);
  }
}

export async function getSavedVibes(req, res, next) {
  try {
    const library = await getUserLibrary(req.user.id);
    const { resolve } = req.query;

    if (resolve === 'true') {
      const vibes = library.savedVibeIds.map((vid) => VIBES[vid]).filter(Boolean);
      return res.status(200).json({
        success: true,
        count: vibes.length,
        data: vibes,
      });
    }

    res.status(200).json({
      success: true,
      count: library.savedVibeIds.length,
      data: library.savedVibeIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function postSavedVibe(req, res, next) {
  try {
    const { vibeId } = req.params;
    const savedVibeIds = await saveVibe(req.user.id, vibeId);
    res.status(200).json({
      success: true,
      message: 'Vibe saved successfully',
      data: savedVibeIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedVibe(req, res, next) {
  try {
    const { vibeId } = req.params;
    const savedVibeIds = await unsaveVibe(req.user.id, vibeId);
    res.status(200).json({
      success: true,
      message: 'Vibe unsaved successfully',
      data: savedVibeIds,
    });
  } catch (err) {
    next(err);
  }
}

export async function syncLibrary(req, res, next) {
  try {
    const merged = await syncGuestData(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Library synced successfully',
      data: merged,
    });
  } catch (err) {
    next(err);
  }
}
