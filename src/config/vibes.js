/**
 * Centralized Vibe Configuration System for Mimicu
 * 
 * Defines 24+ experiential visual worlds.
 * Each vibe is a complete 3D atmosphere driven by `visualWorld` parameters:
 * - environmentType: 'urban-night' | 'rooftop' | 'highway' | 'rain-window' | 'minimal-focus' | 'nature' | 'celestial' | 'kinetic-cyber'
 * - lighting, fog, terrain, camera motion, particles, and objects
 * - music metadata: recommendedGenres, moodTags, energy, bpmRange
 */

export const VIBES = {
  // 1. 3 AM NIGHT WALK
  '3-am-night-walk': {
    id: '3-am-night-walk',
    name: '3 AM Night Walk',
    category: 'Night & Solitude',
    emoji: '🌃',
    tagline: 'Empty wet streets & amber streetlights',
    description: 'A cinematic solitary walk through quiet midnight streets. Wet reflective pavement, distant apartment silhouettes, amber streetlamps, and cool night air.',
    visualWorld: {
      environmentType: 'urban-night',
      sky: { color: '#0d1527', stars: true },
      lighting: {
        ambientIntensity: 0.65,
        ambientColor: '#334460',
        keyColor: '#f59e0b', // warm streetlamp
        keyIntensity: 2.4,
        rimColor: '#38bdf8', // cool moonlight
        rimIntensity: 1.5,
      },
      fog: { color: '#0c1424', near: 7.0, far: 34.0 },
      terrain: { type: 'wet-asphalt', roughness: 0.14, metalness: 0.82 },
      particles: { type: 'mist', count: 120, color: '#94a3b8', speed: 0.008, size: 0.12, opacity: 0.35 },
      camera: { walkingBob: true, speed: 0.6, baseZ: 4.8 },
    },
    colors: {
      primary: '#f59e0b',
      secondary: '#38bdf8',
      accent: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.45)',
      bg: '#0c1424',
    },
    recommendedGenres: ['R&B', 'Atmospheric Lo-Fi', 'Midnight Indie', 'Soul'],
    moodTags: ['solitary', 'reflective', 'cinematic', 'quiet'],
    energy: 0.35,
    bpmRange: [65, 88],
  },

  // 2. CHAI & SUTTA
  'chai-and-sutta': {
    id: 'chai-and-sutta',
    name: 'Chai & Sutta',
    category: 'Social & Lifestyle',
    emoji: '☕',
    tagline: 'Roadside tapri & steaming cutting chai',
    description: 'Late-night Indian roadside tea stall. An aluminium kettle steaming on the burner, cutting chai glasses, glowing incandescent tapri bulb, and a relaxed silhouette enjoying chai under the city night.',
    visualWorld: {
      environmentType: 'chai-tapri',
      sky: { color: '#10172b', stars: true },
      lighting: {
        ambientIntensity: 0.62,
        ambientColor: '#3b3a6e',
        keyColor: '#f97316', // warm tea glow
        keyIntensity: 2.3,
        rimColor: '#818cf8', // twilight skyline
        rimIntensity: 1.4,
      },
      fog: { color: '#0e1526', near: 6.5, far: 32.0 },
      terrain: { type: 'concrete-ledge', roughness: 0.55, metalness: 0.25 },
      particles: { type: 'steam', count: 55, color: '#fed7aa', speed: 0.02, size: 0.12, opacity: 0.35 },
      camera: { walkingBob: false, speed: 0.15, baseZ: 5.0 },
    },
    colors: {
      primary: '#f97316',
      secondary: '#818cf8',
      accent: '#fdba74',
      glow: 'rgba(249, 115, 22, 0.45)',
      bg: '#0d1424',
    },
    recommendedGenres: ['Indie Hindi', 'Acoustic Folk', 'Late-Night Lo-Fi', 'Warm Soul'],
    moodTags: ['nostalgic', 'unwinding', 'contemplative', 'warm'],
    energy: 0.3,
    bpmRange: [70, 95],
  },

  // 3. DEEP FOCUS
  'deep-focus': {
    id: 'deep-focus',
    name: 'Deep Focus',
    category: 'Focus & Flow',
    emoji: '🧠',
    tagline: 'Minimalist sanctuary & acoustic clarity',
    description: 'A distraction-free spatial desk sanctuary. A soft focused cone of task light illuminating clean slate surfaces, with microscopic dust motes floating in silence.',
    visualWorld: {
      environmentType: 'minimal-focus',
      sky: { color: '#0f172a', stars: false },
      lighting: {
        ambientIntensity: 0.60,
        ambientColor: '#475569',
        keyColor: '#f8fafc', // soft white desk light
        keyIntensity: 2.3,
        rimColor: '#38bdf8', // subtle blue tint
        rimIntensity: 1.3,
      },
      fog: { color: '#0d1628', near: 7.0, far: 34.0 },
      terrain: { type: 'matte-desk', roughness: 0.6, metalness: 0.2 },
      particles: { type: 'dust', count: 45, color: '#cbd5e1', speed: 0.005, size: 0.12, opacity: 0.35 },
      camera: { walkingBob: false, speed: 0.05, baseZ: 5.2 },
    },
    colors: {
      primary: '#94a3b8',
      secondary: '#38bdf8',
      accent: '#e2e8f0',
      glow: 'rgba(148, 163, 184, 0.35)',
      bg: '#0c1424',
    },
    recommendedGenres: ['Binaural Beats', 'Minimalist Piano', 'Ambient Drone', 'Brainwave Audio'],
    moodTags: ['laser-focused', 'pure-clarity', 'calm', 'distraction-free'],
    energy: 0.2,
    bpmRange: [55, 75],
  },

  // 4. LONG DRIVE
  'long-drive': {
    id: 'long-drive',
    name: 'Long Drive',
    category: 'Travel & Journey',
    emoji: '🚗',
    tagline: 'Infinite highway & receding headlight streaks',
    description: 'Cruising down an open highway at midnight. Red taillight streaks and oncoming white headlights streaming past the windshield with a deep sense of forward momentum.',
    visualWorld: {
      environmentType: 'highway',
      sky: { color: '#0f152a', stars: true },
      lighting: {
        ambientIntensity: 0.58,
        ambientColor: '#312e81',
        keyColor: '#ef4444', // taillight red
        keyIntensity: 2.2,
        rimColor: '#f8fafc', // headlight white
        rimIntensity: 1.5,
      },
      fog: { color: '#0d1326', near: 6.5, far: 32.0 },
      terrain: { type: 'highway-road', roughness: 0.3, metalness: 0.6 },
      particles: { type: 'streaks', count: 220, color: '#fca5a5', speed: 0.06, size: 0.06, opacity: 0.8 },
      camera: { walkingBob: false, speed: 1.4, baseZ: 4.6 },
    },
    colors: {
      primary: '#f43f5e',
      secondary: '#38bdf8',
      accent: '#fb7185',
      glow: 'rgba(244, 63, 94, 0.5)',
      bg: '#0b1122',
    },
    recommendedGenres: ['Synthwave', 'Alternative Rock', 'Melodic Techno', 'Roadtrip Rock'],
    moodTags: ['forward-motion', 'cinematic', 'free', 'adventurous'],
    energy: 0.7,
    bpmRange: [110, 130],
  },

  // 5. RAINY WINDOW
  'rainy-window': {
    id: 'rainy-window',
    name: 'Rainy Window',
    category: 'Cozy & Rain',
    emoji: '🌧️',
    tagline: 'Water droplets gliding down dark glass',
    description: 'Looking out through a rain-streaked window into a softly blurred nocturnal cityscape. Slow water rivulets drifting down the pane with warm glowing bokeh lights outside.',
    visualWorld: {
      environmentType: 'rain-window',
      sky: { color: '#0d182b', stars: false },
      lighting: {
        ambientIntensity: 0.60,
        ambientColor: '#254466',
        keyColor: '#38bdf8', // rain cool cyan
        keyIntensity: 2.0,
        rimColor: '#fb923c', // warm street bokeh
        rimIntensity: 1.4,
      },
      fog: { color: '#0c1628', near: 6.0, far: 32.0 },
      terrain: { type: 'window-glass', roughness: 0.05, metalness: 0.9 },
      particles: { type: 'raindrops', count: 200, color: '#7dd3fc', speed: 0.04, size: 0.05, opacity: 0.7 },
      camera: { walkingBob: false, speed: 0.1, baseZ: 4.7 },
    },
    colors: {
      primary: '#0284c7',
      secondary: '#38bdf8',
      accent: '#fb923c',
      glow: 'rgba(2, 132, 199, 0.45)',
      bg: '#0a1424',
    },
    recommendedGenres: ['Lofi Rain', 'Ambient Jazz', 'Gentle Piano', 'Sad Indie'],
    moodTags: ['melancholic', 'peaceful', 'cozy', 'sheltered'],
    energy: 0.25,
    bpmRange: [60, 80],
  },

  // 6. CODING LATE NIGHT
  'coding-late-night': {
    id: 'coding-late-night',
    name: 'Coding Late Night',
    category: 'Focus & Flow',
    emoji: '💻',
    tagline: 'Dark terminal glow & silent keyboard flow',
    description: 'The late-night programming zone. Neon cyan code lines reflecting off dark glass monitors, mechanical keyboard rhythm, and deep midnight serenity.',
    visualWorld: {
      environmentType: 'coding',
      sky: { color: '#0c1628', stars: false },
      lighting: {
        ambientIntensity: 0.58,
        ambientColor: '#24344d',
        keyColor: '#06b6d4', // terminal cyan glow
        keyIntensity: 2.2,
        rimColor: '#8b5cf6', // purple keyboard backlight
        rimIntensity: 1.4,
      },
      fog: { color: '#0b1424', near: 6.5, far: 32.0 },
      terrain: { type: 'dark-desk', roughness: 0.7, metalness: 0.3 },
      particles: { type: 'code-particles', count: 160, color: '#22d3ee', speed: 0.02, size: 0.04, opacity: 0.6 },
      camera: { walkingBob: false, speed: 0.1, baseZ: 5.0 },
    },
    colors: {
      primary: '#06b6d4',
      secondary: '#8b5cf6',
      accent: '#22d3ee',
      glow: 'rgba(6, 182, 212, 0.45)',
      bg: '#0a1222',
    },
    recommendedGenres: ['Cyberpunk Lo-Fi', 'Deep Techno', 'Dark Ambient', 'Glitch Beats'],
    moodTags: ['flow-state', 'hyper-focus', 'digital', 'nocturnal'],
    energy: 0.5,
    bpmRange: [85, 115],
  },

  // 7. STARGAZING
  'stargazing': {
    id: 'stargazing',
    name: 'Stargazing',
    category: 'Nature & Serenity',
    emoji: '✨',
    tagline: 'Cosmic dome & boundless starry skies',
    description: 'Lying beneath a pristine high-altitude night sky. Countless twinkling stars, faint cosmic nebula dust, and a gentle crescent glow on the horizon.',
    visualWorld: {
      environmentType: 'celestial',
      sky: { color: '#0b1024', stars: true },
      lighting: {
        ambientIntensity: 0.60,
        ambientColor: '#2d2e63',
        keyColor: '#c084fc', // nebula purple
        keyIntensity: 1.6,
        rimColor: '#67e8f9', // starlight
        rimIntensity: 1.4,
      },
      fog: { color: '#0a0f22', near: 8.0, far: 38.0 },
      terrain: { type: 'open-meadow', roughness: 0.9, metalness: 0.05 },
      particles: { type: 'stars', count: 280, color: '#e0e7ff', speed: 0.006, size: 0.045, opacity: 0.75 },
      camera: { walkingBob: false, speed: 0.1, baseZ: 5.2 },
    },
    colors: {
      primary: '#818cf8',
      secondary: '#c084fc',
      accent: '#67e8f9',
      glow: 'rgba(129, 140, 248, 0.45)',
      bg: '#090e20',
    },
    recommendedGenres: ['Space Ambient', 'Neo-Classical', 'Ethereal Post-Rock', 'Drone'],
    moodTags: ['infinite', 'awe-inspiring', 'tranquil', 'celestial'],
    energy: 0.2,
    bpmRange: [50, 75],
  },

  // 8. FOREST ESCAPE
  'forest-escape': {
    id: 'forest-escape',
    name: 'Forest Escape',
    category: 'Nature & Serenity',
    emoji: '🌲',
    tagline: 'Misty pine forest & sunbeams through fog',
    description: 'Deep inside a quiet mossy evergreen forest. Drifting morning mist weaving between pine trunks, sunbeams breaking through the canopy, and floating bio-luminescent spores.',
    visualWorld: {
      environmentType: 'nature',
      sky: { color: '#030d07', stars: false },
      lighting: {
        ambientIntensity: 0.38,
        ambientColor: '#14532d',
        keyColor: '#10b981', // emerald moss
        keyIntensity: 1.5,
        rimColor: '#a3e635', // sunlit leaves
        rimIntensity: 1.0,
      },
      fog: { color: '#030d07', near: 3.0, far: 14.0 },
      terrain: { type: 'forest-ground', roughness: 0.9, metalness: 0.1 },
      particles: { type: 'fireflies', count: 140, color: '#86efac', speed: 0.015, size: 0.055, opacity: 0.65 },
      camera: { walkingBob: true, speed: 0.4, baseZ: 4.9 },
    },
    colors: {
      primary: '#059669',
      secondary: '#84cc16',
      accent: '#10b981',
      glow: 'rgba(5, 150, 105, 0.45)',
      bg: '#030d07',
    },
    recommendedGenres: ['Organic Deep House', 'Acoustic Folk', 'Binaural Nature', 'Woodland Chill'],
    moodTags: ['grounded', 'rejuvenating', 'mossy', 'organic'],
    energy: 0.3,
    bpmRange: [65, 90],
  },

  // 9. GAMING
  'gaming': {
    id: 'gaming',
    name: 'Gaming',
    category: 'Energy & Movement',
    emoji: '🎮',
    tagline: 'Dual monitors, mechanical clicks & ambient bias glow',
    description: 'A premium late-night battlestation. Dual monitors, mechanical keyboard with soft breathing underglow, gaming chair, sleek PC tower, and controlled bias room lighting.',
    visualWorld: {
      environmentType: 'gaming',
      sky: { color: '#0a141e', stars: false },
      lighting: {
        ambientIntensity: 0.58,
        ambientColor: '#134e4a',
        keyColor: '#10b981', // neon emerald
        keyIntensity: 2.2,
        rimColor: '#06b6d4', // cyber cyan
        rimIntensity: 1.5,
      },
      fog: { color: '#09131c', near: 6.5, far: 32.0 },
      terrain: { type: 'grid-floor', roughness: 0.2, metalness: 0.8 },
      particles: { type: 'laser-trails', count: 210, color: '#34d399', speed: 0.045, size: 0.06, opacity: 0.75 },
      camera: { walkingBob: false, speed: 0.5, baseZ: 4.8 },
    },
    colors: {
      primary: '#10b981',
      secondary: '#06b6d4',
      accent: '#22c55e',
      glow: 'rgba(16, 185, 129, 0.5)',
      bg: '#08121a',
    },
    recommendedGenres: ['Phonk', 'Cyberpunk Bass', 'Fast Chiptune', 'Synth Metal'],
    moodTags: ['competitive', 'high-voltage', 'laser-sharp', 'dynamic'],
    energy: 0.85,
    bpmRange: [120, 150],
  },

  // 10. BONFIRE
  'bonfire': {
    id: 'bonfire',
    name: 'Bonfire',
    category: 'Social & Lifestyle',
    emoji: '🔥',
    tagline: 'Crackling campfire embers & starry night',
    description: 'Sitting around a crackling campfire under an open night sky. Dancing fiery embers floating upwards into the chill mountain air, wrapped in warm orange radiance.',
    visualWorld: {
      environmentType: 'nature',
      sky: { color: '#0c0504', stars: true },
      lighting: {
        ambientIntensity: 0.2,
        ambientColor: '#451a03',
        keyColor: '#f97316', // fire glow
        keyIntensity: 2.2,
        rimColor: '#fbbf24', // ember yellow
        rimIntensity: 1.2,
      },
      fog: { color: '#0c0504', near: 2.8, far: 14.0 },
      terrain: { type: 'rocky-ground', roughness: 0.85, metalness: 0.1 },
      particles: { type: 'embers', count: 160, color: '#ea580c', speed: 0.03, size: 0.05, opacity: 0.8 },
      camera: { walkingBob: false, speed: 0.1, baseZ: 4.8 },
    },
    colors: {
      primary: '#ea580c',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      glow: 'rgba(234, 88, 12, 0.5)',
      bg: '#0c0504',
    },
    recommendedGenres: ['Acoustic Jam', 'Campfire Indie', 'Mountain Folk', 'Warm Lo-Fi'],
    moodTags: ['cozy', 'crackling', 'communal', 'campfire'],
    energy: 0.4,
    bpmRange: [70, 95],
  },

  // 11. BATHING
  'bathing': {
    id: 'bathing',
    name: 'Bathing',
    category: 'Cozy & Rain',
    emoji: '🛁',
    tagline: 'Warm steamy bathroom & frosted glass bubbles',
    description: 'An abstract, tranquil warm bath sanctuary. Floating billows of gentle steam, soft frosted glass reflections, warm lavender-infused lighting, and total muscular relaxation.',
    visualWorld: {
      environmentType: 'rain-window',
      sky: { color: '#090812', stars: false },
      lighting: {
        ambientIntensity: 0.4,
        ambientColor: '#2e1065',
        keyColor: '#c084fc', // warm lavender
        keyIntensity: 1.4,
        rimColor: '#2dd4bf', // warm teal water
        rimIntensity: 0.9,
      },
      fog: { color: '#090812', near: 2.0, far: 11.0 },
      terrain: { type: 'tile-reflection', roughness: 0.1, metalness: 0.5 },
      particles: { type: 'steam', count: 120, color: '#e9d5ff', speed: 0.015, size: 0.05, opacity: 0.45 },
      camera: { walkingBob: false, speed: 0.08, baseZ: 5.0 },
    },
    colors: {
      primary: '#a855f7',
      secondary: '#14b8a6',
      accent: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.4)',
      bg: '#090812',
    },
    recommendedGenres: ['Dream Pop', 'Slow Ambient', 'Float Chill', 'Subtle Vocals'],
    moodTags: ['unwinding', 'steamy', 'sensory', 'peaceful'],
    energy: 0.2,
    bpmRange: [55, 75],
  },

  // 12. GYM MODE
  'gym-mode': {
    id: 'gym-mode',
    name: 'Gym Mode',
    category: 'Energy & Movement',
    emoji: '⚡',
    tagline: 'Heavy bass velocity & industrial neon strobes',
    description: 'Pure athletic kinetic power. Blood-pumping industrial crimson strobes, rhythmic bass pulses, accelerating light tunnels, and unyielding momentum.',
    visualWorld: {
      environmentType: 'kinetic-cyber',
      sky: { color: '#0f0205', stars: false },
      lighting: {
        ambientIntensity: 0.35,
        ambientColor: '#4c0519',
        keyColor: '#e11d48', // electric crimson
        keyIntensity: 2.2,
        rimColor: '#f97316', // blaze orange
        rimIntensity: 1.6,
      },
      fog: { color: '#0f0205', near: 2.5, far: 12.0 },
      terrain: { type: 'rubber-flooring', roughness: 0.4, metalness: 0.6 },
      particles: { type: 'hyper-sparks', count: 240, color: '#f43f5e', speed: 0.055, size: 0.065, opacity: 0.8 },
      camera: { walkingBob: false, speed: 1.1, baseZ: 4.5 },
    },
    colors: {
      primary: '#e11d48',
      secondary: '#f97316',
      accent: '#fb7185',
      glow: 'rgba(225, 29, 72, 0.55)',
      bg: '#0f0205',
    },
    recommendedGenres: ['Drum & Bass', 'Hardwave', 'Phonk Workout', 'Industrial Tech'],
    moodTags: ['high-adrenaline', 'unstoppable', 'explosive', 'pumping'],
    energy: 0.95,
    bpmRange: [130, 175],
  },

  // 13. TERRACE WALKING
  'terrace-walking': {
    id: 'terrace-walking',
    name: 'Terrace Walking',
    category: 'Night & Solitude',
    emoji: '🚶',
    tagline: 'Rooftop pacing under twilight gradients',
    description: 'Pacing across an open apartment rooftop as dusk yields to night. Cool wind on your face, city rooftops sprawling below, and a rhythm of quiet thoughts.',
    visualWorld: {
      environmentType: 'rooftop',
      sky: { color: '#101226', stars: true },
      lighting: {
        ambientIntensity: 0.58,
        ambientColor: '#3730a3',
        keyColor: '#f472b6', // sunset pink
        keyIntensity: 1.8,
        rimColor: '#38bdf8', // dusk blue
        rimIntensity: 1.3,
      },
      fog: { color: '#0e1124', near: 6.5, far: 32.0 },
      terrain: { type: 'rooftop-tiles', roughness: 0.7, metalness: 0.1 },
      particles: { type: 'breeze', count: 120, color: '#e0e7ff', speed: 0.02, size: 0.04, opacity: 0.4 },
      camera: { walkingBob: true, speed: 0.8, baseZ: 4.9 },
    },
    colors: {
      primary: '#ec4899',
      secondary: '#38bdf8',
      accent: '#f472b6',
      glow: 'rgba(236, 72, 153, 0.45)',
      bg: '#0d1022',
    },
    recommendedGenres: ['Indian Indie', 'Downtempo', 'Evening Lofi', 'Alternative'],
    moodTags: ['contemplative', 'breezy', 'pacing', 'open-air'],
    energy: 0.4,
    bpmRange: [75, 95],
  },

  // 14. TERRACE EVENING
  'terrace-evening': {
    id: 'terrace-evening',
    name: 'Terrace Evening',
    category: 'Night & Solitude',
    emoji: '🌇',
    tagline: 'Golden hour sunset over rooftop skylines',
    description: 'Watching the last rays of golden sun dip behind the city skyline. Golden amber light bathing brick parapets, long shadows, and gentle twilight settling in.',
    visualWorld: {
      environmentType: 'rooftop',
      sky: { color: '#160814', stars: false },
      lighting: {
        ambientIntensity: 0.45,
        ambientColor: '#581c87',
        keyColor: '#f59e0b', // golden sun
        keyIntensity: 1.8,
        rimColor: '#ec4899', // magenta horizon
        rimIntensity: 1.1,
      },
      fog: { color: '#160814', near: 3.2, far: 15.0 },
      terrain: { type: 'rooftop-tiles', roughness: 0.7, metalness: 0.1 },
      particles: { type: 'golden-dust', count: 130, color: '#fde68a', speed: 0.015, size: 0.045, opacity: 0.5 },
      camera: { walkingBob: false, speed: 0.2, baseZ: 5.0 },
    },
    colors: {
      primary: '#f59e0b',
      secondary: '#ec4899',
      accent: '#fbbf24',
      glow: 'rgba(245, 158, 11, 0.45)',
      bg: '#160814',
    },
    recommendedGenres: ['Sunset Acoustic', 'Warm Chillhop', 'Indie Pop', 'Melodic Soul'],
    moodTags: ['golden-hour', 'nostalgic', 'soothing', 'serene'],
    energy: 0.35,
    bpmRange: [70, 90],
  },

  // 15. MONSOON
  'monsoon': {
    id: 'monsoon',
    name: 'Monsoon',
    category: 'Cozy & Rain',
    emoji: '⛈️',
    tagline: 'Heavy tropical downpour & grey thunder skies',
    description: 'A torrential monsoon downpour. Sheets of cool tropical rain cascading down, distant thunder rumble, dark grey skies, and earthy petrichor dampness.',
    visualWorld: {
      environmentType: 'rain-window',
      sky: { color: '#04090e', stars: false },
      lighting: {
        ambientIntensity: 0.3,
        ambientColor: '#164e63',
        keyColor: '#0ea5e9', // deep aqua
        keyIntensity: 1.8,
        rimColor: '#94a3b8', // thunder grey
        rimIntensity: 1.2,
      },
      fog: { color: '#04090e', near: 1.8, far: 10.0 },
      terrain: { type: 'wet-slate', roughness: 0.05, metalness: 0.8 },
      particles: { type: 'heavy-rain', count: 280, color: '#38bdf8', speed: 0.07, size: 0.06, opacity: 0.85 },
      camera: { walkingBob: false, speed: 0.2, baseZ: 4.8 },
    },
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#38bdf8',
      glow: 'rgba(14, 165, 233, 0.5)',
      bg: '#04090e',
    },
    recommendedGenres: ['Indian Monsoon Classical', 'Heavy Rain Soundscapes', 'Dark Lofi', 'Acoustic Rain'],
    moodTags: ['petrichor', 'torrential', 'cosmic-wash', 'brooding'],
    energy: 0.4,
    bpmRange: [60, 85],
  },

  // 16. BED ROT
  'bed-rot': {
    id: 'bed-rot',
    name: 'Bed Rot',
    category: 'Cozy & Rain',
    emoji: '🛌',
    tagline: 'Cocoon of soft blankets & zero obligations',
    description: 'Burrowed beneath heavy duvets in a softly dimmed room. Phone propped up, daylight shut out by blackout curtains, and absolute guilt-free horizontal comfort.',
    visualWorld: {
      environmentType: 'minimal-focus',
      sky: { color: '#08070d', stars: false },
      lighting: {
        ambientIntensity: 0.22,
        ambientColor: '#1e1b4b',
        keyColor: '#a78bfa', // soft screen lavender
        keyIntensity: 1.1,
        rimColor: '#f472b6', // warm blanket pink
        rimIntensity: 0.6,
      },
      fog: { color: '#08070d', near: 3.8, far: 15.0 },
      terrain: { type: 'soft-fabric', roughness: 0.95, metalness: 0.0 },
      particles: { type: 'slow-dust', count: 80, color: '#c4b5fd', speed: 0.005, size: 0.035, opacity: 0.3 },
      camera: { walkingBob: false, speed: 0.03, baseZ: 5.3 },
    },
    colors: {
      primary: '#a78bfa',
      secondary: '#f472b6',
      accent: '#c4b5fd',
      glow: 'rgba(167, 139, 250, 0.35)',
      bg: '#08070d',
    },
    recommendedGenres: ['Bedroom Pop', 'Slowed + Reverb', 'Dreamcore', 'Subtle Indie'],
    moodTags: ['cozy', 'horizontal', 'safe', 'unbothered'],
    energy: 0.15,
    bpmRange: [50, 70],
  },

  // 17. STUDY ROOM
  'study-room': {
    id: 'study-room',
    name: 'Study Room',
    category: 'Focus & Flow',
    emoji: '📚',
    tagline: 'Warm amber desk lamp & turning book pages',
    description: 'A secluded wooden study nook lined with book spines. A green banker lamp or warm incandescent bulb pooling light over open notebooks and highlighters.',
    visualWorld: {
      environmentType: 'minimal-focus',
      sky: { color: '#090704', stars: false },
      lighting: {
        ambientIntensity: 0.3,
        ambientColor: '#451a03',
        keyColor: '#d97706', // warm study lamp
        keyIntensity: 1.7,
        rimColor: '#10b981', // banker lamp emerald
        rimIntensity: 0.8,
      },
      fog: { color: '#090704', near: 3.5, far: 16.0 },
      terrain: { type: 'wood-desk', roughness: 0.7, metalness: 0.1 },
      particles: { type: 'dust-motes', count: 100, color: '#fde68a', speed: 0.008, size: 0.035, opacity: 0.4 },
      camera: { walkingBob: false, speed: 0.05, baseZ: 5.1 },
    },
    colors: {
      primary: '#d97706',
      secondary: '#10b981',
      accent: '#fbbf24',
      glow: 'rgba(217, 119, 6, 0.4)',
      bg: '#090704',
    },
    recommendedGenres: ['Classical Study', 'Lo-Fi Beats', 'Acoustic Guitar', 'Binaural Alpha'],
    moodTags: ['diligent', 'scholarly', 'grounded', 'uninterrupted'],
    energy: 0.3,
    bpmRange: [60, 80],
  },

  // 18. BEACH EVENING
  'beach-evening': {
    id: 'beach-evening',
    name: 'Beach Evening',
    category: 'Nature & Serenity',
    emoji: '🏖️',
    tagline: 'Pacific tide horizon & pastel dusk reflections',
    description: 'Standing barefoot on wet shoreline sands as twilight descends over the ocean. Gentle foam waves lapping rhythmically, pastel violet sky, and salty sea air.',
    visualWorld: {
      environmentType: 'nature',
      sky: { color: '#0e0b1c', stars: true },
      lighting: {
        ambientIntensity: 0.4,
        ambientColor: '#3b0764',
        keyColor: '#f43f5e', // sunset coral
        keyIntensity: 1.4,
        rimColor: '#38bdf8', // ocean cyan
        rimIntensity: 1.1,
      },
      fog: { color: '#0e0b1c', near: 4.0, far: 18.0 },
      terrain: { type: 'wet-sand', roughness: 0.2, metalness: 0.6 },
      particles: { type: 'spray', count: 130, color: '#bae6fd', speed: 0.02, size: 0.045, opacity: 0.5 },
      camera: { walkingBob: false, speed: 0.15, baseZ: 5.0 },
    },
    colors: {
      primary: '#f43f5e',
      secondary: '#38bdf8',
      accent: '#a855f7',
      glow: 'rgba(244, 63, 94, 0.45)',
      bg: '#0e0b1c',
    },
    recommendedGenres: ['Tropical Chill', 'Indie Surf', 'Sunset House', 'Dream Pop'],
    moodTags: ['tidal', 'warm-breeze', 'boundless', 'peaceful'],
    energy: 0.35,
    bpmRange: [75, 98],
  },

  // 19. TRAIN JOURNEY
  'train-journey': {
    id: 'train-journey',
    name: 'Train Journey',
    category: 'Travel & Journey',
    emoji: '🚆',
    tagline: 'Rhythmic rail clatter & passing countryside',
    description: 'Leaning your forehead against a cool train window seat at dusk. Trees and telephone poles whizzing past rhythmically as distant rural lights flicker in the dark.',
    visualWorld: {
      environmentType: 'highway',
      sky: { color: '#0a0814', stars: true },
      lighting: {
        ambientIntensity: 0.32,
        ambientColor: '#2e1065',
        keyColor: '#f59e0b', // passing station light
        keyIntensity: 1.7,
        rimColor: '#6366f1', // night carriage blue
        rimIntensity: 1.1,
      },
      fog: { color: '#0a0814', near: 3.0, far: 15.0 },
      terrain: { type: 'rail-ballast', roughness: 0.6, metalness: 0.3 },
      particles: { type: 'passing-sparks', count: 180, color: '#fde047', speed: 0.05, size: 0.05, opacity: 0.7 },
      camera: { walkingBob: false, speed: 1.2, baseZ: 4.8 },
    },
    colors: {
      primary: '#f59e0b',
      secondary: '#6366f1',
      accent: '#fde047',
      glow: 'rgba(245, 158, 11, 0.45)',
      bg: '#0a0814',
    },
    recommendedGenres: ['Acoustic Indie', 'Midwest Emo', 'Folk Rock', 'Melodic Lo-Fi'],
    moodTags: ['rhythmic', 'transit', 'pensive', 'drifting'],
    energy: 0.5,
    bpmRange: [85, 110],
  },

  // 20. AIRPORT NIGHTS
  'airport-nights': {
    id: 'airport-nights',
    name: 'Airport Nights',
    category: 'Travel & Journey',
    emoji: '✈️',
    tagline: 'Tarmac runway beacons & midnight terminal glass',
    description: 'Sitting at an empty departure terminal at 2 AM. Blue and amber runway beacon lights glowing through immense panoramic glass as airliners rest in the dark.',
    visualWorld: {
      environmentType: 'urban-night',
      sky: { color: '#050810', stars: true },
      lighting: {
        ambientIntensity: 0.28,
        ambientColor: '#0f172a',
        keyColor: '#0284c7', // runway blue beacon
        keyIntensity: 1.8,
        rimColor: '#f59e0b', // taxiway amber
        rimIntensity: 1.3,
      },
      fog: { color: '#050810', near: 3.5, far: 16.0 },
      terrain: { type: 'tarmac-concrete', roughness: 0.4, metalness: 0.5 },
      particles: { type: 'beacon-dust', count: 160, color: '#38bdf8', speed: 0.015, size: 0.045, opacity: 0.6 },
      camera: { walkingBob: false, speed: 0.2, baseZ: 5.0 },
    },
    colors: {
      primary: '#0284c7',
      secondary: '#f59e0b',
      accent: '#38bdf8',
      glow: 'rgba(2, 132, 199, 0.45)',
      bg: '#050810',
    },
    recommendedGenres: ['Ambient Drone', 'Midnight Electronic', 'Deep House', 'Cinematic Soundscapes'],
    moodTags: ['liminal', 'departure', 'transit', 'stillness'],
    energy: 0.35,
    bpmRange: [65, 90],
  },

  // 21. LATE NIGHT ALONE
  'late-night-alone': {
    id: 'late-night-alone',
    name: 'Late Night Alone',
    category: 'Night & Solitude',
    emoji: '🌙',
    tagline: 'Total solitude & quiet dark room clarity',
    description: 'The profound silence of being completely awake when the entire world is asleep. A subtle cool blue moonbeam slicing across the dark ceiling, zero notifications.',
    visualWorld: {
      environmentType: 'minimal-focus',
      sky: { color: '#040508', stars: true },
      lighting: {
        ambientIntensity: 0.18,
        ambientColor: '#1e1b4b',
        keyColor: '#6366f1', // indigo moonlight
        keyIntensity: 1.3,
        rimColor: '#c084fc', // faint violet
        rimIntensity: 0.7,
      },
      fog: { color: '#040508', near: 4.0, far: 18.0 },
      terrain: { type: 'dark-carpet', roughness: 0.9, metalness: 0.0 },
      particles: { type: 'starlight', count: 110, color: '#c7d2fe', speed: 0.007, size: 0.04, opacity: 0.4 },
      camera: { walkingBob: false, speed: 0.05, baseZ: 5.2 },
    },
    colors: {
      primary: '#6366f1',
      secondary: '#c084fc',
      accent: '#a5b4fc',
      glow: 'rgba(99, 102, 241, 0.4)',
      bg: '#040508',
    },
    recommendedGenres: ['Midnight Indie', 'Vocal Lo-Fi', 'Sadcore', 'Ambient Drone'],
    moodTags: ['introspective', 'solitary', 'untethered', 'peaceful'],
    energy: 0.2,
    bpmRange: [55, 75],
  },

  // 22. PEACEFUL MORNING
  'peaceful-morning': {
    id: 'peaceful-morning',
    name: 'Peaceful Morning',
    category: 'Nature & Serenity',
    emoji: '☕',
    tagline: 'First golden sunbeams & fresh clean dew',
    description: 'The world waking up in gentle optimism. Pale golden sunrise light warming cool morning air, soft birdsong, fresh steam rising from coffee, and clean horizons.',
    visualWorld: {
      environmentType: 'rooftop',
      sky: { color: '#0f101c', stars: false },
      lighting: {
        ambientIntensity: 0.5,
        ambientColor: '#fef3c7',
        keyColor: '#fbbf24', // soft dawn sun
        keyIntensity: 1.6,
        rimColor: '#38bdf8', // morning sky blue
        rimIntensity: 1.1,
      },
      fog: { color: '#0f101c', near: 3.8, far: 17.0 },
      terrain: { type: 'morning-balcony', roughness: 0.6, metalness: 0.2 },
      particles: { type: 'dawn-dust', count: 130, color: '#fde68a', speed: 0.012, size: 0.04, opacity: 0.5 },
      camera: { walkingBob: false, speed: 0.15, baseZ: 5.0 },
    },
    colors: {
      primary: '#fbbf24',
      secondary: '#38bdf8',
      accent: '#f59e0b',
      glow: 'rgba(251, 191, 36, 0.45)',
      bg: '#0f101c',
    },
    recommendedGenres: ['Morning Acoustic', 'Bossa Nova', 'Soft Indie', 'Uplifting Folk'],
    moodTags: ['optimistic', 'fresh', 'gentle', 'rejuvenating'],
    energy: 0.35,
    bpmRange: [70, 95],
  },

  // 23. HEADPHONES ON
  'headphones-on': {
    id: 'headphones-on',
    name: 'Headphones On',
    category: 'Focus & Flow',
    emoji: '🎧',
    tagline: 'World muted & pure auditory immersion',
    description: 'Sliding large noise-canceling cans over your ears. The noisy world vanishes instantly into pure spatial audio bliss, surround frequencies, and private euphoria.',
    visualWorld: {
      environmentType: 'kinetic-cyber',
      sky: { color: '#06060c', stars: false },
      lighting: {
        ambientIntensity: 0.3,
        ambientColor: '#2e1065',
        keyColor: '#a855f7', // electric violet
        keyIntensity: 1.8,
        rimColor: '#06b6d4', // cyan frequency
        rimIntensity: 1.3,
      },
      fog: { color: '#06060c', near: 3.2, far: 15.0 },
      terrain: { type: 'audio-grid', roughness: 0.3, metalness: 0.7 },
      particles: { type: 'spectrum-pulses', count: 190, color: '#c084fc', speed: 0.035, size: 0.055, opacity: 0.7 },
      camera: { walkingBob: false, speed: 0.3, baseZ: 4.8 },
    },
    colors: {
      primary: '#a855f7',
      secondary: '#06b6d4',
      accent: '#c084fc',
      glow: 'rgba(168, 85, 247, 0.5)',
      bg: '#06060c',
    },
    recommendedGenres: ['Audiophile Masters', 'Spatial Electronic', 'Indie Electronic', 'Deep House'],
    moodTags: ['immersive', 'isolated', 'audiophile', 'private'],
    energy: 0.65,
    bpmRange: [90, 125],
  },

  // 24. SKY SHIFT (Default Atmospheric Dimension)
  'sky-shift': {
    id: 'sky-shift',
    name: 'Sky Shift',
    category: 'Nature & Serenity',
    emoji: '☁️',
    tagline: 'Celestial cloudscapes & boundless horizon drift',
    description: 'Floating through high-altitude pastel cloudscapes as golden sunlight refracts into peach and lilac twilight. Boundless perspective and airy freedom.',
    visualWorld: {
      environmentType: 'celestial',
      sky: { color: '#08090e', stars: true },
      lighting: {
        ambientIntensity: 0.45,
        ambientColor: '#e0e7ff',
        keyColor: '#c084fc', // lilac twilight
        keyIntensity: 1.4,
        rimColor: '#38bdf8', // sky cyan
        rimIntensity: 1.0,
      },
      fog: { color: '#08090e', near: 4.0, far: 18.0 },
      terrain: { type: 'cloud-horizon', roughness: 0.9, metalness: 0.1 },
      particles: { type: 'stardust', count: 160, color: '#c4b5fd', speed: 0.015, size: 0.05, opacity: 0.5 },
      camera: { walkingBob: false, speed: 0.2, baseZ: 5.0 },
    },
    colors: {
      primary: '#a855f7',
      secondary: '#38bdf8',
      accent: '#f472b6',
      glow: 'rgba(168, 85, 247, 0.45)',
      bg: '#08090e',
    },
    recommendedGenres: ['Dream Pop', 'Ambient Lofi', 'Atmospheric Chill', 'Shoegaze'],
    moodTags: ['weightless', 'airy', 'celestial', 'transcendent'],
    energy: 0.35,
    bpmRange: [65, 90],
  },
};

