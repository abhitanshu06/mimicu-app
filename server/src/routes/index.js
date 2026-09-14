import { Router } from 'express';
import trackRoutes from './trackRoutes.js';
import vibeRoutes from './vibeRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import audioRoutes from './audioRoutes.js';
import { isDBConnected } from '../config/db.js';

import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

const apiRouter = Router();

// GET /api/health
apiRouter.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'mimicu-api',
    database: isDBConnected() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Resource routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/me', userRoutes);
apiRouter.use('/tracks', trackRoutes);
apiRouter.use('/vibes', vibeRoutes);
apiRouter.use('/playlists', playlistRoutes);
apiRouter.use('/audio', audioRoutes);

export default apiRouter;
