import { audioEngine } from './audioEngine.js';

/**
 * Stable playback coordinator for Mimicu.
 *
 * The player must have deterministic Play/Pause/Next behavior. Every async
 * playback operation gets a generation token; an older operation can never
 * restart playback after a newer Pause/Next action.
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
      audioEngine.onTimeUpdateCallback?.(element.currentTime, Number.isFinite(element.duration) ? element.duration : 0);
    });

    element.addEventListener('loadedmetadata', () => {
      audioEngine.onTimeUpdateCallback?.(element.currentTime, Number.isFinite(element.duration) ? element.duration : 0);
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
      // Ignore errors from a request that has already been invalidated.
      if (requestId !== audioEngine.__playRequestId) return;
      audioEngine.isPlaying = false;
      audioEngine.onLoadingCallback?.(false);
      const err = element.error || new Error('Audio source unavailable');
      console.warn('[AudioEngine] Media error:', err);
      audioEngine.onErrorCallback?.(err);
    });

    return element;
  };

  // Replace the constructor-created element before Web Audio creates its
  // MediaElementSourceNode, removing the legacy fallback/race listeners.
  audioEngine.audioElement = createCleanAudioElement();
  audioEngine.isPlaying = false;
  audioEngine.currentUrl = null;
  audioEngine.fallbackUrl = null;
  audioEngine.__playRequestId = 0;

  audioEngine.loadAndPlay = async (url, fallbackDuration = 200, fallbackUrl = null) => {
    const token = ++requestId;
    audioEngine.__playRequestId = token;

    if (!url) return false;

    const element = audioEngine.audioElement;

    // Stop the old source immediately and invalidate its play promise.
    element.pause();
    audioEngine.currentUrl = url;
    audioEngine.fallbackUrl = fallbackUrl || null;
    audioEngine.synthDuration = fallbackDuration || 200;
    audioEngine.isPlaying = false;
    audioEngine.onLoadingCallback?.(true);

    try {
      await audioEngine.ensureContextActive();
      if (token !== requestId) return false;

      // load() aborts stale media operations. AbortError here is expected
      // control flow and must NEVER trigger procedural/synthetic playback.
      element.pause();
      element.removeAttribute('src');
      element.load();
      element.src = url;
      element.load();
      element.currentTime = 0;
      element.volume = audioEngine.isMuted ? 0 : audioEngine.volume;

      try {
        await element.play();
      } catch (error) {
        if (token !== requestId || error?.name === 'AbortError') return false;

        // Optional fallback URL is only for a genuine source failure. Never
        // use the procedural generator because it hides broken audio sources.
        if (fallbackUrl && fallbackUrl !== url) {
          element.pause();
          element.src = fallbackUrl;
          element.load();
          element.currentTime = 0;
          await element.play();
          if (token !== requestId) {
            element.pause();
            return false;
          }
          audioEngine.isPlaying = true;
          audioEngine.onLoadingCallback?.(false);
          return true;
        }

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
      // AbortError simply means Pause/Next invalidated this play request.
      if (token !== requestId || error?.name === 'AbortError') return false;
      audioEngine.isPlaying = false;
      audioEngine.onErrorCallback?.(error);
      return false;
    }
  };

  audioEngine.pause = () => {
    // Synchronously invalidate all pending async play/load requests.
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
