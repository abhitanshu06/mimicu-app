import { create } from 'zustand';
import { VIBES, DEFAULT_VIBE_ID } from '../config/vibes.js';

/**
 * Updates root CSS variables to synchronize glass UI elements with active vibe
 */
function applyVibeToCSSVariables(vibe) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--vibe-bg', vibe.colors.bg);
  root.style.setProperty('--vibe-accent', vibe.colors.primary);
  root.style.setProperty('--vibe-secondary', vibe.colors.secondary);
  root.style.setProperty('--vibe-glow', vibe.colors.glow);
  root.style.setProperty('--vibe-name', `"${vibe.name}"`);
}

/**
 * useVibeStore
 * 
 * Central Zustand store managing active & target vibes, transition progress,
 * and synchronizing visual tokens with DOM CSS variables.
 */

// Module-level RAF id to cancel in-flight transitions when setVibe() is called rapidly
let _transitionRafId = null;

export const useVibeStore = create((set, get) => {
  const initialVibe = VIBES[DEFAULT_VIBE_ID] || Object.values(VIBES)[0];
  
  // Apply initial tokens to CSS
  applyVibeToCSSVariables(initialVibe);

  return {
    activeVibe: initialVibe,
    targetVibe: initialVibe,
    transitionProgress: 1, // 1 = fully transitioned
    isTransitioning: false,

    /**
     * Change the current vibe with smooth transition handling
     * @param {string} vibeId - The slug ID of the target vibe
     */
    setVibe: (vibeId) => {
      const target = VIBES[vibeId];
      if (!target) {
        console.warn(`[VibeStore] Unknown vibe ID: "${vibeId}"`);
        return;
      }

      const { activeVibe, isTransitioning } = get();
      if (activeVibe.id === vibeId && !isTransitioning) {
        return;
      }

      // Cancel any in-flight transition RAF loop before starting a new one
      if (_transitionRafId !== null) {
        cancelAnimationFrame(_transitionRafId);
        _transitionRafId = null;
      }

      // 1. Set target vibe and begin transition
      set({
        targetVibe: target,
        isTransitioning: true,
        transitionProgress: 0,
      });

      // 2. Synchronize CSS tokens for instant subtle UI accent feedback
      applyVibeToCSSVariables(target);

      // 3. Smooth transition timing curve (700ms)
      const duration = 700;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic ease-out interpolation
        const eased = 1 - Math.pow(1 - progress, 3);

        set({ transitionProgress: eased });

        if (progress < 1) {
          _transitionRafId = requestAnimationFrame(step);
        } else {
          _transitionRafId = null;
          // Complete transition
          set({
            activeVibe: target,
            isTransitioning: false,
            transitionProgress: 1,
          });
        }
      };

      _transitionRafId = requestAnimationFrame(step);
    },
  };
});

