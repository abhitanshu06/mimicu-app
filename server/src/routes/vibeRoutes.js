import { Router } from 'express';
import { getVibes, getVibeById } from '../controllers/vibeController.js';

const router = Router();

router.get('/', getVibes);
router.get('/:id', getVibeById);

export default router;
