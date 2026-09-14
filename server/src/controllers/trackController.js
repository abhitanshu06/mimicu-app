import { getAllTracks, getTrack } from '../services/trackService.js';

export async function getTracks(req, res, next) {
  try {
    const tracks = await getAllTracks();
    res.json({
      success: true,
      count: tracks.length,
      data: tracks,
      meta: {
        total: tracks.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTrackById(req, res, next) {
  try {
    const { id } = req.params;
    const track = await getTrack(id);

    if (!track) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Track "${id}" not found.`,
        },
      });
    }

    res.json({
      success: true,
      data: track,
    });
  } catch (err) {
    next(err);
  }
}