// Canonical 15 Fixed Vibes Architecture
// Permanent fixed list of exactly 15 Vibes for Mimicu:
// 1. 3 AM Night Walk
// 2. Chai & Sutta
// 3. Rainy Window
// 4. Coding Late Night
// 5. Stargazing
// 6. Deep Focus
// 7. Study Session
// 8. Gaming
// 9. Long Drive
// 10. Terrace Walking
// 11. Morning Walk
// 12. Bathing / Self Care
// 13. Rain + Chai
// 14. Beach Vibes
// 15. Sunset Chill

// Ensure canonical representations for the 15 vibes
if (VIBES['study-room']) {
  VIBES['study-session'] = { ...VIBES['study-room'], id: 'study-session', name: 'Study Session' };
}
if (VIBES['peaceful-morning']) {
  VIBES['morning-walk'] = { ...VIBES['peaceful-morning'], id: 'morning-walk', name: 'Morning Walk' };
}
if (VIBES['bathing']) {
  VIBES['bathing'].name = 'Bathing / Self Care';
}
if (VIBES['monsoon']) {
  VIBES['rain-plus-chai'] = { ...VIBES['monsoon'], id: 'rain-plus-chai', name: 'Rain + Chai' };
}
if (VIBES['beach-evening']) {
  VIBES['beach-vibes'] = { ...VIBES['beach-evening'], id: 'beach-vibes', name: 'Beach Vibes' };
}
if (VIBES['terrace-evening']) {
  VIBES['sunset-chill'] = { ...VIBES['terrace-evening'], id: 'sunset-chill', name: 'Sunset Chill' };
}

