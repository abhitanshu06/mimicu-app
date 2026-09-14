/**
 * audioEngine.js
 * 
 * High-fidelity Browser Audio Engine for Mimicu Phase 4.
 * 
 * Implements:
 * 1. HTMLAudioElement playback engine with Web Audio API processing
 * 2. Complete DSP Chain:
 *    Source -> Preamp Gain -> Bass Filter -> Mid Filter -> Treble Filter -> Analyser -> Master Gain -> Output
 * 3. Real-time AnalyserNode for audio visualization / responsive wave bars
 * 4. Procedural Ambient Harmonic Synthesizer fallback for offline/reliable playback
 * 5. Clean error recovery ensuring the app never crashes on audio failures
 */

class AudioEngine {
  constructor() {
    this.audioElement = null;
    this.audioContext = null;
    this.sourceNode = null;
    this.preampNode = null;
    this.bassFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;
    this.analyserNode = null;
    this.masterGainNode = null;

    this.isInitialized = false;
    this.isPlaying = false;
    this.currentUrl = null;
    this.volume = 0.8;
    this.isMuted = false;

    // Callbacks
    this.onTimeUpdateCallback = null;
    this.onEndedCallback = null;
    this.onErrorCallback = null;
    this.onLoadingCallback = null;

    // Telemetry TypedArrays and cached result object (preallocated to avoid per-frame allocations)
    this.frequencyDataArray = new Uint8Array(128);
    this.timeDomainDataArray = new Uint8Array(256);
    this.telemetryResult = {
      frequencyDataArray: this.frequencyDataArray,
      timeDomainDataArray: this.timeDomainDataArray,
      bass: 0,
      mid: 0,
      treble: 0,
      overallEnergy: 0,
    };

    // Procedural Fallback Synthesizer state
    this.synthActive = false;
    this.synthInterval = null;
    this.synthNodes = [];
    this.synthTime = 0;
    this.synthDuration = 210;

    this.initAudioElement();
  }

  /**
   * Initializes HTMLAudioElement with standard event listeners
   */
  initAudioElement() {
    if (typeof window === 'undefined') return;

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback && this.audioElement) {
        this.onTimeUpdateCallback(
          this.audioElement.currentTime,
          this.audioElement.duration || 0
        );
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    this.audioElement.addEventListener('waiting', () => {
      if (this.onLoadingCallback) this.onLoadingCallback(true);
    });

    this.audioElement.addEventListener('playing', () => {
      this.isPlaying = true;
      if (this.onLoadingCallback) this.onLoadingCallback(false);
    });

    this.audioElement.addEventListener('error', async (e) => {
      if (this.fallbackUrl && this.fallbackUrl !== this.audioElement.src) {
        console.warn('[AudioEngine] HTMLAudioElement error on primary stream, trying fallback URL:', this.fallbackUrl);
        const fb = this.fallbackUrl;
        this.fallbackUrl = null;
        this.audioElement.src = fb;
        try {
          await this.audioElement.play();
          this.isPlaying = true;
          return;
        } catch (fbErr) {
          console.warn('[AudioEngine] Fallback URL failed:', fbErr);
        }
      }
      console.warn('[AudioEngine] HTMLAudioElement error, activating procedural ambient fallback:', e);
      if (this.onLoadingCallback) this.onLoadingCallback(false);
      this.startProceduralFallback();
    });
  }

