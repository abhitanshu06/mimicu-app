/**
 * tracks.js
 * 
 * Centralized Track Catalog for Mimicu Phase 4.
 * Defines royalty-free, atmospheric tracks mapped across all 15 Vibes.
 * 
 * Schema:
 * {
 *   id: string,
 *   title: string,
 *   artist: string,
 *   album: string,
 *   duration: number, // in seconds
 *   coverArtUrl: string,
 *   audioUrl: string,
 *   vibeIds: string[],
 *   genres: string[],
 *   mood: string[],
 *   bpm: number,
 *   energy: number // 0.0 - 1.0
 * }
 */

// Curated royalty-free / Creative Commons ambient & lo-fi audio demo sources
// (Hosted on fast, reliable public royalty-free CDN audio streams with Web Audio procedural fallback)
const DEMO_AUDIO = {
  ambientLoFi: 'https://cdn.freesound.org/previews/557/557815_11861866-lq.mp3',
  midnightRain: 'https://cdn.freesound.org/previews/517/517743_5674468-lq.mp3',
  acousticWarmth: 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3',
  deepDrone: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
  synthwaveDrive: 'https://cdn.freesound.org/previews/573/573381_11861866-lq.mp3',
  celestialPad: 'https://cdn.freesound.org/previews/467/467972_5674468-lq.mp3',
  cyberBeats: 'https://cdn.freesound.org/previews/689/689382_11861866-lq.mp3',
  nightBreeze: 'https://cdn.freesound.org/previews/538/538554_5674468-lq.mp3',
};

