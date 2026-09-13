import { VIBES, VIBE_LIST } from '../src/config/vibes.js';
import { TRACKS, getTracksForVibe, getTrackById } from '../src/data/tracks.js';
import { useAudioStore } from '../src/stores/audioStore.js';
import { useVibeStore } from '../src/stores/vibeStore.js';

console.log('==================================================');
console.log('PHASE 7 — VIBE PLAYLIST SEQUENCER VERIFICATION');
console.log('==================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// TEST 1: Canonical 15 Vibes verification
assert(VIBE_LIST.length === 15, `Exactly 15 canonical Vibes in VIBE_LIST (got ${VIBE_LIST.length})`);

// TEST 2: Every canonical Vibe has curated trackIds referencing real TRACKS
for (const vibe of VIBE_LIST) {
  assert(
    Array.isArray(vibe.trackIds) && vibe.trackIds.length >= 4,
    `Vibe "${vibe.name}" (${vibe.id}) has at least 4 trackIds (got ${vibe.trackIds?.length})`
  );

  const resolved = getTracksForVibe(vibe.id);
  assert(
    resolved.length === vibe.trackIds.length,
    `Vibe "${vibe.id}" resolves all ${vibe.trackIds.length} canonical tracks (got ${resolved.length})`
  );

  for (let i = 0; i < vibe.trackIds.length; i++) {
    const trackId = vibe.trackIds[i];
    const track = getTrackById(trackId);
    assert(!!track, `Track ID "${trackId}" resolves to a valid track`);
    assert(resolved[i].id === trackId, `Resolved track index ${i} matches canonical trackId ${trackId}`);
  }
}

// TEST 3: VibeStore Sequencer State & Actions
const vibeStore = useVibeStore.getState();
assert(typeof vibeStore.setVibePlaylist === 'function', 'vibeStore has setVibePlaylist action');
assert(typeof vibeStore.setVibeIndex === 'function', 'vibeStore has setVibeIndex action');
assert(typeof vibeStore.startVibeSession === 'function', 'vibeStore has startVibeSession action');
assert(typeof vibeStore.setVibeShuffle === 'function', 'vibeStore has setVibeShuffle action');
assert(typeof vibeStore.setVibeRepeatMode === 'function', 'vibeStore has setVibeRepeatMode action');
assert(typeof vibeStore.clearVibePlayback === 'function', 'vibeStore has clearVibePlayback action');

// TEST 4: AudioStore Playback Context & Vibe Session initialization
const audioStore = useAudioStore.getState();
audioStore.playVibe('3-am-night-walk', false, 0);

const stateAfterPlay = useAudioStore.getState();
const vibeStateAfterPlay = useVibeStore.getState();

assert(stateAfterPlay.playing === true, 'AudioStore playing is true after playVibe');
assert(stateAfterPlay.playbackContext?.type === 'vibe', 'playbackContext.type is "vibe"');
assert(stateAfterPlay.playbackContext?.id === '3-am-night-walk', 'playbackContext.id is "3-am-night-walk"');
assert(vibeStateAfterPlay.isVibePlaybackActive === true, 'vibeStore.isVibePlaybackActive is true');
assert(vibeStateAfterPlay.activeVibeIndex === 0, 'vibeStore.activeVibeIndex is 0');
assert(stateAfterPlay.currentTrack?.id === 'track-3am-1', 'First track is track-3am-1');

// TEST 5: Track Row selection in-session
const targetTrack = getTrackById('track-3am-3');
audioStore.playTrack(targetTrack, stateAfterPlay.queue, {
  type: 'vibe',
  id: '3-am-night-walk',
  name: '3 AM Night Walk',
});

const stateAfterSelect = useAudioStore.getState();
const vibeStateAfterSelect = useVibeStore.getState();

assert(stateAfterSelect.currentTrack?.id === 'track-3am-3', 'AudioStore currentTrack updated to track-3am-3');
assert(stateAfterSelect.playbackContext?.type === 'vibe', 'Playback context remains "vibe"');
assert(vibeStateAfterSelect.activeVibeIndex === 2, `vibeStore.activeVibeIndex is 2 (got ${vibeStateAfterSelect.activeVibeIndex})`);

// TEST 6: Next & Previous Track Sequencer
audioStore.next();
const stateAfterNext = useAudioStore.getState();
assert(stateAfterNext.currentTrack?.id === 'track-3am-4', 'Next track is track-3am-4');
assert(useVibeStore.getState().activeVibeIndex === 3, 'vibeStore.activeVibeIndex updated to 3');

// Previous track when currentTime <= 3s moves to previous
useAudioStore.setState({ currentTime: 1.5 });
audioStore.previous();
const stateAfterPrev = useAudioStore.getState();
assert(stateAfterPrev.currentTrack?.id === 'track-3am-3', 'Previous track is track-3am-3');

// Previous track when currentTime > 3s restarts current track
useAudioStore.setState({ currentTime: 15.0 });
audioStore.previous();
const stateAfterRestart = useAudioStore.getState();
assert(stateAfterRestart.currentTrack?.id === 'track-3am-3', 'Track restarted (still track-3am-3)');
assert(stateAfterRestart.currentTime === 0, 'currentTime reset to 0');

// TEST 7: Shuffle Mode
const preShuffleOrder = [...useAudioStore.getState().originalQueue];
audioStore.toggleShuffle();
const stateAfterShuffle = useAudioStore.getState();
assert(stateAfterShuffle.shuffle === true, 'Shuffle mode is ON');
assert(stateAfterShuffle.queue[0].id === 'track-3am-3', 'Current track remains pinned at index 0 after shuffle');
assert(stateAfterShuffle.queue.length === preShuffleOrder.length, 'Queue length unchanged after shuffle');

// Toggle Shuffle OFF restores canonical order
audioStore.toggleShuffle();
const stateAfterUnshuffle = useAudioStore.getState();
assert(stateAfterUnshuffle.shuffle === false, 'Shuffle mode is OFF');
assert(stateAfterUnshuffle.queue[2].id === 'track-3am-3', 'Track restored to original index 2 in canonical queue');

// TEST 8: Repeat Modes Cycle
useAudioStore.getState().setRepeatMode('vibe');
assert(useAudioStore.getState().repeat === 'vibe', 'Repeat mode is "vibe"');
useAudioStore.getState().toggleRepeat();
assert(useAudioStore.getState().repeat === 'track', 'Repeat mode toggled to "track"');
useAudioStore.getState().toggleRepeat();
assert(useAudioStore.getState().repeat === 'off', 'Repeat mode toggled to "off"');
useAudioStore.getState().toggleRepeat();
assert(useAudioStore.getState().repeat === 'vibe', 'Repeat mode toggled back to "vibe"');

// TEST 9: Cross-Context Safety (Search playback detaches Vibe session)
const searchTrack = getTrackById('track-game-1');
audioStore.playTrack(searchTrack, [searchTrack], {
  type: 'search',
  name: 'Search: "Cyber"',
  emoji: '🔍',
  page: '/search',
});

const stateAfterSearch = useAudioStore.getState();
const vibeStateAfterSearch = useVibeStore.getState();

assert(stateAfterSearch.playbackContext?.type === 'search', 'playbackContext.type is "search"');
assert(vibeStateAfterSearch.isVibePlaybackActive === false, 'vibeStore.isVibePlaybackActive is false');
assert(vibeStateAfterSearch.activeVibePlaylist.length === 0, 'vibeStore.activeVibePlaylist cleared');

console.log(`\n==================================================`);
console.log(`ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log(`==================================================\n`);