  /**
   * Lazy initializes Web Audio API on first user gesture
   */
  initWebAudio() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[AudioEngine] Web Audio API not supported in this environment');
        return;
      }

      this.audioContext = new AudioContextClass();

      // 1. Preamp Gain Node
      this.preampNode = this.audioContext.createGain();
      this.preampNode.gain.value = 1.0;

      // 2. 3-Band Equalizer Biquad Filters
      // Bass: Lowshelf at 120Hz
      this.bassFilter = this.audioContext.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 120;
      this.bassFilter.gain.value = 0;

      // Mid: Peaking at 1000Hz, Q = 1.0
      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = 0;

      // Treble: Highshelf at 7000Hz
      this.trebleFilter = this.audioContext.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 7000;
      this.trebleFilter.gain.value = 0;

      // 3. Analyser Node for Visualizers (FFT size 256 for 128 frequency bands)
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // 4. Master Volume Gain Node
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.isMuted ? 0 : this.volume;

      // Connect DSP chain
      // Source -> Preamp -> Bass -> Mid -> Treble -> Analyser -> MasterGain -> Destination
      this.preampNode.connect(this.bassFilter);
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.analyserNode);
      this.analyserNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);

      // Connect MediaElementSourceNode if audio element exists
      if (this.audioElement) {
        try {
          this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
          this.sourceNode.connect(this.preampNode);
        } catch (err) {
          console.warn('[AudioEngine] Could not connect MediaElementSourceNode:', err);
        }
      }

      this.isInitialized = true;
    } catch (err) {
      console.warn('[AudioEngine] Web Audio initialization warning:', err);
    }
  }

  /**
   * Ensures AudioContext is active (handles browser autoplay lock)
   */
  async ensureContextActive() {
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.warn('[AudioEngine] AudioContext resume error:', err);
      }
    }
  }

  /**
   * Load and play a track URL
   * @param {string} url - Audio stream URL
   * @param {number} fallbackDuration - Track duration in seconds
   * @param {string|null} fallbackUrl - Optional secondary fallback URL
   */
  async loadAndPlay(url, fallbackDuration = 200, fallbackUrl = null) {
    await this.ensureContextActive();
    this.stopProceduralFallback();

    this.currentUrl = url;
    this.fallbackUrl = fallbackUrl;
    this.synthDuration = fallbackDuration || 200;

    if (!this.audioElement) {
      this.initAudioElement();
    }

    if (this.onLoadingCallback) this.onLoadingCallback(true);

    try {
      this.audioElement.src = url;
      this.audioElement.currentTime = 0;
      await this.audioElement.play();
      this.isPlaying = true;
      if (this.onLoadingCallback) this.onLoadingCallback(false);
    } catch (err) {
      if (this.fallbackUrl && this.fallbackUrl !== url) {
        console.warn('[AudioEngine] Playback failed on primary source, trying fallback URL:', this.fallbackUrl);
        const fb = this.fallbackUrl;
        this.fallbackUrl = null;
        try {
          this.audioElement.src = fb;
          this.audioElement.currentTime = 0;
          await this.audioElement.play();
          this.isPlaying = true;
          if (this.onLoadingCallback) this.onLoadingCallback(false);
          return;
        } catch (fbErr) {
          console.warn('[AudioEngine] Fallback URL failed, starting procedural ambient generator:', fbErr);
        }
      } else {
        console.warn('[AudioEngine] Playback failed on primary source, starting procedural ambient generator:', err);
      }
      if (this.onLoadingCallback) this.onLoadingCallback(false);
      this.startProceduralFallback();
    }
  }

  /**
   * Resume playback
   */
  async play() {
    await this.ensureContextActive();

    if (this.synthActive) {
      this.resumeProceduralFallback();
      this.isPlaying = true;
      return;
    }

    if (this.audioElement) {
      try {
        await this.audioElement.play();
        this.isPlaying = true;
      } catch (err) {
        console.warn('[AudioEngine] Resume error, using fallback:', err);
        this.startProceduralFallback();
      }
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.synthActive) {
      this.pauseProceduralFallback();
      this.isPlaying = false;
      return;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Seek to target time in seconds
   * @param {number} seconds
   */
  seek(seconds) {
    if (this.synthActive) {
      this.synthTime = Math.max(0, Math.min(this.synthDuration, seconds));
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.synthTime, this.synthDuration);
      }
      return;
    }

    if (this.audioElement && !isNaN(seconds)) {
      try {
        this.audioElement.currentTime = seconds;
      } catch (e) {
        console.warn('[AudioEngine] Seek error:', e);
      }
    }
  }

  /**
   * Set master volume (0.0 to 1.0)
   * @param {number} volume
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setTargetAtTime(
        this.isMuted ? 0 : this.volume,
        this.audioContext.currentTime,
        0.02
      );
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  /**
   * Update 3-band Equalizer filter gains
   * @param {number} bass - Gain in dB (-12 to +12)
   * @param {number} mid - Gain in dB (-12 to +12)
   * @param {number} treble - Gain in dB (-12 to +12)
   * @param {number} preamp - Gain in dB (-6 to +6)
   */
  setEqualizerBands(bass = 0, mid = 0, treble = 0, preamp = 0) {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    if (this.bassFilter) {
      this.bassFilter.gain.setTargetAtTime(bass, now, 0.05);
    }
    if (this.midFilter) {
      this.midFilter.gain.setTargetAtTime(mid, now, 0.05);
    }
    if (this.trebleFilter) {
      this.trebleFilter.gain.setTargetAtTime(treble, now, 0.05);
    }
    if (this.preampNode) {
      const linearPreamp = Math.pow(10, preamp / 20);
      this.preampNode.gain.setTargetAtTime(linearPreamp, now, 0.05);
    }
  }

  /**
   * Returns current frequency data for real-time visualizers.
   * Reuses the preallocated `frequencyDataArray` — zero per-call allocations.
   * @returns {Uint8Array}
   */
  getFrequencyData() {
    if (!this.analyserNode) {
      this.frequencyDataArray.fill(this.isPlaying ? 40 : 0);
      return this.frequencyDataArray;
    }
    this.analyserNode.getByteFrequencyData(this.frequencyDataArray);
    return this.frequencyDataArray;
  }

  /**
   * Section 21: Real-time Analyser Telemetry for Phase 5
   * Imperatively populates preallocated TypedArrays and calculates
   * frequency sub-band energies (bass, mid, treble, overallEnergy)
   * without creating per-frame React state updates.
   * 
   * @returns {{
   *   frequencyDataArray: Uint8Array,
   *   timeDomainDataArray: Uint8Array,
   *   bass: number,
   *   mid: number,
   *   treble: number,
   *   overallEnergy: number
   * }}
   */
  getAudioTelemetry() {
    if (this.analyserNode && this.isPlaying) {
      const binCount = this.analyserNode.frequencyBinCount;
      if (this.frequencyDataArray.length !== binCount) {
        this.frequencyDataArray = new Uint8Array(binCount);
      }
      if (this.timeDomainDataArray.length !== this.analyserNode.fftSize) {
        this.timeDomainDataArray = new Uint8Array(this.analyserNode.fftSize);
      }

      this.analyserNode.getByteFrequencyData(this.frequencyDataArray);
      this.analyserNode.getByteTimeDomainData(this.timeDomainDataArray);

      const len = this.frequencyDataArray.length; // 128 bins
      // Calibrated sub-bands for FFT 256 @ 44.1/48kHz:
      // Bass: bins 0 to 4 (0Hz - 750Hz) - sub-bass and kick fundamental
      const bEnd = Math.min(5, len);
      // Mid: bins 5 to 24 (750Hz - 4200Hz) - vocals, instruments, snare body
      const mEnd = Math.min(25, len);
      // Treble: bins 25 to len (4200Hz - 22000Hz) - hi-hats, shimmer, air
      const tEnd = len;

      let bSum = 0;
      for (let i = 0; i < bEnd; i++) bSum += this.frequencyDataArray[i];
      const bass = Math.min(1, Math.max(0, bSum / (bEnd * 255)));

      let mSum = 0;
      for (let i = bEnd; i < mEnd; i++) mSum += this.frequencyDataArray[i];
      const mid = Math.min(1, Math.max(0, mSum / (Math.max(1, mEnd - bEnd) * 255)));

      let tSum = 0;
      for (let i = mEnd; i < tEnd; i++) tSum += this.frequencyDataArray[i];
      const treble = Math.min(1, Math.max(0, tSum / (Math.max(1, tEnd - mEnd) * 255)));

      let totalSum = 0;
      for (let i = 0; i < len; i++) totalSum += this.frequencyDataArray[i];
      const overallEnergy = Math.min(1, Math.max(0, totalSum / (len * 255)));

      this.telemetryResult.frequencyDataArray = this.frequencyDataArray;
      this.telemetryResult.timeDomainDataArray = this.timeDomainDataArray;
      this.telemetryResult.bass = bass;
      this.telemetryResult.mid = mid;
      this.telemetryResult.treble = treble;
      this.telemetryResult.overallEnergy = overallEnergy;

      return this.telemetryResult;
    }

    // When paused or stopped: return zero-energy state (audioReactiveManager lerps it smoothly)
    this.frequencyDataArray.fill(0);
    this.timeDomainDataArray.fill(128);

    this.telemetryResult.frequencyDataArray = this.frequencyDataArray;
    this.telemetryResult.timeDomainDataArray = this.timeDomainDataArray;
    this.telemetryResult.bass = 0;
    this.telemetryResult.mid = 0;
    this.telemetryResult.treble = 0;
    this.telemetryResult.overallEnergy = 0;

    return this.telemetryResult;
  }

  // =========================================================================
  // Procedural Harmonic Ambient Synthesizer Fallback
  // (Ensures peaceful, soothing chord loops if audio files fail or are offline)
  // =========================================================================

  startProceduralFallback() {
    this.stopProceduralFallback();
    this.synthActive = true;
    this.isPlaying = true;
    this.synthTime = 0;

    if (!this.audioContext) {
      this.initWebAudio();
    }

    if (!this.audioContext) return;

    // Chords: Dm9, Fmaj7, Cmaj7, Am7 peaceful ambient progression
    const chordPitches = [
      [146.83, 220.0, 261.63, 329.63], // D3, A3, C4, E4
      [174.61, 220.0, 261.63, 349.23], // F3, A3, C4, F4
      [130.81, 196.0, 261.63, 329.63], // C3, G3, C4, E4
      [110.0,  220.0, 261.63, 329.63], // A2, A3, C4, E4
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.synthActive || !this.audioContext) return;
      const pitches = chordPitches[chordIdx % chordPitches.length];
      chordIdx++;

      const now = this.audioContext.currentTime;
      const chordDuration = 5.0;

      pitches.forEach((freq) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft harmonic envelope: fade in 1.5s, sustain, fade out
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

        osc.connect(gain);
        gain.connect(this.preampNode || this.audioContext.destination);

        osc.start(now);
        osc.stop(now + chordDuration);

        this.synthNodes.push(osc);

        // Self-cleanup: remove from array once oscillator finishes to prevent accumulation
        osc.onended = () => {
          const idx = this.synthNodes.indexOf(osc);
          if (idx !== -1) this.synthNodes.splice(idx, 1);
          try { osc.disconnect(); } catch (_) {}
          try { gain.disconnect(); } catch (_) {}
        };
      });
    };

    playChord();
    this.synthInterval = setInterval(() => {
      if (this.isPlaying && this.synthActive) {
        this.synthTime += 1;
        if (this.synthTime >= this.synthDuration) {
          if (this.onEndedCallback) this.onEndedCallback();
        } else if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.synthTime, this.synthDuration);
        }

        if (this.synthTime % 4 === 0) {
          playChord();
        }
      }
    }, 1000);
  }

  resumeProceduralFallback() {
    this.synthActive = true;
    this.isPlaying = true;
  }

  pauseProceduralFallback() {
    this.isPlaying = false;
  }

  stopProceduralFallback() {
    this.synthActive = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.synthNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {
        // Ignored
      }
    });
    this.synthNodes = [];
  }
}

// Global AudioEngine singleton
export const audioEngine = new AudioEngine();
