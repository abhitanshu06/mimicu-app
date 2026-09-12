/**
 * audioReactiveProfiles.js
 * 
 * Centralized Visual Audio-Response Profiles for Mimicu Phase 5.
 * 
 * Defines distinct, cinematic visual reactivity profiles for each of
 * Mimicu's exactly 15 canonical vibes.
 * 
 * Key Philosophy:
 * - Subtle, premium, and cinematic — NEVER an aggressive club visualizer.
 * - Scene ground/foundation NEVER bounces.
 * - Deep Focus is the most subtle (distraction-free).
 * - Gaming is slightly punchier with controlled RGB accent pulses.
 * - Chai & Sutta preserves physical smoke/steam realism (no bouncing particles).
 */

export const DEFAULT_AUDIO_REACTIVE_PROFILE = {
  bassStrength: 0.25,
  midStrength: 0.20,
  trebleStrength: 0.28,
  overallStrength: 0.25,
  smoothing: 0.10,
  particleResponse: 0.20,
  lightResponse: 0.30,
  cameraResponse: 0.12,
  description: 'Balanced ambient audio reactivity',
};

export const AUDIO_REACTIVE_PROFILES = {
  // 1. 3 AM NIGHT WALK: Low & subtle. Amber streetlight pulse, gentle mist drift, distant window shimmer.
  '3-am-night-walk': {
    bassStrength: 0.28,
    midStrength: 0.22,
    trebleStrength: 0.35,
    overallStrength: 0.25,
    smoothing: 0.12,
    particleResponse: 0.20,
    lightResponse: 0.32,
    cameraResponse: 0.14,
    description: 'Subtle amber streetlight pulse and quiet nocturnal street atmosphere',
  },

  // 2. CHAI & SUTTA: Warm & cozy. Warm tapri bulb breathing; natural steam drift.
  'chai-and-sutta': {
    bassStrength: 0.32,
    midStrength: 0.24,
    trebleStrength: 0.30,
    overallStrength: 0.28,
    smoothing: 0.10,
    particleResponse: 0.16, // Smoke/steam remains physically natural
    lightResponse: 0.36,     // Warm hanging bulb pulse
    cameraResponse: 0.10,
    description: 'Warm roadside tapri incandescent pulse with natural steam drift',
  },

  // 3. DEEP FOCUS: The most subtle of all. Slow, almost imperceptible breathing.
  'deep-focus': {
    bassStrength: 0.12,
    midStrength: 0.10,
    trebleStrength: 0.14,
    overallStrength: 0.12,
    smoothing: 0.06,         // Ultra slow, ultra smooth
    particleResponse: 0.08,
    lightResponse: 0.14,
    cameraResponse: 0.04,    // Virtually stationary, distraction-free
    description: 'Minimalist sanctuary with imperceptible acoustic breathing',
  },

  // 4. GAMING: Slightly stronger reactions. RGB accent pulse, edge highlights.
  'gaming': {
    bassStrength: 0.52,
    midStrength: 0.40,
    trebleStrength: 0.46,
    overallStrength: 0.48,
    smoothing: 0.18,         // Snappier response
    particleResponse: 0.38,
    lightResponse: 0.52,     // PC rig & monitor bias lighting
    cameraResponse: 0.18,    // Controlled subtle drift, no shake
    description: 'Dynamic RGB underglow pulse and monitor edge shimmer',
  },

  // 5. RAINY WINDOW: Soft interior glow, rain pace, wet bokeh reflection shimmer.
  'rainy-window': {
    bassStrength: 0.24,
    midStrength: 0.30,
    trebleStrength: 0.38,
    overallStrength: 0.26,
    smoothing: 0.10,
    particleResponse: 0.24,
    lightResponse: 0.28,
    cameraResponse: 0.12,
    description: 'Warm indoor ambiance with shimmering city-light bokeh through rain',
  },

  // 6. LONG DRIVE: Dashboard and taillight response; steady road speed.
  'long-drive': {
    bassStrength: 0.32,
    midStrength: 0.24,
    trebleStrength: 0.34,
    overallStrength: 0.30,
    smoothing: 0.12,
    particleResponse: 0.22,
    lightResponse: 0.36,
    cameraResponse: 0.15,
    description: 'Subtle dashboard console and distant highway reflector glow',
  },

  // 7. CODING LATE NIGHT: Monitor backlight aura; terminal highlights; cursor stays independent.
  'coding-late-night': {
    bassStrength: 0.26,
    midStrength: 0.20,
    trebleStrength: 0.32,
    overallStrength: 0.24,
    smoothing: 0.08,
    particleResponse: 0.14,
    lightResponse: 0.30,
    cameraResponse: 0.08,
    description: 'Clean monitor ambient spill and subtle terminal highlight shimmer',
  },

  // 8. STARGAZING: Horizon glow; soft nebula atmosphere; stars shimmer peacefully without strobe.
  'stargazing': {
    bassStrength: 0.22,
    midStrength: 0.25,
    trebleStrength: 0.36,    // Twinkling star shimmer
    overallStrength: 0.24,
    smoothing: 0.09,
    particleResponse: 0.28,  // Stardust motes
    lightResponse: 0.26,
    cameraResponse: 0.12,
    description: 'Serene mountain horizon glow and peaceful cosmic star shimmer',
  },

  // 9. TERRACE WALKING: Evening breeze; warm rooftop parapet breath.
  'terrace-walking': {
    bassStrength: 0.26,
    midStrength: 0.22,
    trebleStrength: 0.32,
    overallStrength: 0.25,
    smoothing: 0.11,
    particleResponse: 0.20,
    lightResponse: 0.28,
    cameraResponse: 0.14,
    description: 'Gentle rooftop terrace breeze with distant skyline highlights',
  },

  // 10. STUDY SESSION: Warm desk lamp warmth; calm study ambiance.
  'study-session': {
    bassStrength: 0.16,
    midStrength: 0.14,
    trebleStrength: 0.20,
    overallStrength: 0.16,
    smoothing: 0.07,
    particleResponse: 0.10,
    lightResponse: 0.20,
    cameraResponse: 0.06,
    description: 'Cozy study sanctuary with warm desk lamp breathing',
  },

  // 11. MORNING WALK: Dawn sunbeam bloom; gentle foliage sway.
  'morning-walk': {
    bassStrength: 0.22,
    midStrength: 0.26,
    trebleStrength: 0.34,
    overallStrength: 0.26,
    smoothing: 0.11,
    particleResponse: 0.25,
    lightResponse: 0.30,
    cameraResponse: 0.15,
    description: 'Fresh golden dawn sunbeam pulse and canopy dewdrop shimmer',
  },

  // 12. BATHING / SELF CARE: Soothing candle flame pulse; gentle ripple rhythm.
  'bathing': {
    bassStrength: 0.18,
    midStrength: 0.20,
    trebleStrength: 0.24,
    overallStrength: 0.18,
    smoothing: 0.08,
    particleResponse: 0.16,
    lightResponse: 0.22,
    cameraResponse: 0.07,
    description: 'Warm flickering candle ambiance with soothing water ripple pace',
  },

  // 13. RAIN + CHAI: Warm tapri tea glow; soft monsoon rain atmosphere.
  'rain-plus-chai': {
    bassStrength: 0.30,
    midStrength: 0.28,
    trebleStrength: 0.35,
    overallStrength: 0.28,
    smoothing: 0.10,
    particleResponse: 0.22,
    lightResponse: 0.34,
    cameraResponse: 0.12,
    description: 'Cozy tungsten tapri warmth enveloped in monsoon rain mist',
  },

  // 14. BEACH VIBES: Low tidal surge pulse; gentle ocean wave crest sparkle.
  'beach-vibes': {
    bassStrength: 0.28,
    midStrength: 0.25,
    trebleStrength: 0.38,
    overallStrength: 0.28,
    smoothing: 0.10,
    particleResponse: 0.26,
    lightResponse: 0.30,
    cameraResponse: 0.14,
    description: 'Rhythmic ocean tidal pulse with twilight horizon shimmer',
  },

  // 15. SUNSET CHILL: Golden hour horizon pulse; amber/violet twilight shimmer.
  'sunset-chill': {
    bassStrength: 0.25,
    midStrength: 0.22,
    trebleStrength: 0.32,
    overallStrength: 0.24,
    smoothing: 0.10,
    particleResponse: 0.20,
    lightResponse: 0.28,
    cameraResponse: 0.12,
    description: 'Golden hour amber gradient pulse and evening twilight calm',
  },
};

