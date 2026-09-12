import { ENVIRONMENT_THEMES, getEnvironmentTheme } from '../src/config/environmentThemes.js';
import { THEMES } from '../src/config/themes.js';
import { useThemeStore } from '../src/stores/themeStore.js';
import { useVibeStore } from '../src/stores/vibeStore.js';

console.log('=== TESTING THEME-AWARE ENVIRONMENT PRESENTATION SYSTEM ===\n');

// 1. Verify Environment Themes Profile Schema
const modes = ['dark', 'amoled', 'light'];
for (const mode of modes) {
  const cfg = ENVIRONMENT_THEMES[mode];
  if (!cfg) throw new Error(`Missing ENVIRONMENT_THEMES[${mode}]`);
  
  if (typeof cfg.ambientMultiplier !== 'number' || cfg.ambientMultiplier <= 0) {
    throw new Error(`Invalid ambientMultiplier for ${mode}`);
  }
  if (typeof cfg.minAmbient !== 'number' || cfg.minAmbient < 0.6) {
    throw new Error(`minAmbient must guarantee baseline visibility (>=0.6) for ${mode}`);
  }
  if (typeof cfg.fogFarMultiplier !== 'number' || cfg.fogFarMultiplier < 1.0) {
    throw new Error(`Invalid fogFarMultiplier for ${mode}`);
  }
  console.log(`✅ [Environment Theme: ${mode}] -> ambientMultiplier: ${cfg.ambientMultiplier}, minAmbient: ${cfg.minAmbient}, fogFarMultiplier: ${cfg.fogFarMultiplier}`);
}

// 2. Test getEnvironmentTheme resolution across all existing UI Themes
console.log('\n=== TESTING INTEGRATION WITH ALL UI THEMES ===');
const testThemes = ['dark', 'amoled', 'light', 'sky-light', 'frost-light'];

for (const themeId of testThemes) {
  const theme = THEMES[themeId];
  if (!theme) throw new Error(`Theme ${themeId} not found in THEMES!`);

  const envTheme = getEnvironmentTheme(theme.type);
  if (!envTheme) throw new Error(`Could not resolve envTheme for theme ${themeId} of type ${theme.type}`);

  console.log(`✅ [UI Theme: ${theme.name} (${theme.type})] -> mapped to Environment Presentation Profile "${envTheme.id}"`);
}

// 3. Test Batch 1 Vibes Independence from Theme Changes
console.log('\n=== TESTING BATCH 1 VIBES INDEPENDENCE ===');
const batch1Vibes = [
  { id: '3-am-night-walk', name: '3 AM Night Walk', env: 'urban-night' },
  { id: 'chai-and-sutta', name: 'Chai & Sutta', env: 'chai-tapri' },
  { id: 'rainy-window', name: 'Rainy Window', env: 'rain-window' },
  { id: 'coding-late-night', name: 'Coding Late Night', env: 'coding' },
  { id: 'stargazing', name: 'Stargazing', env: 'celestial' },
  { id: 'deep-focus', name: 'Deep Focus', env: 'minimal-focus' },
];

for (const v of batch1Vibes) {
  useVibeStore.getState().setVibe(v.id);
  const target = useVibeStore.getState().targetVibe;
  if (!target) throw new Error(`Target vibe ${v.id} not set`);
  if (target.visualWorld.environmentType !== v.env) {
    throw new Error(`Mismatch for ${v.id}: expected ${v.env}, got ${target.visualWorld.environmentType}`);
  }

  // Switch themes and ensure vibe's core attributes remain intact
  for (const themeId of testThemes) {
    useThemeStore.getState().setTheme(themeId);
    const activeTarget = useVibeStore.getState().targetVibe;
    if (activeTarget.visualWorld.environmentType !== v.env) {
      throw new Error(`Theme switch corrupted vibe ${v.id}!`);
    }
  }

  console.log(`✅ [Batch 1 Vibe: ${v.name}] -> maintains environmentType "${v.env}" across Dark, AMOLED, and Light themes`);
}

console.log('\n🎉 ALL THEME-AWARE ENVIRONMENT TESTS PASSED WITH 100% INTEGRITY!');