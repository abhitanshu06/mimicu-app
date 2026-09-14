/**
 * audioReactiveManager.js
 * 
 * Master Audio-Reactive Coordinator for Mimicu Phase 5.
 * 
 * Responsibilities:
 * 1. Synchronously samples Web Audio telemetry from `audioEngine` on every WebGL frame.
 * 2. Smooths raw high-frequency FFT spikes via exponential lerping with vibe-specific damping.
 * 3. Gracefully decays all values to 0 when music is paused/stopped (zero visual pops or freezes).
 * 4. Respects `prefers-reduced-motion` and user settings (disabling camera motion & dampening intensity).
 * 5. Attenuates effects on low-power mobile devices.
 * 6. Completely decoupled from React render tree — zero per-frame React state updates.
 */

import { audioEngine } from './audioEngine.js';
import { getAudioReactiveProfile, DEFAULT_AUDIO_REACTIVE_PROFILE } from '../config/audioReactiveProfiles.js';
import { useVibeStore } from '../stores/vibeStore.js';

class AudioReactiveManager {
  constructor() {
    this.current = {
      bass: 0,
      mid: 0,
      treble: 0,
      overallEnergy: 0,
      pulse: 0, // Continuous rhythmic phase accumulator [0..2PI]
      rawBass: 0,
      rawMid: 0,
      rawTreble: 0,
      rawEnergy: 0,
      profile: DEFAULT_AUDIO_REACTIVE_PROFILE,
      vibeId: '3-am-night-walk',
    };

    // User preference: 'responsive' | 'subtle' | 'off'
    this.mode = 'responsive';
    this.prefersReducedMotion = false;
    this.isMobile = false;
    this.debugEnabled = false;

    this.initEnvironment();
  }

  /**
   * Detects client device parameters and system preferences
   */
  initEnvironment() {
    if (typeof window === 'undefined') return;

    // 1. Read stored preference
    try {
      const savedMode = localStorage.getItem('mimicu_audio_reactive_mode');
      if (savedMode && ['responsive', 'subtle', 'off'].includes(savedMode)) {
        this.mode = savedMode;
      }
    } catch (e) {
      console.warn('[AudioReactiveManager] Could not access localStorage:', e);
    }

    // 2. Check prefers-reduced-motion
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = motionQuery.matches;
      motionQuery.addEventListener('change', (e) => {
        this.prefersReducedMotion = e.matches;
      });
    }

    // 3. Mobile screen detection
    const checkMobile = () => {
      this.isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });

    // 4. Debug check
    if (typeof window !== 'undefined') {
      this.debugEnabled = window.location.search.includes('debugAudio=true') || window.__MIMICU_DEBUG_AUDIO__ === true;
    }
  }

  /**
   * Set user reactive mode ('responsive' | 'subtle' | 'off')
   */
  setMode(newMode) {
    if (['responsive', 'subtle', 'off'].includes(newMode)) {
      this.mode = newMode;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('mimicu_audio_reactive_mode', newMode);
        } catch (e) {
          console.warn('Could not save reactive mode:', e);
        }
      }
    }
  }

  /**
   * Explicitly set vibe override for testing or manual profiling
   */
  setVibe(vibeId) {
    this.current.vibeId = vibeId;
    this.current.profile = getAudioReactiveProfile(vibeId);
  }

  /**
   * Frame-rate independent update executed inside R3F useFrame
   * @param {number} delta - Seconds elapsed since previous frame
   */
  update(delta) {
    // Safety clamp delta against tab background pauses
    const dt = Math.min(delta, 0.1);

    // 1. Resolve active vibe — skip profile lookup if vibeId hasn't changed (runs 60x/sec)
    const activeVibe = useVibeStore.getState().targetVibe || useVibeStore.getState().activeVibe;
    const vibeId = activeVibe?.id || '3-am-night-walk';

    if (vibeId !== this.current.vibeId) {
      // Vibe changed — update profile. Only runs on actual Vibe switches, not every frame.
      this.current.profile = getAudioReactiveProfile(vibeId);
      this.current.vibeId = vibeId;
    }
    const profile = this.current.profile || getAudioReactiveProfile(vibeId);

    // 2. Sample raw Web Audio telemetry
    const telemetry = audioEngine.getAudioTelemetry();
    this.current.rawBass = telemetry.bass;
    this.current.rawMid = telemetry.mid;
    this.current.rawTreble = telemetry.treble;
    this.current.rawEnergy = telemetry.overallEnergy;

    // 3. Handle OFF state
    if (this.mode === 'off') {
      const offDecay = Math.min(1, dt * 8);
      this.current.bass += (0 - this.current.bass) * offDecay;
      this.current.mid += (0 - this.current.mid) * offDecay;
      this.current.treble += (0 - this.current.treble) * offDecay;
      this.current.overallEnergy += (0 - this.current.overallEnergy) * offDecay;
      return;
    }

    // 4. Multipliers
    const modeMultiplier = this.mode === 'subtle' ? 0.45 : 1.0;
    const mobileMultiplier = this.isMobile ? 0.72 : 1.0;
    const reducedMotionMultiplier = this.prefersReducedMotion ? 0.35 : 1.0;

    const netFactor = modeMultiplier * mobileMultiplier * reducedMotionMultiplier;

    // 5. Compute target smoothed values
    let targetBass = 0;
    let targetMid = 0;
    let targetTreble = 0;
    let targetEnergy = 0;

    if (audioEngine.isPlaying) {
      targetBass = Math.min(1, telemetry.bass * profile.bassStrength * 2.2 * netFactor);
      targetMid = Math.min(1, telemetry.mid * profile.midStrength * 2.0 * netFactor);
      targetTreble = Math.min(1, telemetry.treble * profile.trebleStrength * 2.0 * netFactor);
      targetEnergy = Math.min(1, telemetry.overallEnergy * profile.overallStrength * 2.0 * netFactor);
    }

    // 6. Smooth exponential interpolation
    // If playing: use vibe profile smoothing
    // If paused/stopped: use smooth exponential decay to neutral (no freezing)
    const isDecaying = !audioEngine.isPlaying || targetEnergy === 0;
    const smoothRate = isDecaying 
      ? Math.min(1, dt * 4.5) 
      : Math.min(1, Math.max(0.02, profile.smoothing * 36 * dt));

    this.current.bass += (targetBass - this.current.bass) * smoothRate;
    this.current.mid += (targetMid - this.current.mid) * smoothRate;
    this.current.treble += (targetTreble - this.current.treble) * smoothRate;
    this.current.overallEnergy += (targetEnergy - this.current.overallEnergy) * smoothRate;

    // Safety clamp
    this.current.bass = Math.max(0, Math.min(1, this.current.bass));
    this.current.mid = Math.max(0, Math.min(1, this.current.mid));
    this.current.treble = Math.max(0, Math.min(1, this.current.treble));
    this.current.overallEnergy = Math.max(0, Math.min(1, this.current.overallEnergy));

    // 7. Accumulate continuous pulse phase for rhythmic breathing waves
    const pulseSpeed = 0.6 + this.current.bass * 2.2;
    this.current.pulse = (this.current.pulse + dt * pulseSpeed) % (Math.PI * 2);
  }

  /**
   * Direct zero-allocation accessor for useFrame callers
   * @returns {AudioReactiveManager['current']}
   */
  getValues() {
    return this.current;
  }
}

// Export singleton instance
export const audioReactiveManager = new AudioReactiveManager();
