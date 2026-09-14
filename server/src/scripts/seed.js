import { connectDB, disconnectDB, isDBConnected } from '../config/db.js';
import { Track } from '../models/Track.js';
import { Vibe } from '../models/Vibe.js';
import { Playlist } from '../models/Playlist.js';
import { TRACKS } from '../../../src/data/tracks.js';
import { VIBE_LIST } from '../../../src/config/vibes.js';

async function seed() {
  console.log('[Seed] Starting database seed...');
  await connectDB();

  if (!isDBConnected()) {
    console.error('[Seed] Database not connected. Please check MONGODB_URI and ensure MongoDB is running.');
    process.exit(1);
  }

  try {
    // 1. Seed Tracks
    console.log(`[Seed] Seeding ${TRACKS.length} canonical tracks...`);
    await Track.deleteMany({});
    const trackDocs = TRACKS.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album || 'Mimicu Original',
      duration: t.duration || 180,
      artwork: t.artwork || '',
      audioUrl: t.audioUrl || '',
      audioFile: `${t.id}.wav`,
      genres: t.genres || [],
      moods: t.moods || [],
      bpm: t.bpm || 120,
      energy: t.energy || 0.5,
    }));
    await Track.insertMany(trackDocs);
    console.log(`[Seed] Successfully inserted ${trackDocs.length} tracks.`);

    // 2. Seed Vibes (Exact 15 Canonical Vibes)
    console.log(`[Seed] Seeding ${VIBE_LIST.length} canonical vibes...`);
    await Vibe.deleteMany({});
    const vibeDocs = VIBE_LIST.map((v) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      emoji: v.emoji,
      colors: v.colors,
      visualWorld: v.visualWorld,
      recommendedGenres: v.recommendedGenres || [],
      moodTags: v.moodTags || [],
      trackIds: v.trackIds || [],
    }));
    await Vibe.insertMany(vibeDocs);
    console.log(`[Seed] Successfully inserted ${vibeDocs.length} vibes.`);

    // 3. Seed Default Playlist
    console.log('[Seed] Seeding default demo playlist...');
    await Playlist.deleteMany({ id: 'playlist-late-night-lofi' });
    await Playlist.create({
      id: 'playlist-late-night-lofi',
      name: 'Midnight Tapri Lo-Fi',
      description: 'Curated acoustic and lo-fi cuts for quiet hours.',
      cover: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #f59e0b 100%)',
      trackIds: ['track-3am-1', 'track-chai-1', 'track-focus-2'],
      ownerId: 'guest-user',
    });
    console.log('[Seed] Successfully inserted default demo playlist.');

    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
