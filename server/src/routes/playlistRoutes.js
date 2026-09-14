import { Router } from 'express';
import { getPlaylists, getPlaylistById } from '../controllers/playlistController.js';

const router = Router();

router.get('/', getPlaylists);
router.get('/:id', getPlaylistById);

export default router;
