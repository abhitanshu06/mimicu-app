/**
 * audioEngine.js
 *
 * High-fidelity Browser Audio Engine for Mimicu.
 *
 * Architecture:
 * - ONE persistent HTMLAudioElement owned by this engine (never recreated).
 * - ONE monotonically-increasing request counter (playToken) that invalidates
 *   all stale async work. Every loadAndPlay/play call captures its own token.
 *   If the token changes before an async step completes, the step is silently
 *   abandoned — no race condition, no stale play() restarting after pause/switch.
 * - Procedural fallback synthesizer is ONLY started on genuine, unrecoverable
 *   media decode/network errors — never on AbortError (which is a normal
 *   side-effect of calling pause() or changing src while play() is pending).
 * - Web Audio DSP chain (EQ + Analyser) is connected once to the persistent element.
 */

class AudioEngine {
  constructor() {
    // ── HTMLAudioElement ──────────────────────────────────────────────────────
    this.audioElement = null;

    // ── Web Audio API chain ───────────────────────────────────────────────────
    this.audioContext = null;
    this.sourceNode = null;
    this.preampNode = null;
    this.bassFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;
    this.analyserNode = null;
    this.masterGainNode = null;

    // ── State ─────────────────────────────────────────────────────────────────
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentUrl = null;
    this.volume = 0.8;
    this.isMuted = false;

    // ── Race-condition guard ──────────────────────────────────────────────────
    // Monotonically increasing token. Every new play/load request increments
    // this counter and captures the new value. Any async step that finds its
    // captured token !== this.playToken is stale and must abort silently.
    this.playToken = 0;

    // ── Store callbacks ───────────────────────────────────────────────────────
    this.onTimeUpdateCallback = null;
    this.onEndedCallback = null;
    this.onErrorCallback = null;
    this.onLoadingCallback = null;

    // ── Telemetry (preallocated — zero per-frame allocations) ─────────────────
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

    // ── Procedural Fallback Synthesizer ───────────────────────────────────────
    this.synthActive = false;
    this.synthInterval = null;
    this.synthNodes = [];
    this.synthTime = 0;
    this.synthDuration = 210;

    this._initAudioElement();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO ELEMENT SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Creates the ONE persistent HTMLAudioElement with all required event listeners.
   * Must never be called more than once.
   */
  _initAudioElement() {
    if (typeof window === 'undefined') return;

    this.audioElement = new Audio();
    // NOTE: We intentionally do NOT set crossOrigin = 'anonymous' here.
    // Setting it causes CORS failures on external CDN URLs (e.g. freesound.org)
    // that don't return Access-Control-Allow-Origin headers, making the entire
    // audio load fail even though the browser could otherwise play the file.
    // Web Audio's createMediaElementSource will gracefully fail for cross-origin
    // sources without CORS headers (analyser data becomes silent) but playback
    // itself continues normally through the system audio path.
    this.audioElement.preload = 'auto';

    // ── timeupdate ────────────────────────────────────────────────────────────
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback && this.audioElement) {
        this.onTimeUpdateCallback(
          this.audioElement.currentTime,
          this.audioElement.duration || 0
        );
      }
    });

    // ── ended ─────────────────────────────────────────────────────────────────
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onEndedCallback) this.onEndedCallback();
    });

    // ── waiting / playing ─────────────────────────────────────────────────────
    this.audioElement.addEventListener('waiting', () => {
      if (this.onLoadingCallback) this.onLoadingCallback(true);
    });

    this.audioElement.addEventListener('playing', () => {
      this.isPlaying = true;
      if (this.onLoadingCallback) this.onLoadingCallback(false);
    });

    // ── error ─────────────────────────────────────────────────────────────────
    // Note: this event fires for genuine network/decode failures, NOT for
    // AbortError which only surfaces through the play() promise rejection.
    // We intentionally do NOT start the procedural fallback here because
    // loadAndPlay() already handles error recovery with fallback URL logic.
    // The procedural synth is started only if loadAndPlay() explicitly calls it.
    this.audioElement.addEventListener('error', (e) => {
      // Suppress if we are in the middle of a src change — the error
      // is from the previous src being invalidated, which is normal.
      if (!this.audioElement.src || this.audioElement.src === window.location.href) return;

      if (import.meta.env.DEV) {
        console.warn('[AudioEngine] media error event:', e, 'src:', this.audioElement.src);
      }
      // Do NOT start procedural fallback here — let loadAndPlay's catch handle it.
      // This avoids a double-start race where both the error event and the
      // catch block both call startProceduralFallback().
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WEB AUDIO INIT
  // ═══════════════════════════════════════════════════════════════════════════

  initWebAudio() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('[AudioEngine] Web Audio API not supported');
        return;
      }

      this.audioContext = new AudioContextClass();

      this.preampNode = this.audioContext.createGain();
      this.preampNode.gain.value = 1.0;

      this.bassFilter = this.audioContext.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 120;
      this.bassFilter.gain.value = 0;

      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = 0;

      this.trebleFilter = this.audioContext.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 7000;
      this.trebleFilter.gain.value = 0;

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = this.isMuted ? 0 : this.volume;

      // DSP chain: Source → Preamp → Bass → Mid → Treble → Analyser → MasterGain → Out
      this.preampNode.connect(this.bassFilter);
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.analyserNode);
      this.analyserNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);

      // Connect the persistent audio element ONCE.
      // createMediaElementSource can only be called once per HTMLAudioElement.
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
      console.warn('[AudioEngine] Web Audio initialization error:', err);
    }
  }

  async _ensureContextActive() {
    this.initWebAudio();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (err) {
        console.warn('[AudioEngine] AudioContext resume error:', err);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIMARY PLAYBACK API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Load a new track URL and start playing it immediately.
   *
   * Race-condition safety:
   * - Increments playToken before any async work.
   * - Every await captures the token at the time of the call.
   * - If the token changes (because a newer call arrived) before an await
   *   resolves, the old call abandons all further work silently.
   * - AbortError from play() is explicitly caught and ignored — it is not a
   *   real error, it just means the browser cancelled the pending play() call
   *   because we changed src or called pause().
   *
   * @param {string} url          - Primary audio URL to load
   * @param {number} fallbackDuration - Track duration for synth fallback
   * @param {string|null} fallbackUrl - Secondary URL if primary fails (optional)
   */
  async loadAndPlay(url, fallbackDuration = 200, fallbackUrl = null) {
    // Stop any running procedural synth immediately.
    this.stopProceduralFallback();

    // ── Invalidate all previous requests ──────────────────────────────────────
    const token = ++this.playToken;

    if (import.meta.env.DEV) {
      console.log(`[AudioEngine] loadAndPlay token=${token} url=${url}`);
    }

    this.synthDuration = fallbackDuration || 200;

    if (!this.audioElement) {
      console.error('[AudioEngine] No audio element — cannot play');
      return;
    }

    // ── Ensure AudioContext is active ─────────────────────────────────────────
    await this._ensureContextActive();
    if (token !== this.playToken) {
      if (import.meta.env.DEV) console.log(`[AudioEngine] stale after ensureContext token=${token}`);
      return;
    }

    if (this.onLoadingCallback) this.onLoadingCallback(true);

    // ── Pause current playback before changing src ────────────────────────────
    // This immediately cancels any pending play() promise on the old src.
    try { this.audioElement.pause(); } catch (_) {}
    this.isPlaying = false;

    // ── Set the new source ────────────────────────────────────────────────────
    this.currentUrl = url;
    this.audioElement.src = url;
    this.audioElement.currentTime = 0;

    // ── Attempt playback ──────────────────────────────────────────────────────
    try {
      await this.audioElement.play();

      // Stale check: did a newer request come in while we were awaiting play()?
      if (token !== this.playToken) {
        if (import.meta.env.DEV) console.log(`[AudioEngine] stale after play() resolved token=${token}, pausing`);
        try { this.audioElement.pause(); } catch (_) {}
        return;
      }

      this.isPlaying = true;
      if (this.onLoadingCallback) this.onLoadingCallback(false);

      if (import.meta.env.DEV) console.log(`[AudioEngine] play() resolved ok token=${token}`);

    } catch (err) {
      if (import.meta.env.DEV) console.log(`[AudioEngine] play() rejected token=${token} name=${err.name} msg=${err.message}`);

      // AbortError = play() was cancelled because we changed src or called pause().
      // This is NORMAL behaviour during rapid track switching — not a real error.
      if (err.name === 'AbortError') {
        if (import.meta.env.DEV) console.log('[AudioEngine] AbortError ignored (expected during track switch / pause)');
        if (this.onLoadingCallback) this.onLoadingCallback(false);
        return;
      }

      // Stale: a newer request superseded us, just bail.
      if (token !== this.playToken) {
        if (this.onLoadingCallback) this.onLoadingCallback(false);
        return;
      }

      // ── Try fallback URL ───────────────────────────────────────────────────
      if (fallbackUrl && fallbackUrl !== url) {
        console.warn('[AudioEngine] Primary URL failed, trying fallback:', fallbackUrl, err.message);

        const fbToken = this.playToken; // must still be our token here
        this.audioElement.src = fallbackUrl;
        this.audioElement.currentTime = 0;

        try {
          await this.audioElement.play();

          if (fbToken !== this.playToken) {
            try { this.audioElement.pause(); } catch (_) {}
            if (this.onLoadingCallback) this.onLoadingCallback(false);
            return;
          }

          this.isPlaying = true;
          if (this.onLoadingCallback) this.onLoadingCallback(false);
          return;
        } catch (fbErr) {
          if (fbErr.name === 'AbortError') {
            if (this.onLoadingCallback) this.onLoadingCallback(false);
            return;
          }
          console.warn('[AudioEngine] Fallback URL also failed:', fbErr.message);
        }
      }

      // ── Both URLs failed — start procedural ambient synth ──────────────────
      if (token !== this.playToken) {
        if (this.onLoadingCallback) this.onLoadingCallback(false);
        return;
      }

      console.warn('[AudioEngine] All URLs failed, activating procedural ambient generator');
      if (this.onLoadingCallback) this.onLoadingCallback(false);
      if (this.onErrorCallback) this.onErrorCallback(err);
      this.startProceduralFallback();
    }
  }

  /**
   * Resume playback of the current track (used by togglePlay / play store action).
   * Does NOT change the current src — only resumes.
   */
  async play() {
    await this._ensureContextActive();

    if (this.synthActive) {
      this.resumeProceduralFallback();
      this.isPlaying = true;
      return;
    }

    if (!this.audioElement) return;

    // Invalidate any previous pending play() from loadAndPlay so it can't
    // interfere with this resume.
    const token = ++this.playToken;

    if (import.meta.env.DEV) console.log(`[AudioEngine] play() (resume) token=${token}`);

    try {
      await this.audioElement.play();

      if (token !== this.playToken) {
        if (import.meta.env.DEV) console.log(`[AudioEngine] resume stale after play() token=${token}`);
        try { this.audioElement.pause(); } catch (_) {}
        return;
      }

      this.isPlaying = true;
    } catch (err) {
      if (err.name === 'AbortError') {
        if (import.meta.env.DEV) console.log('[AudioEngine] resume AbortError ignored');
        return;
      }
      console.warn('[AudioEngine] Resume play() error:', err);
      this.startProceduralFallback();
    }
  }

  /**
   * Pause playback immediately.
   * Incrementing playToken invalidates any concurrent or pending play() promise
   * so it cannot restart playback after we've paused.
   */
  pause() {
    // Invalidate all pending async play work FIRST.
    this.playToken++;

    if (import.meta.env.DEV) console.log(`[AudioEngine] pause() — new token=${this.playToken}`);

    if (this.synthActive) {
      this.pauseProceduralFallback();
      this.isPlaying = false;
      return;
    }

    if (this.audioElement) {
      try { this.audioElement.pause(); } catch (_) {}
      this.isPlaying = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SEEK / VOLUME / MUTE / EQ
  // ═══════════════════════════════════════════════════════════════════════════

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

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    const effective = this.isMuted ? 0 : this.volume;

    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setTargetAtTime(effective, this.audioContext.currentTime, 0.02);
    }
    if (this.audioElement) {
      this.audioElement.volume = effective;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  setEqualizerBands(bass = 0, mid = 0, treble = 0, preamp = 0) {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;

    if (this.bassFilter) this.bassFilter.gain.setTargetAtTime(bass, now, 0.05);
    if (this.midFilter) this.midFilter.gain.setTargetAtTime(mid, now, 0.05);
    if (this.trebleFilter) this.trebleFilter.gain.setTargetAtTime(treble, now, 0.05);
    if (this.preampNode) {
      const linearPreamp = Math.pow(10, preamp / 20);
      this.preampNode.gain.setTargetAtTime(linearPreamp, now, 0.05);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIO TELEMETRY (visualizer data — zero-allocation)
  // ═══════════════════════════════════════════════════════════════════════════

  getFrequencyData() {
    if (!this.analyserNode) {
      this.frequencyDataArray.fill(this.isPlaying ? 40 : 0);
      return this.frequencyDataArray;
    }
    this.analyserNode.getByteFrequencyData(this.frequencyDataArray);
    return this.frequencyDataArray;
  }

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

      const len = this.frequencyDataArray.length;
      const bEnd = Math.min(5, len);
      const mEnd = Math.min(25, len);

      let bSum = 0;
      for (let i = 0; i < bEnd; i++) bSum += this.frequencyDataArray[i];
      const bass = Math.min(1, Math.max(0, bSum / (bEnd * 255)));

      let mSum = 0;
      for (let i = bEnd; i < mEnd; i++) mSum += this.frequencyDataArray[i];
      const mid = Math.min(1, Math.max(0, mSum / (Math.max(1, mEnd - bEnd) * 255)));

      let tSum = 0;
      for (let i = mEnd; i < len; i++) tSum += this.frequencyDataArray[i];
      const treble = Math.min(1, Math.max(0, tSum / (Math.max(1, len - mEnd) * 255)));

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

    // Paused or stopped: return zero-energy so visualizers fade out smoothly.
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PROCEDURAL FALLBACK SYNTHESIZER
  // Only activated when ALL real audio URLs have failed to load/decode.
  // NOT triggered on AbortError or intentional pause/track-switch.
  // ═══════════════════════════════════════════════════════════════════════════

  startProceduralFallback() {
    this.stopProceduralFallback();
    this.synthTime = 0;

    if (!this.audioContext) this.initWebAudio();
    if (!this.audioContext) {
      // No AudioContext — can't run synth. Reflect truthful state.
      this.synthActive = false;
      this.isPlaying = false;
      return;
    }

    this.synthActive = true;
    this.isPlaying = true;

    // Dm9, Fmaj7, Cmaj7, Am7 — peaceful ambient chord progression
    const chordPitches = [
      [146.83, 220.0, 261.63, 329.63],
      [174.61, 220.0, 261.63, 349.23],
      [130.81, 196.0,  261.63, 329.63],
      [110.0,  220.0, 261.63, 329.63],
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.synthActive || !this.audioContext) return;
      const pitches = chordPitches[chordIdx++ % chordPitches.length];
      const now = this.audioContext.currentTime;
      const dur = 5.0;

      pitches.forEach((freq) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.preampNode || this.audioContext.destination);
        osc.start(now);
        osc.stop(now + dur);

        this.synthNodes.push(osc);
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
      if (!this.isPlaying || !this.synthActive) return;
      this.synthTime += 1;
      if (this.synthTime >= this.synthDuration) {
        if (this.onEndedCallback) this.onEndedCallback();
      } else if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.synthTime, this.synthDuration);
      }
      if (this.synthTime % 4 === 0) playChord();
    }, 1000);
  }

  resumeProceduralFallback() {
    this.synthActive = true;
    this.isPlaying = true;
  }

  pauseProceduralFallback() {
    this.isPlaying = false;
    // Note: synthActive stays true so we know synth is the active "source"
  }

  stopProceduralFallback() {
    this.synthActive = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.synthNodes.forEach((node) => {
      try { node.stop(); node.disconnect(); } catch (_) {}
    });
    this.synthNodes = [];
  }
}

// Global AudioEngine singleton — ONE instance for the entire app lifetime.
export const audioEngine = new AudioEngine();
