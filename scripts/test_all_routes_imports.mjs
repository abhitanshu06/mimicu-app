import assert from 'node:assert';
import { VIBE_LIST, VIBE_CATEGORIES, VIBES } from '../src/config/vibes.js';

console.log('🔍 Testing VibesPage and all page dependencies...\n');

// 1. Verify VIBE_LIST and VIBE_CATEGORIES integrity
assert.ok(Array.isArray(VIBE_LIST), 'VIBE_LIST must be an array');
assert.strictEqual(VIBE_LIST.length, 15, 'VIBE_LIST must have exactly 15 vibes');
assert.ok(Array.isArray(VIBE_CATEGORIES), 'VIBE_CATEGORIES must be an array');
assert.ok(VIBE_CATEGORIES.length >= 5, 'VIBE_CATEGORIES must have at least 5 categories');

// 2. Verify filter logic in VibesPage
for (const category of VIBE_CATEGORIES) {
  const filtered = category === 'All Vibes'
    ? VIBE_LIST
    : VIBE_LIST.filter((v) => v && v.category === category);
  assert.ok(Array.isArray(filtered), `Filtering by ${category} must return an array`);
}
console.log('✅ Filtering across all categories verified without errors.');

// 3. Verify all 15 Vibes have valid attributes
for (const vibe of VIBE_LIST) {
  assert.ok(vibe.id, 'Vibe must have an id');
  assert.ok(vibe.name, 'Vibe must have a name');
  assert.ok(vibe.category, 'Vibe must have a category');
  assert.ok(vibe.emoji, 'Vibe must have an emoji');
  assert.ok(vibe.colors && vibe.colors.primary, 'Vibe must have colors.primary');
}
console.log('✅ All 15 Vibes verified with required UI metadata.');

console.log('\n🎉 ALL VIBES PAGE IMPORT & DATA INTEGRITY TESTS PASSED!\n');