export const TRACKS = [
  // --- 3 AM NIGHT WALK & NIGHT DRIVE ---
  {
    id: 'track-3am-1',
    title: 'Empty Streetlights',
    artist: 'Aarav Sen',
    album: 'Nocturne 03:00',
    duration: 214,
    coverArtUrl: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #f59e0b 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['3-am-night-walk', 'night-drive', 'late-night-alone', 'headphones-on'],
    genres: ['Atmospheric Lo-Fi', 'Midnight Indie', 'R&B'],
    mood: ['solitary', 'reflective', 'quiet'],
    bpm: 74,
    energy: 0.32,
  },
  {
    id: 'track-3am-2',
    title: 'Asphalt & Puddles',
    artist: 'Mira & The Drift',
    album: 'Nocturne 03:00',
    duration: 198,
    coverArtUrl: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.midnightRain,
    vibeIds: ['3-am-night-walk', 'rainy-window', 'late-night-alone', 'headphones-on'],
    genres: ['Lo-Fi Beats', 'Chillout', 'Dream Pop'],
    mood: ['contemplative', 'nocturnal', 'pensive'],
    bpm: 68,
    energy: 0.28,
  },
  {
    id: 'track-3am-3',
    title: 'Echoes at Midnight',
    artist: 'Siddharth Rao',
    album: 'City Lights Fade',
    duration: 236,
    coverArtUrl: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #10b981 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['3-am-night-walk', 'terrace-walking', 'long-drive'],
    genres: ['Soul', 'Midnight Indie', 'Acoustic'],
    mood: ['cinematic', 'soothing', 'spacious'],
    bpm: 82,
    energy: 0.38,
  },
  {
    id: 'track-3am-4',
    title: 'Neon Horizon Solitude',
    artist: 'Kavya Sharma',
    album: 'Echoes of Midnight',
    duration: 185,
    coverArtUrl: 'linear-gradient(135deg, #3b0764 0%, #581c87 50%, #a855f7 100%)',
    audioUrl: DEMO_AUDIO.celestialPad,
    vibeIds: ['3-am-night-walk', 'night-drive', 'sky-shift'],
    genres: ['Dream Pop', 'Ambient Chill'],
    mood: ['dreamy', 'solitary', 'transcendent'],
    bpm: 72,
    energy: 0.3,
  },

  // --- CHAI & SUTTA & CHILL ---
  {
    id: 'track-chai-1',
    title: 'Cutting Chai Conversations',
    artist: 'Raghav & Tanmay',
    album: 'Tapri Tales',
    duration: 189,
    coverArtUrl: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #f97316 100%)',
    audioUrl: DEMO_AUDIO.acousticWarmth,
    vibeIds: ['chai-and-sutta', 'chill', 'terrace-evening'],
    genres: ['Indie Hindi', 'Acoustic Folk', 'Warm Soul'],
    mood: ['nostalgic', 'unwinding', 'warm'],
    bpm: 78,
    energy: 0.34,
  },
  {
    id: 'track-chai-2',
    title: 'Kettle Whistle Melody',
    artist: 'The Roadside Trio',
    album: 'Tapri Tales',
    duration: 205,
    coverArtUrl: 'linear-gradient(135deg, #292524 0%, #44403c 50%, #fb923c 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['chai-and-sutta', 'chill', 'peaceful-morning'],
    genres: ['Acoustic Folk', 'Late-Night Lo-Fi'],
    mood: ['cozy', 'comforting', 'mellow'],
    bpm: 84,
    energy: 0.36,
  },
  {
    id: 'track-chai-3',
    title: 'Smoke in Winter Air',
    artist: 'Kabir Varma',
    album: 'Chai Stalls & Cold Nights',
    duration: 228,
    coverArtUrl: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #ea580c 100%)',
    audioUrl: DEMO_AUDIO.acousticWarmth,
    vibeIds: ['chai-and-sutta', 'bonfire', 'terrace-evening'],
    genres: ['Hindi Chill', 'Acoustic Indie', 'Fingerstyle'],
    mood: ['peaceful', 'introspective', 'warm'],
    bpm: 70,
    energy: 0.29,
  },
  {
    id: 'track-chai-4',
    title: 'Banarasi Twilight',
    artist: 'Ananya Roy',
    album: 'Ghats & Sidewalks',
    duration: 195,
    coverArtUrl: 'linear-gradient(135deg, #3f2c1d 0%, #633f21 50%, #fdba74 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['chai-and-sutta', 'chill', 'terrace-walking'],
    genres: ['Indie Folk', 'Acoustic Soul'],
    mood: ['nostalgic', 'unhurried', 'reflective'],
    bpm: 76,
    energy: 0.31,
  },

  // --- DEEP FOCUS & STUDY ROOM & FOCUS ---
  {
    id: 'track-focus-1',
    title: 'Clarity Waves (Alpha 10Hz)',
    artist: 'NeuroAcoustic Labs',
    album: 'Binaural Architecture',
    duration: 310,
    coverArtUrl: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #94a3b8 100%)',
    audioUrl: DEMO_AUDIO.deepDrone,
    vibeIds: ['deep-focus', 'study-room', 'focus', 'coding-late-night'],
    genres: ['Binaural Beats', 'Ambient Drone', 'Brainwave Audio'],
    mood: ['laser-focused', 'pure-clarity', 'calm'],
    bpm: 60,
    energy: 0.15,
  },
  {
    id: 'track-focus-2',
    title: 'Minimalist Monologue',
    artist: 'Soren Lind',
    album: 'Slate & Oak',
    duration: 242,
    coverArtUrl: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.celestialPad,
    vibeIds: ['deep-focus', 'study-room', 'focus'],
    genres: ['Minimalist Piano', 'Neo-Classical', 'Ambient'],
    mood: ['focused', 'serene', 'structured'],
    bpm: 64,
    energy: 0.22,
  },
  {
    id: 'track-focus-3',
    title: 'Subtle Dust Floating',
    artist: 'Aris Thorne',
    album: 'Sanctuary of Mind',
    duration: 268,
    coverArtUrl: 'linear-gradient(135deg, #134e4a 0%, #042f2e 50%, #2dd4bf 100%)',
    audioUrl: DEMO_AUDIO.deepDrone,
    vibeIds: ['deep-focus', 'focus', 'bed-rot'],
    genres: ['Ambient Soundscape', 'Drone', 'Soft Modular'],
    mood: ['weightless', 'deep-concentration', 'still'],
    bpm: 58,
    energy: 0.18,
  },

  // --- CODING LATE NIGHT ---
  {
    id: 'track-code-1',
    title: 'Blinking Cursor at 4 AM',
    artist: 'HexDecimal',
    album: 'Stack Overflow Serenade',
    duration: 210,
    coverArtUrl: 'linear-gradient(135deg, #083344 0%, #155e75 50%, #06b6d4 100%)',
    audioUrl: DEMO_AUDIO.cyberBeats,
    vibeIds: ['coding-late-night', 'deep-focus', 'focus'],
    genres: ['Downtempo Synth', 'Code Lo-Fi', 'IDM'],
    mood: ['flow-state', 'relentless', 'nocturnal'],
    bpm: 88,
    energy: 0.45,
  },
  {
    id: 'track-code-2',
    title: 'Syntax & Caffeine',
    artist: 'DevZero',
    album: 'Infinite Loops',
    duration: 198,
    coverArtUrl: 'linear-gradient(135deg, #2e1065 0%, #3b0764 50%, #8b5cf6 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['coding-late-night', 'gaming', 'study-room'],
    genres: ['Glitch Hop', 'Lo-Fi Chill', 'Electronic'],
    mood: ['focused', 'rhythmic', 'creative'],
    bpm: 92,
    energy: 0.48,
  },
  {
    id: 'track-code-3',
    title: 'Kernel Panic Lullaby',
    artist: 'NullPointer',
    album: 'Low Level Audio',
    duration: 224,
    coverArtUrl: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    audioUrl: DEMO_AUDIO.deepDrone,
    vibeIds: ['coding-late-night', 'deep-focus'],
    genres: ['Dark Ambient', 'Modular Synthesis', 'Cyber Minimal'],
    mood: ['deep-immersion', 'hypnotic', 'flow'],
    bpm: 80,
    energy: 0.38,
  },

  // --- LONG DRIVE & NIGHT DRIVE ---
  {
    id: 'track-drive-1',
    title: 'Rearview Mirror Reflex',
    artist: 'Overdrive 84',
    album: 'Pacific Coast Midnight',
    duration: 245,
    coverArtUrl: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #f43f5e 100%)',
    audioUrl: DEMO_AUDIO.synthwaveDrive,
    vibeIds: ['long-drive', 'night-drive', 'gym-mode'],
    genres: ['Synthwave', 'Retrowave', 'Electronic Cruise'],
    mood: ['kinetic', 'forward-motion', 'cinematic'],
    bpm: 110,
    energy: 0.65,
  },
  {
    id: 'track-drive-2',
    title: 'Two-Lane Blacktop',
    artist: 'Cassette Drive',
    album: 'Pacific Coast Midnight',
    duration: 220,
    coverArtUrl: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.synthwaveDrive,
    vibeIds: ['long-drive', 'night-drive', 'terrace-walking'],
    genres: ['Synthwave', 'Darksynth', 'Cruise Beats'],
    mood: ['boundless', 'driving', 'neon'],
    bpm: 104,
    energy: 0.58,
  },
  {
    id: 'track-drive-3',
    title: 'Distant Headlights',
    artist: 'Velvet Highway',
    album: 'Overtaking the Sun',
    duration: 260,
    coverArtUrl: 'linear-gradient(135deg, #4c0519 0%, #831843 50%, #f472b6 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['long-drive', '3-am-night-walk', 'night-drive'],
    genres: ['Dream Cruise', 'Chillwave', 'Indie Electro'],
    mood: ['melancholic', 'smooth', 'spacious'],
    bpm: 96,
    energy: 0.42,
  },

  // --- RAINY WINDOW & MONSOON & BATHING ---
  {
    id: 'track-rain-1',
    title: 'Droplets on Cold Glass',
    artist: 'Yuki Takahashi',
    album: 'Rain and Woodsmoke',
    duration: 218,
    coverArtUrl: 'linear-gradient(135deg, #075985 0%, #0284c7 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.midnightRain,
    vibeIds: ['rainy-window', 'monsoon', 'bathing', 'bed-rot'],
    genres: ['Rain Ambient', 'Acoustic Piano', 'Lo-Fi Chill'],
    mood: ['cozy', 'sheltered', 'introspective'],
    bpm: 66,
    energy: 0.22,
  },
  {
    id: 'track-rain-2',
    title: 'Steaming Mug by the Sill',
    artist: 'Oliver & June',
    album: 'Afternoon Showers',
    duration: 195,
    coverArtUrl: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%)',
    audioUrl: DEMO_AUDIO.midnightRain,
    vibeIds: ['rainy-window', 'monsoon', 'bathing'],
    genres: ['Cozy Lo-Fi', 'Felt Piano', 'Soft Jazz'],
    mood: ['comforting', 'peaceful', 'warm'],
    bpm: 70,
    energy: 0.25,
  },
  {
    id: 'track-rain-3',
    title: 'Patter on Slate Roofs',
    artist: 'Rainfall Sessions',
    album: 'Natural White Noise',
    duration: 250,
    coverArtUrl: 'linear-gradient(135deg, #1e3a5f 0%, #2d507a 50%, #60a5fa 100%)',
    audioUrl: DEMO_AUDIO.midnightRain,
    vibeIds: ['rainy-window', 'monsoon', 'bathing', 'bed-rot'],
    genres: ['Organic Soundscape', 'Foley Rain', 'Ambient'],
    mood: ['healing', 'gentle', 'surrounding'],
    bpm: 62,
    energy: 0.19,
  },

  // --- STARGAZING & SKY SHIFT ---
  {
    id: 'track-star-1',
    title: 'Observation Deck 38°',
    artist: 'Cosmic Drift',
    album: 'Orion & Beyond',
    duration: 275,
    coverArtUrl: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #a855f7 100%)',
    audioUrl: DEMO_AUDIO.celestialPad,
    vibeIds: ['stargazing', 'sky-shift', 'late-night-alone'],
    genres: ['Space Ambient', 'Modular Synthesizer', 'Astral Chill'],
    mood: ['awe-inspiring', 'infinite', 'tranquil'],
    bpm: 65,
    energy: 0.25,
  },
  {
    id: 'track-star-2',
    title: 'Constellation Lines',
    artist: 'Stella Nova',
    album: 'Observatory Nocturnes',
    duration: 240,
    coverArtUrl: 'linear-gradient(135deg, #090d16 0%, #1e293b 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.celestialPad,
    vibeIds: ['stargazing', 'sky-shift', 'deep-focus'],
    genres: ['Ambient Drone', 'Celestial Soundscape'],
    mood: ['weightless', 'boundless', 'peaceful'],
    bpm: 60,
    energy: 0.2,
  },
  {
    id: 'track-star-3',
    title: 'Meteor Shower Long Exposure',
    artist: 'Nebula Quartet',
    album: 'Starry Solitude',
    duration: 290,
    coverArtUrl: 'linear-gradient(135deg, #2e1065 0%, #581c87 50%, #c084fc 100%)',
    audioUrl: DEMO_AUDIO.celestialPad,
    vibeIds: ['stargazing', 'sky-shift', 'terrace-walking'],
    genres: ['Dream Pop', 'Shoegaze Ambient'],
    mood: ['luminous', 'serene', 'infinite'],
    bpm: 68,
    energy: 0.28,
  },

  // --- FOREST ESCAPE & NATURE & BONFIRE ---
  {
    id: 'track-forest-1',
    title: 'Pine Needle Canopy',
    artist: 'Sylvan Spirits',
    album: 'Root & Stone',
    duration: 230,
    coverArtUrl: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #22c55e 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['forest-escape', 'nature', 'bonfire'],
    genres: ['Organic Ambient', 'Acoustic Guitar', 'Nature Foley'],
    mood: ['grounding', 'tranquil', 'earthy'],
    bpm: 72,
    energy: 0.32,
  },
  {
    id: 'track-forest-2',
    title: 'Campfire Crackle & Amber Embers',
    artist: 'Hearthstone Collective',
    album: 'Deep in the Woods',
    duration: 215,
    coverArtUrl: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #ea580c 100%)',
    audioUrl: DEMO_AUDIO.acousticWarmth,
    vibeIds: ['bonfire', 'forest-escape', 'nature', 'chai-and-sutta'],
    genres: ['Folk Acoustic', 'Woodland Ambience', 'Fireside Chill'],
    mood: ['warm', 'communal', 'soothing'],
    bpm: 75,
    energy: 0.35,
  },
  {
    id: 'track-forest-3',
    title: 'Wilderness Dusk',
    artist: 'Elowen Vale',
    album: 'Solitary Trails',
    duration: 260,
    coverArtUrl: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #84cc16 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['forest-escape', 'nature', 'beach-evening'],
    genres: ['Acoustic Folk', 'Ambient Soundscape'],
    mood: ['free', 'serene', 'expansive'],
    bpm: 68,
    energy: 0.28,
  },

  // --- GAMING & GYM MODE ---
  {
    id: 'track-game-1',
    title: 'Overclocked Protocol',
    artist: 'Valkyrie Byte',
    album: 'Battlestation Apex',
    duration: 204,
    coverArtUrl: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #10b981 100%)',
    audioUrl: DEMO_AUDIO.cyberBeats,
    vibeIds: ['gaming', 'gym-mode', 'coding-late-night'],
    genres: ['Midtempo Bass', 'Cyberpunk', 'Electronic'],
    mood: ['hyper-focused', 'adrenalized', 'kinetic'],
    bpm: 124,
    energy: 0.85,
  },
  {
    id: 'track-game-2',
    title: 'RGB Neon Clutch',
    artist: 'CyberPulse',
    album: 'Respawn at Midnight',
    duration: 188,
    coverArtUrl: 'linear-gradient(135deg, #083344 0%, #0e7490 50%, #06b6d4 100%)',
    audioUrl: DEMO_AUDIO.cyberBeats,
    vibeIds: ['gaming', 'gym-mode'],
    genres: ['Phonk Beats', 'Trap Bass', 'Electro House'],
    mood: ['intense', 'victorious', 'punchy'],
    bpm: 130,
    energy: 0.88,
  },
  {
    id: 'track-game-3',
    title: 'Heavy Reps & Fast Beats',
    artist: 'Titan Force',
    album: 'Maximum Output',
    duration: 195,
    coverArtUrl: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #fb7185 100%)',
    audioUrl: DEMO_AUDIO.cyberBeats,
    vibeIds: ['gym-mode', 'gaming'],
    genres: ['Drill Phonk', 'Workout Bass', 'High Energy'],
    mood: ['powerful', 'unstoppable', 'explosive'],
    bpm: 138,
    energy: 0.92,
  },

  // --- TERRACE WALKING & TERRACE EVENING ---
  {
    id: 'track-terrace-1',
    title: 'Breeze Over Rooftops',
    artist: 'Kavita Iyer',
    album: 'Evenings in Delhi',
    duration: 220,
    coverArtUrl: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #f472b6 100%)',
    audioUrl: DEMO_AUDIO.acousticWarmth,
    vibeIds: ['terrace-walking', 'terrace-evening', 'chill'],
    genres: ['Indie Pop', 'Acoustic Soul', 'Dusk Melodies'],
    mood: ['unhurried', 'reflective', 'airy'],
    bpm: 78,
    energy: 0.35,
  },
  {
    id: 'track-terrace-2',
    title: 'Fairy Lights Twinkle',
    artist: 'The Rooftop Ensemble',
    album: 'Urban Twilight',
    duration: 205,
    coverArtUrl: 'linear-gradient(135deg, #701a75 0%, #86198f 50%, #e879f9 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['terrace-evening', 'terrace-walking', 'chai-and-sutta'],
    genres: ['Dream Pop', 'Lo-Fi Chill', 'Acoustic'],
    mood: ['warm', 'poetic', 'gentle'],
    bpm: 82,
    energy: 0.36,
  },

  // --- BEACH EVENING & PEACEFUL MORNING & BED ROT ---
  {
    id: 'track-serene-1',
    title: 'Tides at Golden Hour',
    artist: 'Oceanic Wave',
    album: 'Shoreline Drift',
    duration: 250,
    coverArtUrl: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #fb923c 100%)',
    audioUrl: DEMO_AUDIO.nightBreeze,
    vibeIds: ['beach-evening', 'peaceful-morning', 'nature'],
    genres: ['Chillout', 'Acoustic Surf', 'Ambient'],
    mood: ['peaceful', 'golden', 'rejuvenating'],
    bpm: 74,
    energy: 0.3,
  },
  {
    id: 'track-serene-2',
    title: 'Warm Blanket Daydream',
    artist: 'Lazy Sunday Collective',
    album: 'Do Not Disturb',
    duration: 265,
    coverArtUrl: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #94a3b8 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['bed-rot', 'bathing', 'peaceful-morning', 'rainy-window'],
    genres: ['Lo-Fi Bedroom Pop', 'Soft Ambient', 'Downtempo'],
    mood: ['ultra-cozy', 'resting', 'slow'],
    bpm: 65,
    energy: 0.18,
  },
  {
    id: 'track-serene-3',
    title: 'First Light on the Sill',
    artist: 'Morning Glow',
    album: 'Sunlit Awake',
    duration: 232,
    coverArtUrl: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #f59e0b 100%)',
    audioUrl: DEMO_AUDIO.acousticWarmth,
    vibeIds: ['peaceful-morning', 'beach-evening', 'sky-shift'],
    genres: ['Acoustic Folk', 'Bright Ambient', 'Uplifting Chill'],
    mood: ['fresh', 'optimistic', 'warm'],
    bpm: 80,
    energy: 0.38,
  },

  // --- TRAIN JOURNEY & AIRPORT NIGHTS ---
  {
    id: 'track-travel-1',
    title: 'Window Seat Rhythms',
    artist: 'Sleeper Class',
    album: 'Tracks Across India',
    duration: 240,
    coverArtUrl: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #60a5fa 100%)',
    audioUrl: DEMO_AUDIO.ambientLoFi,
    vibeIds: ['train-journey', 'long-drive', 'airport-nights'],
    genres: ['Acoustic Rhythmic', 'Travel Lo-Fi', 'World Indie'],
    mood: ['nostalgic', 'hypnotic', 'journeying'],
    bpm: 86,
    energy: 0.42,
  },
  {
    id: 'track-travel-2',
    title: 'Terminal 3 Gate Solitude',
    artist: 'Transit Lounge',
    album: 'Overnight Connections',
    duration: 228,
    coverArtUrl: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #38bdf8 100%)',
    audioUrl: DEMO_AUDIO.deepDrone,
    vibeIds: ['airport-nights', 'train-journey', 'late-night-alone'],
    genres: ['Airport Ambient', 'Downtempo', 'Electronic Chill'],
    mood: ['liminal', 'solitary', 'spacious'],
    bpm: 72,
    energy: 0.32,
  },
];

