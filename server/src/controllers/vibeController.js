import { getAllVibes, getVibe } from '../services/vibeService.js';

export async function getVibes(req, res, next) {
  try {
    const vibes = await getAllVibes();
    res.json({
      success: true,
      count: vibes.length,
      data: vibes,
      meta: {
        total: vibes.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getVibeById(req, res, next) {
  try {
    const { id } = req.params;
    const vibe = await getVibe(id);

    if (!vibe) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Vibe "${id}" not found.`,
        },
      });
    }

    res.json({
      success: true,
      data: vibe,
    });
  } catch (err) {
    next(err);
  }
}
