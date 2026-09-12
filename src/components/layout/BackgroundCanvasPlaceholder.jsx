import React from 'react';
import { useVibeStore } from '../../stores/vibeStore';
import { useThemeStore } from '../../stores/themeStore';
import { getEnvironmentTheme } from '../../config/environmentThemes';

/**
 * BackgroundCanvasPlaceholder
 * 
 * Ambient spatial backdrop rendered behind the WebGL Canvas.
 * Provides subtle atmospheric color gradients and luminous depth so the 3D scene
 * has cinematic contrast and object silhouettes remain clearly visible.
 * Theme-aware: softly lifts ambient luminescence in Light mode without turning night vibes into day.
 */
export default function BackgroundCanvasPlaceholder() {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const envTheme = getEnvironmentTheme(currentTheme);
  const isLight = currentTheme?.mode === 'light' || currentTheme?.type === 'light';

  const primaryColor = activeVibe?.colors?.primary || '#a855f7';
  const secondaryColor = activeVibe?.colors?.secondary || '#38bdf8';
  const accentColor = activeVibe?.colors?.accent || '#fbbf24';
  const bgColor = activeVibe?.colors?.bg || '#0c1220';

  const isSolid = currentTheme?.type === 'solid';
  const themeBg = currentTheme?.tokens?.background;
  const themeBgSec = currentTheme?.tokens?.backgroundSecondary || themeBg;

  const bgGradient = isSolid
    ? `radial-gradient(ellipse 130% 95% at 50% 25%, ${themeBgSec} 0%, ${themeBg} 100%)`
    : isLight
    ? `radial-gradient(ellipse 130% 95% at 50% 25%, #26334d 0%, #1e293f 38%, ${bgColor} 72%, #141c2c 100%)`
    : `radial-gradient(ellipse 130% 95% at 50% 25%, #151d30 0%, #0e1526 38%, ${bgColor} 72%, #080d18 100%)`;

  return (
    <div 
      id="canvas-environment-layer"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none transition-colors duration-700 ease-out"
      style={{
        background: bgGradient,
      }}
      aria-hidden="true"
    >
      {/* 1. Left Lateral Atmospheric Depth Glow - Active in Glass themes */}
      <div 
        className="absolute top-1/4 -left-48 w-[850px] h-[850px] rounded-full blur-[180px] pointer-events-none transition-all duration-700 ease-out"
        style={{ 
          backgroundColor: secondaryColor,
          opacity: isSolid ? 0.04 : 0.16,
        }}
      />

      {/* 2. Right Lateral Atmospheric Depth Glow - Active in Glass themes */}
      <div 
        className="absolute top-1/3 -right-48 w-[850px] h-[850px] rounded-full blur-[180px] pointer-events-none transition-all duration-700 ease-out"
        style={{ 
          backgroundColor: primaryColor,
          opacity: isSolid ? 0.04 : 0.18,
        }}
      />

      {/* 3. Center Upper Atmospheric Bloom (Key Vibe Glow) */}
      <div 
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[900px] h-[650px] rounded-full blur-[170px] animate-pulse-glow pointer-events-none transition-all duration-700 ease-out"
        style={{ 
          backgroundColor: primaryColor,
          opacity: isSolid ? 0.03 : 0.14,
        }}
      />

      {/* 4. Lower Horizon Ambient Lift */}
      <div 
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] rounded-full blur-[190px] pointer-events-none transition-all duration-700 ease-out"
        style={{ 
          backgroundColor: accentColor,
          opacity: isSolid ? 0.03 : 0.12,
        }}
      />

      {/* 5. Smooth Cinematic Depth Vignette (Gradual, never pure black) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(8, 12, 22, 0.42) 100%)',
        }}
      />

      {/* 6. Subtle UI Protection Scrim behind primary content zone */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(10, 15, 26, 0.28) 0%, transparent 80%)',
        }}
      />
    </div>
  );
}
