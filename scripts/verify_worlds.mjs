// Verify all 8 core vibes and their environment mappings
import { VIBES } from '../src/config/vibes.js';

const targetVibes = [
  'chai-and-sutta',
  'gaming',
  'deep-focus',
  '3-am-night-walk',
  'rainy-window',
  'long-drive',
  'terrace-walking',
  'stargazing',
];

console.log('--- MIMICU VIBE WORLDS VERIFICATION ---');

let allPassed = true;

for (const id of targetVibes) {
  const vibe = VIBES[id];
  if (!vibe) {
    console.error(`❌ Vibe ${id} NOT FOUND!`);
    allPassed = false;
    continue;
  }

  const env = vibe.visualWorld?.environmentType;
  const lights = vibe.visualWorld?.lighting;
  const colors = vibe.colors;

  console.log(`\n✨ [${vibe.name}] (${id})`);
  console.log(`   🏷️  Tagline: "${vibe.tagline}"`);
  console.log(`   🌍  Environment: ${env}`);
  console.log(`   💡  Lighting: ambient=${lights?.ambientIntensity}, key=${lights?.keyColor}`);
  console.log(`   🎨  Colors: primary=${colors?.primary}, secondary=${colors?.secondary}, accent=${colors?.accent}`);

  if (!env) {
    console.error(`   ❌ Missing environmentType for ${id}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('\n✅ ALL 8 CORE VIBE WORLDS VERIFIED SUCCESSFULLY!');
} else {
  console.error('\n❌ SOME VIBES FAILED VALIDATION!');
  process.exit(1);
}
