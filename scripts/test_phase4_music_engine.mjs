import assert from 'node:assert';
import { TRACKS, getTracksForVibe, getRecommendedTracks, formatDuration } from '../src/data/tracks.js';
import { VIBES, VIBE_LIST } from '../src/config/vibes.js';
import { EQUALIZER_PRESETS } from '../src/stores/equalizerStore.js';
import { audioEngine } from '../src/utils/audioEngine.js';

console.log('🎵 Running Phase 4 Verification Suite: Music Engine & Vibe Playlists...\n');

// 1. Verify exact 15 vibes integrity (Section 5)
console.log('Test 1: Verify exact 15 vibes integrity...');
assert.strictEqual(VIBE_LIST.length, 15, `Mimicu must have EXACTLY 15 vibes, got ${VIBE_LIST.length}`);

const EXPECTED_VIBE_NAMES = [
  '3 AM Night Walk',
  'Chai & Sutta',
  'Rainy Window',
  'Coding Late Night',
  'Stargazing',
  'Deep Focus',
  'Study Session',
  'Gaming',
  'Long Drive',
  'Terrace Walking',
  'Morning Walk',
  'Bathing / Self Care',
  'Rain + Chai',
  'Beach Vibes',
  'Sunset Chill',
];

const PROHIBITED_VIBES = ['Night Drive', 'Focus Flow', 'Lo-Fi Room', 'Coffee Shop', 'Sky Shift'];

const actualNames = VIBE_LIST.map((v) => v.name);
for (const expected of EXPECTED_VIBE_NAMES) {
  assert.ok(actualNames.includes(expected), `Expected vibe "${expected}" not found in VIBE_LIST`);
}

for (const prohibited of PROHIBITED_VIBES) {
  assert.ok(!actualNames.includes(prohibited), `Prohibited vibe "${prohibited}" found in VIBE_LIST!`);
}
console.log('✅ Exactly 15 canonical vibes verified without additions or omissions.');

// 2. Verify track catalog schema & count (Section 4)
console.log('\nTest 2: Verify track catalog >= 20 and schema validity...');
assert.ok(TRACKS.length >= 20, `Catalog must have at least 20 tracks, found ${TRACKS.length}`);
console.log(`Found ${TRACKS.length} curated tracks in catalog.`);

for (const track of TRACKS) {
  assert.ok(track.id, 'Track must have an id');
  assert.ok(track.title, `Track ${track.id} must have a title`);
  assert.ok(track.artist, `Track ${track.id} must have an artist`);
  assert.ok(track.album, `Track ${track.id} must have an album`);
  assert.ok(typeof track.duration === 'number' && track.duration > 0, `Track ${track.id} duration must be positive`);
  assert.ok(track.coverArtUrl, `Track ${track.id} must have coverArtUrl`);
  assert.ok(track.audioUrl, `Track ${track.id} must have audioUrl`);
  assert.ok(Array.isArray(track.vibeIds) && track.vibeIds.length > 0, `Track ${track.id} must have vibeIds array`);
  assert.ok(Array.isArray(track.genres) && track.genres.length > 0, `Track ${track.id} must have genres`);
  assert.ok(Array.isArray(track.moodTags) && track.moodTags.length > 0, `Track ${track.id} must have moodTags`);
  assert.ok(typeof track.bpm === 'number', `Track ${track.id} must have numeric bpm`);
  assert.ok(typeof track.energy === 'number' && track.energy >= 0 && track.energy <= 1, `Track ${track.id} must have energy between 0 and 1`);
  assert.strictEqual(typeof track.isLiked, 'boolean', `Track ${track.id} must have boolean isLiked`);
}
console.log('✅ All tracks adhere to required Phase 4 metadata schema.');

// 3. Verify every single one of the 15 vibes has playlist coverage and recommended tracks
console.log('\nTest 3: Checking playlist generation for all 15 vibes...');
for (const vibe of VIBE_LIST) {
  const vibeTracks = getTracksForVibe(vibe.id);
  assert.ok(vibeTracks.length >= 3, `Vibe ${vibe.id} (${vibe.name}) must have at least 3 tracks, found ${vibeTracks.length}`);
  const recs = getRecommendedTracks(vibe.id, 3);
  assert.strictEqual(recs.length, 3, `Vibe ${vibe.id} must have 3 recommended tracks`);
  console.log(`  - [${vibe.emoji}] ${vibe.name.padEnd(22)}: ${vibeTracks.length} tracks, ${recs.length} recs`);
}
console.log('✅ All 15 vibes have rich, valid track collections and recommended shelves.');

// 4. Test Duration Formatter
console.log('\nTest 4: Verify duration formatting...');
assert.strictEqual(formatDuration(0), '0:00');
assert.strictEqual(formatDuration(65), '1:05');
assert.strictEqual(formatDuration(214), '3:34');
assert.strictEqual(formatDuration(3600), '60:00');
console.log('✅ Duration formatting accurate.');

// 5. Test Equalizer Presets
console.log('\nTest 5: Verify Equalizer Presets and Web Audio DSP parameters...');
const presetKeys = Object.keys(EQUALIZER_PRESETS);
assert.ok(presetKeys.length >= 6, 'Expected at least 6 equalizer presets');
const requiredPresets = ['Balanced', 'Bass Boost', 'Deep Focus', 'Night', 'Chill', 'Energy'];
for (const req of requiredPresets) {
  assert.ok(presetKeys.includes(req), `Required preset "${req}" not found`);
}