// Aliases for URL routing compatibility
VIBES['chai-sutta'] = VIBES['chai-and-sutta'];
VIBES['study-room'] = VIBES['study-session'];
VIBES['peaceful-morning'] = VIBES['morning-walk'];
VIBES['monsoon'] = VIBES['rain-plus-chai'];
VIBES['beach-evening'] = VIBES['beach-vibes'];
VIBES['terrace-evening'] = VIBES['sunset-chill'];

export const DEFAULT_VIBE_ID = '3-am-night-walk';

export const VIBE_LIST = [
  VIBES['3-am-night-walk'],
  VIBES['chai-and-sutta'],
  VIBES['rainy-window'],
  VIBES['coding-late-night'],
  VIBES['stargazing'],
  VIBES['deep-focus'],
  VIBES['study-session'] || VIBES['study-room'],
  VIBES['gaming'],
  VIBES['long-drive'],
  VIBES['terrace-walking'],
  VIBES['morning-walk'] || VIBES['peaceful-morning'],
  VIBES['bathing'],
  VIBES['rain-plus-chai'] || VIBES['monsoon'],
  VIBES['beach-vibes'] || VIBES['beach-evening'],
  VIBES['sunset-chill'] || VIBES['terrace-evening'],
].filter(Boolean);

export const VIBE_CATEGORIES = [
  'All Vibes',
  'Night & Solitude',
  'Focus & Flow',
  'Cozy & Rain',
  'Nature & Serenity',
  'Social & Lifestyle',
];
