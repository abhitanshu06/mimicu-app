import {
  getUserPlaylists,
  getUserPlaylistById,
  createUserPlaylist,
  updateUserPlaylist,
  deleteUserPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
} from '../services/userPlaylistService.js';

export async function getPlaylists(req, res, next) {
  try {
    const playlists = await getUserPlaylists(req.user.id);
    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylist(req, res, next) {
  try {
    const playlist = await getUserPlaylistById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

export async function postPlaylist(req, res, next) {
  try {
    const { name, description, cover, trackIds } = req.body;
    const playlist = await createUserPlaylist(req.user.id, { name, description, cover, trackIds });
    res.status(201).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

export async function patchPlaylist(req, res, next) {
  try {
    const playlist = await updateUserPlaylist(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePlaylist(req, res, next) {
  try {
    await deleteUserPlaylist(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Playlist deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function postPlaylistTrack(req, res, next) {
  try {
    const { trackId } = req.body;
    const playlist = await addTrackToPlaylist(req.user.id, req.params.id, trackId);
    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePlaylistTrack(req, res, next) {
  try {
    const playlist = await removeTrackFromPlaylist(req.user.id, req.params.id, req.params.trackId);
    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}

export async function patchPlaylistReorder(req, res, next) {
  try {
    const { fromIndex, toIndex } = req.body;
    const playlist = await reorderPlaylistTracks(req.user.id, req.params.id, fromIndex, toIndex);
    res.status(200).json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}
