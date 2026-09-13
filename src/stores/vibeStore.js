import { create } from 'zustand';
import { VIBES, DEFAULT_VIBE_ID } from '../config/vibes.js';
import { getTracksForVibe } from '../data/tracks.js';
import { useAudioStore } from './audioStore.js';

/**
 * Updates root CSS variables to synchronize glass UI elements with active vibe
 */
function applyVibeToCSSVariables(vibe) {
  if (typeof document === 'undefined' || !vibe?.colors) return;
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
 * Central Zustand store managing:
 * 1. Active & target vibes and 3D visual token transitions
 * 2. Phase 7 Vibe Playlist Sequencer: active Vibe session metadata,
 *    current Vibe track index, queue synchronization, shuffle & repeat modes.
 */

// Module-level RAF id to cancel in-flight transitions when setVibe() is called rapidly
let _transitionRafId = null;

export const useVibeStore = create((set, get) => {
  const initialVibe = VIBES[DEFAULT_VIBE_ID] || Object.values(VIBES)[0];
  
  // Apply initial tokens to CSS
  applyVibeToCSSVariables(initialVibe);

  return {
    // 3D Environment & Token state
    activeVibe: initialVibe,
    targetVibe: initialVibe,
    transitionProgress: 1, // 1 = fully transitioned
    isTransitioning: false,

    // Phase 7: Vibe Sequencer session state
    activeVibePlaylist: [],
    activeVibeIndex: 0,
    isVibePlaybackActive: false,
    vibeShuffle: false,
    vibeRepeatMode: 'vibe', // 'off' | 'track' | 'vibe'

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

    // ──────────────────────────────────────────────
    // Phase 7 Vibe Playlist Sequencer Actions
    // ──────────────────────────────────────────────

    /**
     * Replace active Vibe playlist sequence
     * @param {Array} playlist - Array of canonical track objects
     */
    setVibePlaylist: (playlist) => {
      set({ activeVibePlaylist: Array.isArray(playlist) ? playlist : [] });
    },

    /**
     * Set active track index within the current Vibe playlist
     * @param {number} index
     */
    setVibeIndex: (index) => {
      const { activeVibePlaylist } = get();
      const max = Math.max(0, activeVibePlaylist.length - 1);
      const clamped = Math.max(0, Math.min(max, index));
      set({ activeVibeIndex: clamped });
    },

    /**
     * Set Vibe session playback active flag
     * @param {boolean} isActive
     */
    setVibePlaybackActive: (isActive) => {
      set({ isVibePlaybackActive: !!isActive });
    },

    /**
     * Set Vibe session shuffle mode & sync with audioStore
     * @param {boolean} enabled
     */
    setVibeShuffle: (enabled) => {
      set({ vibeShuffle: !!enabled });
      const audioState = useAudioStore.getState();
      if (audioState.shuffle !== !!enabled) {
        audioState.toggleShuffle();
      }
    },

    /**
     * Set Vibe repeat mode ('off' | 'track' | 'vibe') & sync with audioStore
     * @param {'off'|'track'|'vibe'} mode
     */
    setVibeRepeatMode: (mode) => {
      const valid = ['off', 'track', 'vibe'].includes(mode) ? mode : 'vibe';
      set({ vibeRepeatMode: valid });
      useAudioStore.getState().setRepeatMode(valid === 'vibe' ? 'queue' : valid);
    },

    /**
     * Start or resume a Vibe listening session
     * @param {string} vibeId
     * @param {number} startIndex
     * @param {boolean} shouldShuffle
     */
    startVibeSession: (vibeId, startIndex = 0, shouldShuffle = false) => {
      const target = VIBES[vibeId];
      if (!target) return;

      const tracks = getTracksForVibe(vibeId);
      if (!tracks.length) return;

      // Morph 3D background if not already active
      if (get().activeVibe.id !== vibeId) {
        get().setVibe(vibeId);
      }

      set({
        activeVibePlaylist: tracks,
        activeVibeIndex: startIndex,
        isVibePlaybackActive: true,
        vibeShuffle: shouldShuffle,
      });

      // Hand off audio playback to audioStore
      useAudioStore.getState().playVibe(vibeId, shouldShuffle, startIndex);
    },

    /**
     * Advance to the next Vibe track via audioStore
     */
    nextVibeTrack: () => {
      useAudioStore.getState().next();
    },

    /**
     * Go to previous Vibe track via audioStore
     */
    previousVibeTrack: () => {
      useAudioStore.getState().previous();
    },

    /**
     * Helper called by audioStore when the current playing track changes
     * Keeps activeVibeIndex synchronized with canonical Vibe sequence
     * @param {Object} track - The newly active track object
     * @param {number} fallbackIndex
     */
    syncTrackChange: (track, fallbackIndex = 0) => {
      const { activeVibePlaylist } = get();
      if (!track) return;
      const idx = activeVibePlaylist.findIndex((t) => t.id === track.id);
      set({
        activeVibeIndex: idx !== -1 ? idx : fallbackIndex,
        isVibePlaybackActive: true,
      });
    },

    /**
     * Clears Vibe session state when playback transitions to non-vibe context
     * (e.g. Search, Library, User Playlists)
     */
    clearVibePlayback: () => {
      set({
        isVibePlaybackActive: false,
        activeVibePlaylist: [],
        activeVibeIndex: 0,
      });
    },
  };
});