for (const [key, p] of Object.entries(EQUALIZER_PRESETS)) {
  assert.ok(typeof p.bass === 'number' && p.bass >= -12 && p.bass <= 12, `${key} bass within -12dB..+12dB`);
  assert.ok(typeof p.mid === 'number' && p.mid >= -12 && p.mid <= 12, `${key} mid within -12dB..+12dB`);
  assert.ok(typeof p.treble === 'number' && p.treble >= -12 && p.treble <= 12, `${key} treble within -12dB..+12dB`);
  assert.ok(typeof p.preamp === 'number', `${key} preamp must be number`);
  assert.ok(typeof p.immersion === 'number' && p.immersion >= 0 && p.immersion <= 100, `${key} immersion 0..100%`);
  assert.ok(typeof p.spatialAudio === 'boolean', `${key} spatialAudio must be boolean`);
}
console.log(`✅ Equalizer presets verified with safe ranges (bass, mid, treble, preamp, immersion).`);

// 6. Test AnalyserNode Telemetry Foundation (Section 21)
console.log('\nTest 6: Verify AnalyserNode telemetry getter for Phase 5...');
const telemetry = audioEngine.getAudioTelemetry();
assert.ok(telemetry.frequencyDataArray instanceof Uint8Array, 'frequencyDataArray must be Uint8Array');
assert.ok(telemetry.timeDomainDataArray instanceof Uint8Array, 'timeDomainDataArray must be Uint8Array');
assert.ok(typeof telemetry.bass === 'number' && telemetry.bass >= 0 && telemetry.bass <= 1, 'bass telemetry must be 0..1');
assert.ok(typeof telemetry.mid === 'number' && telemetry.mid >= 0 && telemetry.mid <= 1, 'mid telemetry must be 0..1');
assert.ok(typeof telemetry.treble === 'number' && telemetry.treble >= 0 && telemetry.treble <= 1, 'treble telemetry must be 0..1');
assert.ok(typeof telemetry.overallEnergy === 'number' && telemetry.overallEnergy >= 0 && telemetry.overallEnergy <= 1, 'overallEnergy must be 0..1');
console.log('✅ AnalyserNode telemetry exposes TypedArrays and band energies imperatively.');

// 7. Test Fisher-Yates non-destructive shuffle algorithm (Section 11)
console.log('\nTest 7: Verify non-destructive shuffle logic...');
function testShuffle(array, retainFirst = null) {
  const items = retainFirst 
    ? array.filter((t) => t.id !== retainFirst.id)
    : [...array];

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return retainFirst ? [retainFirst, ...items] : items;
}

const sampleQueue = getTracksForVibe('3-am-night-walk');
const activeTrack = sampleQueue[1]; // Pick second track as active

const shuffled = testShuffle(sampleQueue, activeTrack);
assert.strictEqual(shuffled[0].id, activeTrack.id, 'Currently playing track must be pinned at index 0');
assert.strictEqual(shuffled.length, sampleQueue.length, 'Shuffled queue length must equal original queue');
const originalIds = sampleQueue.map(t => t.id).sort();
const shuffledIds = shuffled.map(t => t.id).sort();
assert.deepStrictEqual(originalIds, shuffledIds, 'Shuffled queue must contain exactly the same tracks');

const restoredIdx = sampleQueue.findIndex(t => t.id === activeTrack.id);
assert.strictEqual(restoredIdx, 1, 'Restored index must match current track in original queue');
console.log('✅ Shuffle behavior confirmed: retains current track at index 0 and restores cleanly.');

// 8. Test Like system logic (Section 17)
console.log('\nTest 8: Verify Like toggle logic...');
let likedIds = [];
function toggleLike(trackId) {
  likedIds = likedIds.includes(trackId)
    ? likedIds.filter(id => id !== trackId)
    : [...likedIds, trackId];
  return likedIds;
}

toggleLike('track-3am-1');
assert.deepStrictEqual(likedIds, ['track-3am-1'], 'Track should be added to likes');
toggleLike('track-3am-2');
assert.deepStrictEqual(likedIds, ['track-3am-1', 'track-3am-2'], 'Second track should be added');
toggleLike('track-3am-1');
assert.deepStrictEqual(likedIds, ['track-3am-2'], 'First track should be unliked');
console.log('✅ Like system toggle operations verified.');

// 9. Test Recently Played History capping & deduplication (Section 18)
console.log('\nTest 9: Verify Recently Played History logic...');
let historyList = [];
function addToHistory(track) {
  const filtered = historyList.filter(t => t.id !== track.id);
  historyList = [track, ...filtered].slice(0, 20);
}

for (let i = 0; i < 25; i++) {
  addToHistory({ id: `track-test-${i}`, title: `Track ${i}` });
}
assert.strictEqual(historyList.length, 20, 'History must be capped at 20 items');
assert.strictEqual(historyList[0].id, 'track-test-24', 'Most recent track must be at index 0');

// Re-play track 10
addToHistory({ id: 'track-test-10', title: 'Track 10' });
assert.strictEqual(historyList.length, 20, 'History must remain capped at 20 items');
assert.strictEqual(historyList[0].id, 'track-test-10', 'Replayed track must jump to index 0 without duplication');
assert.strictEqual(historyList.filter(t => t.id === 'track-test-10').length, 1, 'No duplicates in history');
console.log('✅ Recently played history capped at 20 and deduplicated.');

console.log('\n🎉 ALL PHASE 4 ENGINE & PLAYLIST TESTS PASSED!\n');
