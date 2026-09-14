import { getAllPlaylists, getPlaylist } from '../services/playlistService.js';

export async function getPlaylists(req, res, next) {
  try {
    const playlists = await getAllPlaylists();
    res.json({
      success: true,
      count: playlists.length,
      data: playlists,
      meta: {
        total: playlists.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylistById(req, res, next) {
  try {
    const { id } = req.params;
    const playlist = await getPlaylist(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Playlist "${id}" not found.`,
        },
      });
    }

    res.json({
      success: true,
      data: playlist,
    });
  } catch (err) {
    next(err);
  }
}
