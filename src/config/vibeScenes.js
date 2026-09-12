/**
 * Centralized Hybrid Scene Configuration System for Mimicu
 * 
 * Every Vibe World defines:
 * - Layer 1: Base Atmosphere (CSS gradients, sky colors, ambient tones)
 * - Layer 2: Distant Environment (2D / 2.5D silhouettes: buildings, trees, skyline, mountains)
 * - Layer 3: Main Vibe Objects (Recognizable objects defining each specific vibe)
 * - Layer 4: Atmospheric Effects (Fog, rain, steam, smoke, dust, stars, light glow)
 * - Layer 5: Motion & Camera (Parallax, subtle camera movement, slow procedural animation)
 * 
 * STATUS: Reserved config — not currently imported.
 * Intentionally preserved for future Phase 6 procedural scene generation.
 * The active 3D world system reads from src/config/vibes.js (visualWorld block) directly.
 */

export const VIBE_SCENES = {
  // 1. 3 AM NIGHT WALK
  '3-am-night-walk': {
    id: '3-am-night-walk',
    name: '3 AM Night Walk',
    environmentType: 'urban-night',
    baseAtmosphere: {
      skyColor: '#0d1527',
      ambientColor: '#334460',
      bgColor: '#0c1424',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #151d30 0%, #0e1526 38%, #0c1424 72%, #080d18 100%)',
    },
    distantEnvironment: {
      type: 'city-streetwall',
      leftSilhouette: 'buildings-shops',
      rightSilhouette: 'trees-street-elements',
      buildingDepth: -4.5,
      horizonIntersection: -24.0,
    },
    mainObjects: [
      'Wet Asphalt Road',
      'Reflective Puddles',
      'Dual Sidewalks with Curbs',
      'Symmetrical Amber Streetlamps',
      'Park Bench under Lamppost',
      'Organic Trees',
      'Lit Windows (Warm Amber & Cyan)',
      'Distant Traffic Signal Glow',
    ],
    lighting: {
      ambientIntensity: 0.65,
      keyColor: '#f59e0b',
      keyIntensity: 2.4,
      rimColor: '#38bdf8',
      rimIntensity: 1.5,
      lateralFill: 0.95,
      decay: 1.35,
    },
    effects: {
      type: 'mist',
      particleCount: 42,
      color: '#38bdf8',
      opacity: 0.08,
      size: 2.8,
    },
    motion: {
      walkingBob: true,
      bobSpeed: 0.6,
      driftSpeed: 0.38,
      parallaxFactor: 0.35,
    },
    camera: {
      baseZ: 4.8,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.28,
    },
  },

  // 2. CHAI & SUTTA
  'chai-and-sutta': {
    id: 'chai-and-sutta',
    name: 'Chai & Sutta',
    environmentType: 'chai-tapri',
    baseAtmosphere: {
      skyColor: '#10172b',
      ambientColor: '#3b3a6e',
      bgColor: '#0d1424',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #161b32 0%, #101526 38%, #0d1424 72%, #090e1a 100%)',
    },
    distantEnvironment: {
      type: 'night-city-skyline',
      silhouetteDepth: -14.0,
      bokehCount: 36,
    },
    mainObjects: [
      'Chai Tapri Wooden Counter',
      'Corrugated Awning & Timber Posts',
      'Aluminium Chai Ketli with Burner Flame',
      'Cutting Chai Glasses in Wire Caddy',
      'Stylized Relaxed Human Silhouette Character',
      'Warm Hanging Incandescent Bulb',
    ],
    lighting: {
      ambientIntensity: 0.62,
      keyColor: '#f97316',
      keyIntensity: 2.3,
      rimColor: '#818cf8',
      rimIntensity: 1.4,
      bulbFlicker: true,
      decay: 1.35,
    },
    effects: {
      type: 'steam-and-smoke',
      steamCount: 38,
      smokeCount: 28,
      softAlphaMap: true,
      zeroSquares: true,
    },
    motion: {
      walkingBob: false,
      driftSpeed: 0.15,
      parallaxFactor: 0.25,
    },
    camera: {
      baseZ: 5.0,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.25,
    },
  },

  // 3. DEEP FOCUS
  'deep-focus': {
    id: 'deep-focus',
    name: 'Deep Focus',
    environmentType: 'minimal-focus',
    baseAtmosphere: {
      skyColor: '#0f172a',
      ambientColor: '#475569',
      bgColor: '#0c1424',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #151e32 0%, #0e1526 38%, #0c1424 72%, #080d18 100%)',
    },
    distantEnvironment: {
      type: 'minimal-sanctuary-room',
      softWallDepth: -2.2,
      subtleDepth: true,
    },
    mainObjects: [
      '32m Wide Matte Charcoal Slate Desk',
      'Architectural Articulated Task Lamp',
      'Focused Warm Desk Spotlight Cone',
      'Open Aluminum Sleek Laptop with Screen Glow',
      'Open Hardbound Notebook & Fine-Point Pen',
      'Stacked Hardcover Books',
      'Minimalist Desk Clock',
    ],
    lighting: {
      ambientIntensity: 0.60,
      keyColor: '#f8fafc',
      keyIntensity: 2.3,
      rimColor: '#38bdf8',
      rimIntensity: 1.3,
      spotlightAngle: 0.78,
      decay: 1.35,
    },
    effects: {
      type: 'dust-motes',
      count: 42,
      opacity: 0.35,
      size: 0.12,
    },
    motion: {
      walkingBob: false,
      driftSpeed: 0.028,
      parallaxFactor: 0.2,
    },
    camera: {
      baseZ: 5.2,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.22,
    },
  },

  // 4. GAMING
  'gaming': {
    id: 'gaming',
    name: 'Gaming',
    environmentType: 'gaming',
    baseAtmosphere: {
      skyColor: '#0a141e',
      ambientColor: '#134e4a',
      bgColor: '#08121a',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #102422 0%, #0a1818 38%, #08121a 72%, #050b10 100%)',
    },
    distantEnvironment: {
      type: 'gaming-room-wall',
      acousticPanels: true,
      wallWidth: 36,
      wallDepth: -2.2,
    },
    mainObjects: [
      'Heavy-Duty Gaming Desk with Chamfer Edge',
      'Extended Stitched Desk Mat with Accent Glow',
      'Main Curved 32" Monitor with Display Glow',
      'Secondary Vertical Monitor on Mount Arm',
      'Mechanical TKL Keyboard with Keycap Underglow',
      'Gaming Mouse with Accent Scroll Wheel',
      'PC Tower with Tempered Glass & Spinning Cooler Fan',
      'Racer Gaming Chair (Framing Side, UI-Safe)',
    ],
    lighting: {
      ambientIntensity: 0.58,
      keyColor: '#10b981',
      keyIntensity: 2.2,
      rimColor: '#06b6d4',
      rimIntensity: 1.5,
      biasBacklight: true,
      decay: 1.35,
    },
    effects: {
      type: 'room-dust',
      count: 40,
      opacity: 0.35,
      size: 0.12,
    },
    motion: {
      walkingBob: false,
      fanRotation: true,
      screenPulse: true,
      parallaxFactor: 0.22,
    },
    camera: {
      baseZ: 4.8,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.26,
    },
  },

  // 5. RAINY WINDOW
  'rainy-window': {
    id: 'rainy-window',
    name: 'Rainy Window',
    environmentType: 'rain-window',
    baseAtmosphere: {
      skyColor: '#0d182b',
      ambientColor: '#254466',
      bgColor: '#0a1424',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #142238 0%, #0c182a 38%, #0a1424 72%, #070e1a 100%)',
    },
    distantEnvironment: {
      type: 'nocturnal-city-bokeh',
      bokehCount: 28,
      depth: -8.0,
    },
    mainObjects: [
      'Large Glass Window Pane with Transmission',
      'Deep Indoor Window Sill (Lower Foreground)',
      'Steaming Ceramic Coffee/Tea Mug',
      'Potted Succulent Plant Silhouette',
      'Outside Falling Rain Streaks',
      'Out-of-Focus Blurred City Lights Bokeh',
    ],
    lighting: {
      ambientIntensity: 0.60,
      keyColor: '#38bdf8',
      keyIntensity: 2.0,
      rimColor: '#fb923c',
      rimIntensity: 1.4,
      decay: 1.35,
    },
    effects: {
      type: 'trickling-droplets',
      dropletCount: 65,
      rainCount: 190,
      steamCount: 16,
      zeroSquares: true,
    },
    motion: {
      walkingBob: false,
      rainSpeed: 13.5,
      dropletSpeed: 0.25,
      parallaxFactor: 0.2,
    },
    camera: {
      baseZ: 4.7,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.25,
      noDividingBars: true,
    },
  },

  // 6. LONG DRIVE
  'long-drive': {
    id: 'long-drive',
    name: 'Long Drive',
    environmentType: 'highway',
    baseAtmosphere: {
      skyColor: '#0f152a',
      ambientColor: '#312e81',
      bgColor: '#0b1122',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #181d38 0%, #10142a 38%, #0b1122 72%, #070b16 100%)',
    },
    distantEnvironment: {
      type: 'infinite-highway-horizon',
      gantryDepth: -22.0,
      horizonGlow: -26.0,
    },
    mainObjects: [
      'Inside Cockpit Dashboard Cowl (Lower Foreground)',
      'Steering Wheel with Gentle Vibration',
      'Illuminated Speedometer & Tachometer Gauges',
      'Center Infotainment GPS Navigation Screen',
      'Rearview Mirror Mounted to Windshield Frame',
      'Wide Receding Highway Surface (32m)',
      'Highway Guardrails with Reflector Studs',
      'Animated Center Dashed Road Lines',
      'Taillight Streaks (Red) & Headlight Streaks (White)',
    ],
    lighting: {
      ambientIntensity: 0.58,
      keyColor: '#ef4444',
      keyIntensity: 2.2,
      rimColor: '#f8fafc',
      rimIntensity: 1.5,
      decay: 1.35,
    },
    effects: {
      type: 'light-streaks',
      streakCount: 38,
      redStreaks: true,
      whiteStreaks: true,
    },
    motion: {
      walkingBob: false,
      roadSpeed: 9.5,
      streakSpeedRed: 16,
      streakSpeedWhite: 26,
      parallaxFactor: 0.25,
    },
    camera: {
      baseZ: 4.6,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.26,
      noAPillars: true,
    },
  },

  // 7. CODING LATE NIGHT
  'coding-late-night': {
    id: 'coding-late-night',
    name: 'Coding Late Night',
    environmentType: 'coding',
    baseAtmosphere: {
      skyColor: '#0c1628',
      ambientColor: '#24344d',
      bgColor: '#0a1222',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #122036 0%, #0c1628 38%, #0a1222 72%, #070c18 100%)',
    },
    distantEnvironment: {
      type: 'late-night-room-window',
      windowDepth: -3.0,
      cityBokeh: true,
    },
    mainObjects: [
      'Minimalist Dark Wood / Slate Desk',
      'Coding Monitor with Procedural Glowing Code Lines',
      'Blinking Terminal Cursor Line',
      'Mechanical Keyboard with Cyan/Purple Underglow',
      'Stitched Desk Mat',
      'Steaming Coffee / Chai Mug',
      'Architectural Desk Task Lamp',
    ],
    lighting: {
      ambientIntensity: 0.58,
      keyColor: '#06b6d4',
      keyIntensity: 2.2,
      rimColor: '#8b5cf6',
      rimIntensity: 1.4,
      monitorBiasGlow: true,
      decay: 1.35,
    },
    effects: {
      type: 'code-particles-and-steam',
      dustCount: 32,
      steamCount: 16,
      codeLineShimmer: true,
    },
    motion: {
      walkingBob: false,
      cursorBlink: true,
      codeDrift: true,
      parallaxFactor: 0.22,
    },
    camera: {
      baseZ: 5.0,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.24,
    },
  },

  // 8. STARGAZING
  'stargazing': {
    id: 'stargazing',
    name: 'Stargazing',
    environmentType: 'celestial',
    baseAtmosphere: {
      skyColor: '#0b1024',
      ambientColor: '#2d2e63',
      bgColor: '#090e20',
      gradient: 'radial-gradient(ellipse 130% 95% at 50% 25%, #141838 0%, #0d1228 38%, #090e20 72%, #060914 100%)',
    },
    distantEnvironment: {
      type: 'cosmic-starfield-horizon',
      mountainRidge: true,
      mountainDepth: -16.0,
      constellations: true,
    },
    mainObjects: [
      '32m Wide Observation Deck Floor',
      'Lookout Deck Front Rim Bevel',
      'Astronomical Refractor Telescope on Tripod (Tilted 42°)',
      'Equatorial Mount Head & Counterweight',
      'Luminous Crescent Moon with Atmospheric Halo',
      'Smooth 32-Segment Mountain Ridge Silhouettes',
      'Deep Starfield with Shimmering Multi-Depth Stars',
    ],
    lighting: {
      ambientIntensity: 0.60,
      keyColor: '#c084fc',
      keyIntensity: 1.6,
      rimColor: '#67e8f9',
      rimIntensity: 1.4,
      moonVolumetricGlow: true,
      decay: 1.35,
    },
    effects: {
      type: 'twinkling-stars',
      starCount: 260,
      shootingStar: true,
      nebulaDust: true,
    },
    motion: {
      walkingBob: false,
      celestialRotation: 0.006,
      lunarFloating: true,
      parallaxFactor: 0.28,
    },
    camera: {
      baseZ: 5.2,
      fov: 50,
      minZ: 4.3,
    },
    safeUIArea: {
      centerScrimOpacity: 0.22,
    },
  },
};

export const CORE_VIBE_IDS = [
  '3-am-night-walk',
  'chai-and-sutta',
  'deep-focus',
  'gaming',
  'rainy-window',
  'long-drive',
  'coding-late-night',
  'stargazing',
];