import { create } from 'zustand';
import { audioEngine } from '../utils/audioEngine.js';

export const EQUALIZER_PRESETS = {
  'Balanced': { bass: 0, mid: 0, treble: 0, preamp: 0, immersion: 50, spatialAudio: false },
  'Bass Boost': { bass: 8, mid: -1, treble: 2, preamp: 1, immersion: 75, spatialAudio: true },
  'Deep Focus': { bass: -3, mid: 3, treble: 1, preamp: 0, immersion: 35, spatialAudio: false },
  'Night': { bass: 5, mid: 1, treble: 4, preamp: 0, immersion: 80, spatialAudio: true },
  'Chill': { bass: 3, mid: -2, treble: 1, preamp: 0, immersion: 60, spatialAudio: true },
  'Energy': { bass: 6, mid: 3, treble: 5, preamp: 2, immersion: 85, spatialAudio: true },
  'Cinema': { bass: 5, mid: 2, treble: 5, preamp: 1, immersion: 90, spatialAudio: true },
  'Studio': { bass: 0, mid: 0, treble: 0, preamp: 0, immersion: 20, spatialAudio: false },
};

const STORAGE_KEY = 'mimicu_equalizer_settings';

/**
 * useEqualizerStore
 * 
 * Manages audio equalizer state, frequency bands, presets,
 * and synchronizes directly with the Web Audio API DSP pipeline.
 */
export const useEqualizerStore = create((set, get) => {
  let initialSettings = {
    activePreset: 'Balanced',
    bass: 0,      // -12 to +12 dB
    mid: 0,       // -12 to +12 dB
    treble: 0,    // -12 to +12 dB
    preamp: 0,    // -6 to +6 dB
    immersion: 50,// 0 to 100%
    spatialAudio: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        initialSettings = { ...initialSettings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read saved equalizer settings:', e);
    }
  }

  // Initial sync with audio engine
  audioEngine.setEqualizerBands(
    initialSettings.bass,
    initialSettings.mid,
    initialSettings.treble,
    initialSettings.preamp
  );

  const persistAndSync = (state) => {
    audioEngine.setEqualizerBands(state.bass, state.mid, state.treble, state.preamp);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          activePreset: state.activePreset,
          bass: state.bass,
          mid: state.mid,
          treble: state.treble,
          preamp: state.preamp,
          immersion: state.immersion,
          spatialAudio: state.spatialAudio,
        }));
      } catch (e) {
        console.warn('Could not save equalizer settings:', e);
      }
    }
  };

  return {
    ...initialSettings,

    setPreset: (presetName) => {
      const preset = EQUALIZER_PRESETS[presetName];
      if (!preset) return;

      const newState = {
        activePreset: presetName,
        bass: preset.bass,
        mid: preset.mid,
        treble: preset.treble,
        preamp: preset.preamp || 0,
        immersion: preset.immersion,
        spatialAudio: preset.spatialAudio,
      };

      set(newState);
      persistAndSync({ ...get(), ...newState });
    },

    setBand: (band, value) => {
      const clamped = Math.max(-12, Math.min(12, Number(value)));
      const newState = {
        [band]: clamped,
        activePreset: 'Custom',
      };
      set(newState);
      persistAndSync({ ...get(), ...newState });
    },

    setPreamp: (value) => {
      const clamped = Math.max(-6, Math.min(6, Number(value)));
      const newState = {
        preamp: clamped,
        activePreset: 'Custom',
      };
      set(newState);
      persistAndSync({ ...get(), ...newState });
    },

    setImmersion: (value) => {
      const clamped = Math.max(0, Math.min(100, Number(value)));
      const newState = { immersion: clamped, activePreset: 'Custom' };
      set(newState);
      persistAndSync({ ...get(), ...newState });
    },

    toggleSpatialAudio: () => {
      const current = get().spatialAudio;
      const newState = { spatialAudio: !current, activePreset: 'Custom' };
      set(newState);
      persistAndSync({ ...get(), ...newState });
    },

    resetEqualizer: () => {
      const newState = {
        activePreset: 'Balanced',
        bass: 0,
        mid: 0,
        treble: 0,
        preamp: 0,
        immersion: 50,
        spatialAudio: false,
      };
      set(newState);
      persistAndSync({ ...get(), ...newState });
    },
  };
});
