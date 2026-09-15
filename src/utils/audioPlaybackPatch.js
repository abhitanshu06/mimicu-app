import { audioEngine } from './audioEngine.js';

/**
 * Stable playback coordinator for Mimicu.
 *
 * Every async playback operation receives a generation token so an old
 * Play/Load request cannot resurrect playback after Pause/Next.
 * During the frontend/demo stage, prefer the track's direct audioUrl
 * (passed as fallbackUrl by audioStore) instead of waiting for the backend
 * streaming endpoint to fail first.
 */

if (typeof window !== 'undefined' && audioEngine && !audioEngine.__stablePlaybackPatch) {
  audioEngine.__stablePlaybackPatch = true;

  let requestId = 0;

  const createCleanAudioElement = () => {
    const element = new Audio();
    element.crossOrigin = 'anonymous';
    element.preload = 'auto';
    element.volume = audioEngine.isMuted ? 0 : audioEngine.volume;

    element.addEventListener('timeupdate', () => {
      audioEngine.onTimeUpdateCallback?.(
        element.currentTime,
        Number.isFinite(element.duration) ? element.duration : 0,
      );
    });

    element.addEventListener('loadedmetadata', () => {
      audioEngine.onTimeUpdateCallback?.(
        element.currentTime,
        Number.isFinite(element.duration) ? element.duration : 0,
      );
    });

    element.addEventListener('ended', () => {
      audioEngine.isPlaying = false;
      audioEngine.onEndedCallback?.();
    });

    element.addEventListener('waiting', () => audioEngine.onLoadingCallback?.(true));
    element.addEventListener('canplay', () => audioEngine.onLoadingCallback?.(false));

    element.addEventListener('playing', () => {
      audioEngine.isPlaying = true;
      audioEngine.onLoadingCallback?.(false);
    });

    element.addEventListener('pause', () => {
      audioEngine.isPlaying = false;
    });

    element.addEventListener('error', () => {
      if (requestId !== audioEngine.__playRequestId) return;
      audioEngine.isPlaying = false;
      audioEngine.onLoadingCallback?.(false);
      const error = element.error || new Error('Audio source unavailable');
      console.warn('[AudioEngine] Media error:', error);
      audioEngine.onErrorCallback?.(error);
    });

    return element;
  };

  // Replace the constructor-created element before Web Audio creates its
  // MediaElementSourceNode, removing the legacy race-prone listeners.
  audioEngine.audioElement = createCleanAudioElement();
  audioEngine.isPlaying = false;
  audioEngine.currentUrl = null;
  audioEngine.fallbackUrl = null;
  audioEngine.__playRequestId = 0;

  audioEngine.loadAndPlay = async (url, fallbackDuration = 200, fallbackUrl = null) => {
    const token = ++requestId;
    audioEngine.__playRequestId = token;

    // IMPORTANT: the direct track audioUrl is supplied as fallbackUrl by the
    // current audioStore. Use it first so there is no backend 404 wait before
    // a demo song starts playing.
    const resolvedUrl = fallbackUrl || url;
    if (!resolvedUrl) return false;

    const element = audioEngine.audioElement;

    // Synchronously stop whatever was playing before changing sources.
    element.pause();
    audioEngine.currentUrl = resolvedUrl;
    audioEngine.fallbackUrl = null;
    audioEngine.synthDuration = fallbackDuration || 200;
    audioEngine.isPlaying = false;
    audioEngine.onLoadingCallback?.(true);

    try {
      await audioEngine.ensureContextActive();
      if (token !== requestId) return false;

      // load() aborts stale media operations. AbortError from an invalidated
      // request is expected control flow and must never start a fake track.
      element.pause();
      element.removeAttribute('src');
      element.load();
      element.src = resolvedUrl;
      element.load();
      element.currentTime = 0;
      element.volume = audioEngine.isMuted ? 0 : audioEngine.volume;

      try {
        await element.play();
      } catch (error) {
        if (token !== requestId || error?.name === 'AbortError') return false;

        audioEngine.isPlaying = false;
        audioEngine.onLoadingCallback?.(false);
        audioEngine.onErrorCallback?.(error);
        return false;
      }

      if (token !== requestId) {
        element.pause();
        return false;
      }

      audioEngine.isPlaying = !element.paused;
      audioEngine.onLoadingCallback?.(false);
      return audioEngine.isPlaying;
    } catch (error) {
      if (token !== requestId || error?.name === 'AbortError') return false;
      audioEngine.isPlaying = false;
      audioEngine.onLoadingCallback?.(false);
      audioEngine.onErrorCallback?.(error);
      return false;
    }
  };

  audioEngine.play = async () => {
    const token = ++requestId;
    audioEngine.__playRequestId = token;

    const element = audioEngine.audioElement;
    if (!element || !element.src) return false;

    try {
      await audioEngine.ensureContextActive();
      if (token !== requestId) return false;

      await element.play();
      if (token !== requestId) {
        element.pause();
        return false;
      }

      audioEngine.isPlaying = !element.paused;
      return audioEngine.isPlaying;
    } catch (error) {
      if (token !== requestId || error?.name === 'AbortError') return false;
      audioEngine.isPlaying = false;
      audioEngine.onErrorCallback?.(error);
      return false;
    }
  };

  audioEngine.pause = () => {
    // Invalidate all pending async play/load requests immediately.
    requestId += 1;
    audioEngine.__playRequestId = requestId;
    audioEngine.fallbackUrl = null;
    audioEngine.isPlaying = false;
    audioEngine.onLoadingCallback?.(false);

    if (audioEngine.audioElement) {
      audioEngine.audioElement.pause();
    }
  };
}

export { audioEngine };
