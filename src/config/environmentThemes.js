/**
 * Environment Theme Presentation System
 * 
 * Provides theme-aware calibration profiles for Mimicu's 3D visual environments.
 * Allows environments to respond to the active UI Theme (Dark, AMOLED, Light)
 * without breaking the underlying vibe identity:
 * - Night vibes remain nocturnal, but shadow details and ambient visibility are lifted in Light mode.
 * - Dark and AMOLED modes maintain deep cinematic contrast with guaranteed minimum ambient intensity.
 */

export const ENVIRONMENT_THEMES = {
  dark: {
    id: 'dark',
    ambientMultiplier: 1.0,
    minAmbient: 0.65,
    keyMultiplier: 1.0,
    rimMultiplier: 1.0,
    lateralFillMultiplier: 1.0,
    fogFarMultiplier: 1.0,
    fogColorLift: 0.0,
    shadowStrength: 1.0,
    skyBrightnessMultiplier: 1.0,
    bgLuminanceLift: 0.0,
  },
  amoled: {
    id: 'amoled',
    ambientMultiplier: 1.05,
    minAmbient: 0.65,
    keyMultiplier: 1.08,
    rimMultiplier: 1.05,
    lateralFillMultiplier: 1.0,
    fogFarMultiplier: 1.0,
    fogColorLift: 0.0,
    shadowStrength: 1.2,
    skyBrightnessMultiplier: 0.95,
    bgLuminanceLift: 0.0,
  },
  light: {
    id: 'light',
    ambientMultiplier: 1.45,
    minAmbient: 0.92,
    keyMultiplier: 0.92, // Softens harsh contrasts
    rimMultiplier: 1.15,
    lateralFillMultiplier: 1.25,
    fogFarMultiplier: 1.18, // Pushes fog distance back so background depth is readable
    fogColorLift: 0.18,     // Softly elevates fog floor away from pitch black
    shadowStrength: 0.72,
    skyBrightnessMultiplier: 1.28,
    bgLuminanceLift: 0.12,   // Lifts background gradient luminance without turning night into day
  },
};

/**
 * Helper to resolve environment theme settings based on theme object, mode, or type string
 */
export function getEnvironmentTheme(themeOrType = 'dark') {
  if (typeof themeOrType === 'object' && themeOrType !== null) {
    if (themeOrType.id === 'amoled') return ENVIRONMENT_THEMES.amoled;
    if (themeOrType.mode === 'light' || themeOrType.type === 'light') return ENVIRONMENT_THEMES.light;
    return ENVIRONMENT_THEMES.dark;
  }
  if (themeOrType === 'light') return ENVIRONMENT_THEMES.light;
  if (themeOrType === 'amoled') return ENVIRONMENT_THEMES.amoled;
  return ENVIRONMENT_THEMES.dark;
}