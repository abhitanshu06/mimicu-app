import { isValidTrackId, resolveSafeAudioPath, streamAudioWithRange } from '../services/audioStreamService.js';
import { getTrack } from '../services/trackService.js';

/**
 * Audio Streaming Controller
 * Handles HTTP Range Requests for continuous seekable audio streaming
 */
export async function streamAudio(req, res, next) {
  try {
    const { trackId } = req.params;

    // 1. Security check: validate trackId structure (reject path traversal characters)
    if (!isValidTrackId(trackId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TRACK_ID',
          message: 'Invalid track identifier format.',
        },
      });
    }

    // 2. Resolve track metadata through trusted catalog
    const track = await getTrack(trackId);
    if (!track) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Track "${trackId}" not found.`,
        },
      });
    }

    // 3. Resolve safe filesystem path within AUDIO_STORAGE_PATH
    const safePath = resolveSafeAudioPath(track.audioFile || track.id);
    if (!safePath) {
      return res.status(404).json({
        error: {
          code: 'AUDIO_NOT_FOUND',
          message: `Audio file for track "${trackId}" is not available on server storage.`,
        },
      });
    }

    // 4. Stream audio with Range support (200 / 206 / 416)
    streamAudioWithRange(safePath, req, res);
  } catch (err) {
    next(err);
  }
}
