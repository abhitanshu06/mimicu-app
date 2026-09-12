import { useVibeStore } from '../src/stores/vibeStore.js';
import { VIBES } from '../src/config/vibes.js';

const eightCoreWorlds = [
  { id: 'chai-and-sutta', expectedEnv: 'chai-tapri' },
  { id: 'gaming', expectedEnv: 'gaming' },
  { id: 'deep-focus', expectedEnv: 'minimal-focus' },
  { id: '3-am-night-walk', expectedEnv: 'urban-night' },
  { id: 'rainy-window', expectedEnv: 'rain-window' },
  { id: 'long-drive', expectedEnv: 'highway' },
  { id: 'coding-late-night', expectedEnv: 'coding' },
  { id: 'stargazing', expectedEnv: 'celestial' },
];

console.log('--- TESTING ALL 8 CORE ATMOSPHERIC WORLDS ---');

for (const { id, expectedEnv } of eightCoreWorlds) {
  const store = useVibeStore.getState();
  store.setVibe(id);
  const target = useVibeStore.getState().targetVibe;

  if (!target) {
    throw new Error(`Target vibe not found for ${id}`);
  }

  if (target.visualWorld.environmentType !== expectedEnv) {
    throw new Error(`Mismatch for ${id}: expected ${expectedEnv}, got ${target.visualWorld.environmentType}`);
  }

  console.log(`✅ [${target.name}] -> mapped to environmentType "${target.visualWorld.environmentType}"`);
}

console.log('\n🎉 ALL 8 REQUIRED ATMOSPHERE WORLDS CONFIGURED & VERIFIED PERFECTLY!');
