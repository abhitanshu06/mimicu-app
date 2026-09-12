import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧭 Running Mimicu Navigation Layout Refinement Verification Suite...\n');

// 1. Verify mascot logo asset
console.log('Test 1: Verify mascot logo asset integrity...');
const mascotPath = path.resolve(process.cwd(), 'mimicu.png');
assert.ok(fs.existsSync(mascotPath), 'mimicu.png must exist in root');
const stats = fs.statSync(mascotPath);
assert.ok(stats.size > 50000, `mimicu.png must be high quality (size: ${stats.size} bytes)`);
console.log(`✅ Official Mimicu Mascot asset verified (${(stats.size / 1024).toFixed(1)} KB).`);

// 2. Verify DesktopSidebar structure and zero duplicates
console.log('\nTest 2: Verify DesktopSidebar clean structure & zero duplicates...');
const sidebarFile = path.resolve(process.cwd(), 'src/components/layout/DesktopSidebar.jsx');
assert.ok(fs.existsSync(sidebarFile), 'DesktopSidebar.jsx must exist');
const sidebarCode = fs.readFileSync(sidebarFile, 'utf8');

// Check required navigation paths in sidebar
const requiredSidebarPaths = ['/', '/search', '/vibes', '/library', '/settings'];
for (const p of requiredSidebarPaths) {
  assert.ok(sidebarCode.includes(`'${p}'`), `Sidebar must contain navigation route '${p}'`);
}

// Ensure NO duplicates in sidebar: Profile and Equalizer must NOT be in sidebar
assert.ok(!sidebarCode.includes(`'/profile'`), 'Sidebar must NOT contain /profile (top-right only)');
assert.ok(!sidebarCode.includes(`'/equalizer'`), 'Sidebar must NOT contain /equalizer (top-right only)');
assert.ok(!sidebarCode.includes('toggleThemeModal'), 'Sidebar must NOT contain theme toggle (top-right only)');

// Check branding elements
assert.ok(sidebarCode.includes('MIMICU'), 'Sidebar must include MIMICU wordmark');
assert.ok(sidebarCode.includes('SPATIAL SOUND'), 'Sidebar must include SPATIAL SOUND subtitle');
assert.ok(sidebarCode.includes('mascotLogo'), 'Sidebar must use the mascot logo import');
assert.ok(sidebarCode.includes('object-contain'), 'Mascot must preserve proportions via object-contain');
assert.ok(sidebarCode.includes('hidden md:flex'), 'Sidebar must be desktop/tablet only (hidden on mobile)');
console.log('✅ DesktopSidebar structure verified: Mascot + 4 Main Nav + Settings (Zero duplicates).');

// 3. Verify TopNav: floating [Theme] [EQ] [Profile] & NO top-center Active Vibe badge
console.log('\nTest 3: Verify TopNav floating controls and removal of top-center Active Vibe badge...');
const topNavFile = path.resolve(process.cwd(), 'src/components/layout/TopNav.jsx');
assert.ok(fs.existsSync(topNavFile), 'TopNav.jsx must exist');
const topNavCode = fs.readFileSync(topNavFile, 'utf8');

// Top-right floating controls
assert.ok(topNavCode.includes('toggleThemeModal'), 'TopNav must contain Theme button');
assert.ok(topNavCode.includes(`'/equalizer'`), 'TopNav must contain Equalizer button');
assert.ok(topNavCode.includes(`'/profile'`), 'TopNav must contain Profile button');

// Ensure Active Vibe badge is REMOVED
assert.ok(!topNavCode.includes('Active Vibe:'), 'TopNav must NOT contain "Active Vibe:" badge');
assert.ok(topNavCode.includes('md:hidden'), 'TopNav mobile brand must be hidden on desktop');
console.log('✅ TopNav verified: Floating [Theme] [EQ] [Profile] active, top-center badge removed.');

// 4. Verify SettingsPage and route in App.jsx
console.log('\nTest 4: Verify SettingsPage and /settings route in App.jsx...');
const settingsFile = path.resolve(process.cwd(), 'src/pages/SettingsPage.jsx');
assert.ok(fs.existsSync(settingsFile), 'SettingsPage.jsx must exist');
const settingsCode = fs.readFileSync(settingsFile, 'utf8');
assert.ok(settingsCode.includes('Appearance'), 'Settings must include Appearance section');
assert.ok(settingsCode.includes('Playback'), 'Settings must include Playback section');
assert.ok(settingsCode.includes('Audio & Acoustics') || settingsCode.includes('Audio'), 'Settings must include Audio section');
assert.ok(settingsCode.includes('Privacy'), 'Settings must include Privacy section');
assert.ok(settingsCode.includes('toggleThemeModal'), 'Settings must reuse existing Theme system');

const appFile = path.resolve(process.cwd(), 'src/App.jsx');
const appCode = fs.readFileSync(appFile, 'utf8');
assert.ok(appCode.includes(`case '/settings':`), 'App.jsx must register /settings route');
assert.ok(appCode.includes('<SettingsPage'), 'App.jsx must render SettingsPage');
console.log('✅ SettingsPage and /settings route verified.');

// 5. Verify FloatingDock is restricted to mobile and has Settings
console.log('\nTest 5: Verify mobile FloatingDock...');
const dockFile = path.resolve(process.cwd(), 'src/components/layout/FloatingDock.jsx');
const dockCode = fs.readFileSync(dockFile, 'utf8');
assert.ok(dockCode.includes('md:hidden'), 'FloatingDock must include md:hidden to hide on desktop');
assert.ok(dockCode.includes(`'/settings'`), 'FloatingDock must include /settings');
console.log('✅ Mobile FloatingDock verified.');

// 6. Verify AppShell integration
console.log('\nTest 6: Verify AppShell layout and offsets...');
const shellFile = path.resolve(process.cwd(), 'src/components/layout/AppShell.jsx');
const shellCode = fs.readFileSync(shellFile, 'utf8');
assert.ok(shellCode.includes('<DesktopSidebar'), 'AppShell must render DesktopSidebar');
assert.ok(shellCode.includes('md:pl-64') || shellCode.includes('lg:pl-72'), 'Main container must offset for sidebar');
assert.ok(shellCode.includes('<SceneCanvas'), 'SceneCanvas 3D world must remain persistent in AppShell');
console.log('✅ AppShell layout integrates sidebar with 3D canvas and safe offsets.');

console.log('\n🎉 ALL NAVIGATION & HEADER REFINEMENT TESTS PASSED!\n');