// Normalize track metadata schema (Section 4 requirements)
for (const track of TRACKS) {
  track.moodTags = track.moodTags || track.mood || [];
  if (track.isLiked === undefined) {
    track.isLiked = false;
  }
}

const VIBE_ALIASES = {
  'chai-sutta': 'chai-and-sutta',
  'study-room': 'study-session',
  'peaceful-morning': 'morning-walk',
  'monsoon': 'rain-plus-chai',
  'beach-evening': 'beach-vibes',
  'terrace-evening': 'sunset-chill',
};

/**
 * Helper to fetch tracks belonging to a given Vibe ID
 * Falls back to compatible genre/mood matching if direct vibeId has fewer tracks
 */
export function getTracksForVibe(vibeId) {
  const targetId = VIBE_ALIASES[vibeId] || vibeId;
  const directMatches = TRACKS.filter((t) => 
    t.vibeIds.includes(targetId) || t.vibeIds.includes(vibeId)
  );
  if (directMatches.length >= 3) {
    return directMatches;
  }
  
  // Also include general atmospheric tracks to ensure rich playlists
  const extras = TRACKS.filter((t) => 
    !t.vibeIds.includes(targetId) && !t.vibeIds.includes(vibeId)
  );
  return [...directMatches, ...extras.slice(0, 4)];
}

/**
 * Helper to fetch recommended tracks from adjacent vibes for Section 2
 * @param {string} vibeId
 * @param {number} limit
 */
export function getRecommendedTracks(vibeId, limit = 3) {
  const targetId = VIBE_ALIASES[vibeId] || vibeId;
  const currentTracks = getTracksForVibe(targetId);
  const currentIds = new Set(currentTracks.map((t) => t.id));
  const candidates = TRACKS.filter((t) => !currentIds.has(t.id));
  return candidates.slice(0, limit);
}

/**
 * Format duration helper (e.g. 214 -> '3:34')
 */
export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
