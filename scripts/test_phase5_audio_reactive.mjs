import { VIBE_LIST } from '../src/config/vibes.js';
import { AUDIO_REACTIVE_PROFILES, DEFAULT_AUDIO_REACTIVE_PROFILE, getAudioReactiveProfile } from '../src/config/audioReactiveProfiles.js';
import { audioReactiveManager } from '../src/utils/audioReactiveManager.js';

console.log('=== MIMICU PHASE 5: AUDIO-REACTIVE 3D VIBE TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Verify exact 15 vibes
console.log('--- 1. Canonical Vibes Count & Profiles ---');
assert(VIBE_LIST.length === 15, `Exact 15 Vibes present (found ${VIBE_LIST.length})`);

const requiredFields = [
  'bassStrength',
  'midStrength',
  'trebleStrength',
  'overallStrength',
  'smoothing',
  'particleResponse',
  'lightResponse',
  'cameraResponse'
];

VIBE_LIST.forEach((vibe) => {
  const profile = getAudioReactiveProfile(vibe.id);
  assert(profile !== undefined, `Vibe "${vibe.id}" (${vibe.title}) resolves an audio-reactive profile`);
  
  const hasAllFields = requiredFields.every((f) => typeof profile[f] === 'number' && !isNaN(profile[f]));
  assert(hasAllFields, `Vibe "${vibe.id}" profile contains all required numerical fields`);
  
  const inRange = requiredFields.every((f) => profile[f] >= 0 && profile[f] <= 3.0);
  assert(inRange, `Vibe "${vibe.id}" values are within safe subtle limits (0.0 - 3.0)`);
});

// 2. Fallback profile
console.log('\n--- 2. Fallback Profile ---');
const fallback = getAudioReactiveProfile('non-existent-vibe');
assert(fallback !== undefined, 'Fallback profile resolves for unknown vibe');
assert(fallback.bassStrength === DEFAULT_AUDIO_REACTIVE_PROFILE.bassStrength, 'Fallback matches DEFAULT_AUDIO_REACTIVE_PROFILE');

// 3. AudioReactiveManager initial state & properties
console.log('\n--- 3. AudioReactiveManager Telemetry & Smoothing ---');
assert(typeof audioReactiveManager.update === 'function', 'audioReactiveManager has update(delta) method');
assert(typeof audioReactiveManager.getValues === 'function', 'audioReactiveManager has getValues() method');
assert(typeof audioReactiveManager.setMode === 'function', 'audioReactiveManager has setMode() method');
assert(typeof audioReactiveManager.setVibe === 'function', 'audioReactiveManager has setVibe() method');

// Test zero values initially
const initialVals = audioReactiveManager.getValues();
assert(typeof initialVals.bass === 'number', 'audioReactiveManager exposes numeric bass');
assert(typeof initialVals.mid === 'number', 'audioReactiveManager exposes numeric mid');
assert(typeof initialVals.treble === 'number', 'audioReactiveManager exposes numeric treble');
assert(typeof initialVals.overallEnergy === 'number', 'audioReactiveManager exposes numeric overallEnergy');

// Test mode switching
audioReactiveManager.setMode('subtle');
assert(audioReactiveManager.mode === 'subtle', 'audioReactiveManager setMode to "subtle"');
audioReactiveManager.setMode('off');
assert(audioReactiveManager.mode === 'off', 'audioReactiveManager setMode to "off"');
audioReactiveManager.setMode('responsive');
assert(audioReactiveManager.mode === 'responsive', 'audioReactiveManager setMode back to "responsive"');

// 4. Test vibe-specific profiles distinctiveness
console.log('\n--- 4. Vibe-Specific Profile Distinctiveness ---');
const deepFocusProfile = getAudioReactiveProfile('deep-focus');
const gamingProfile = getAudioReactiveProfile('gaming');
const nightWalkProfile = getAudioReactiveProfile('3-am-night-walk');

assert(deepFocusProfile.cameraResponse < gamingProfile.cameraResponse, 'Deep Focus has significantly more subtle camera response than Gaming');
assert(deepFocusProfile.bassStrength < gamingProfile.bassStrength, 'Deep Focus bass is calmer than Gaming');
assert(nightWalkProfile.cameraResponse <= 0.25, '3 AM Night Walk camera response is subtle (<= 0.25)');

console.log(`\n========================================`);
console.log(`Phase 5 Test Results: ${passedTests} / ${totalTests} assertions passed`);
console.log(`========================================\n`);

if (passedTests === totalTests) {
  console.log('ALL PHASE 5 AUDIO-REACTIVE VERIFICATION TESTS PASSED SUCCESSFULLY.');
}