// Aliases for routing and legacy ID compatibility
AUDIO_REACTIVE_PROFILES['chai-sutta'] = AUDIO_REACTIVE_PROFILES['chai-and-sutta'];
AUDIO_REACTIVE_PROFILES['study-room'] = AUDIO_REACTIVE_PROFILES['study-session'];
AUDIO_REACTIVE_PROFILES['peaceful-morning'] = AUDIO_REACTIVE_PROFILES['morning-walk'];
AUDIO_REACTIVE_PROFILES['monsoon'] = AUDIO_REACTIVE_PROFILES['rain-plus-chai'];
AUDIO_REACTIVE_PROFILES['beach-evening'] = AUDIO_REACTIVE_PROFILES['beach-vibes'];
AUDIO_REACTIVE_PROFILES['terrace-evening'] = AUDIO_REACTIVE_PROFILES['sunset-chill'];

/**
 * Retrieves the response profile for a given vibe ID with fallback.
 * @param {string} vibeId 
 * @returns {typeof DEFAULT_AUDIO_REACTIVE_PROFILE}
 */
export function getAudioReactiveProfile(vibeId) {
  if (!vibeId) return DEFAULT_AUDIO_REACTIVE_PROFILE;
  return AUDIO_REACTIVE_PROFILES[vibeId] || DEFAULT_AUDIO_REACTIVE_PROFILE;
}
