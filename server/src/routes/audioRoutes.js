import { Router } from 'express';
import { streamAudio } from '../controllers/audioController.js';

const router = Router();

// GET /api/audio/:trackId - HTTP Range streaming
router.get('/:trackId', streamAudio);

export default router;
