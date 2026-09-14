import { createApp } from './app.js';
import { config } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ensureDemoAudioFiles } from './utils/audioGenerator.js';
import { TRACKS } from '../../src/data/tracks.js';

const app = createApp();

let server = null;

async function startServer() {
  console.log('==================================================');
  console.log(`Starting Mimicu API Server in ${config.NODE_ENV} mode...`);
  console.log('==================================================');

  // 1. Initialize MongoDB Connection
  await connectDB();

  // 2. Ensure demo audio files exist in storage path for Range Streaming
  try {
    const trackIds = TRACKS.map((t) => t.id);
    await ensureDemoAudioFiles(trackIds);
  } catch (err) {
    console.warn('[AudioStorage] Notice ensuring audio assets:', err.message);
  }

  // 3. Start listening on configured port
  server = app.listen(config.PORT, () => {
    console.log(`✓ Mimicu API Server listening at http://localhost:${config.PORT}`);
    console.log(`✓ Health endpoint: http://localhost:${config.PORT}/api/health`);
    console.log(`✓ Audio streaming endpoint: http://localhost:${config.PORT}/api/audio/:trackId`);
  });

  // Graceful shutdown handlers
  const handleShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    if (server) {
      server.close(async () => {
        console.log('[Server] HTTP server stopped.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 5s timeout
      setTimeout(() => {
        console.error('[Server] Forcefully terminating after timeout.');
        process.exit(1);
      }, 5000);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[Server] Fatal error during startup:', err);
  process.exit(1);
});

export { app, server };
