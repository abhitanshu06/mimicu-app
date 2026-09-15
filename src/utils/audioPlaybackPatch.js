import { audioEngine } from './audioEngine.js';

/**
 * Stable playback coordinator for Mimicu.
 *
 * The original engine has async play/load operations. A quick pause/next
 * during those awaits could let an older promise resume and start playback
 * again. This patch gives every playback request a generation token so stale
 * async operations are ignored.
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
      if (audioEngine.onTimeUpdateCallback) {
        audioEngine.onTimeUpdateCallback(
          element.currentTime,
          element.duration || 0,
        );
      }
    });

    element.addEventListener('ended', () => {
      audioEngine.isPlaying = false;
      if (audioEngine.onEndedCallback) audioEngine.onEndedCallback();
    });

    element.addEventListener('waiting', () => {
      if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(true);
    });

    element.addEventListener('playing', () => {
      audioEngine.isPlaying = true;
      if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
    });

    element.addEventListener('pause', () => {
      if (!element.ended) audioEngine.isPlaying = false;
    });

    element.addEventListener('error', (event) => {
      // Ignore errors caused by an already-invalidated request.
      if (requestId !== audioEngine.__playRequestId) return;
      if (audioEngine.__errorHandledForRequest === requestId) return;

      audioEngine.isPlaying = false;
      if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
      if (audioEngine.onErrorCallback) {
        audioEngine.onErrorCallback(event);
      }
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
  audioEngine.__errorHandledForRequest = 0;

  audioEngine.loadAndPlay = async (url, fallbackDuration = 200, fallbackUrl = null) => {
    const token = ++requestId;
    audioEngine.__playRequestId = token;
    audioEngine.__errorHandledForRequest = 0;

    if (!url) return false;

    const element = audioEngine.audioElement;

    // Invalidate/stop anything currently active immediately.
    element.pause();
    audioEngine.stopProceduralFallback();
    audioEngine.currentUrl = url;
    audioEngine.fallbackUrl = null;
    audioEngine.synthDuration = fallbackDuration || 200;

    if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(true);

    try {
      await audioEngine.ensureContextActive();

      if (token !== requestId) return false;

      element.pause();
      element.src = url;
      element.currentTime = 0;
      element.load();

      await element.play();

      if (token !== requestId) {
        element.pause();
        return false;
      }

      audioEngine.isPlaying = true;
      if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
      return true;
    } catch (primaryError) {
      if (token !== requestId) return false;

      if (fallbackUrl && fallbackUrl !== url) {
        try {
          element.pause();
          element.src = fallbackUrl;
          element.currentTime = 0;
          element.load();

          await element.play();

          if (token !== requestId) {
            element.pause();
            return false;
          }

          audioEngine.isPlaying = true;
          if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
          return true;
        } catch (fallbackError) {
          console.warn('[AudioEngine] Fallback URL failed:', fallbackError);
        }
      }

      audioEngine.__errorHandledForRequest = token;
      if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
      console.warn('[AudioEngine] Playback failed:', primaryError);
      audioEngine.startProceduralFallback();
      return false;
    }
  };

  audioEngine.play = async () => {
    const token = ++requestId;
    audioEngine.__playRequestId = token;
    audioEngine.__errorHandledForRequest = 0;

    try {
      await audioEngine.ensureContextActive();
      if (token !== requestId) return false;

      if (audioEngine.synthActive) {
        audioEngine.resumeProceduralFallback();
        audioEngine.isPlaying = true;
        return true;
      }

      const element = audioEngine.audioElement;
      if (!element || !element.src) return false;

      await element.play();
      if (token !== requestId) {
        element.pause();
        return false;
      }

      audioEngine.isPlaying = true;
      return true;
    } catch (error) {
      if (token !== requestId) return false;
      console.warn('[AudioEngine] Resume error:', error);
      audioEngine.startProceduralFallback();
      return false;
    }
  };

  audioEngine.pause = () => {
    // Invalidate every pending async play/load immediately.
    requestId += 1;
    audioEngine.__playRequestId = requestId;
    audioEngine.__errorHandledForRequest = requestId;
    audioEngine.fallbackUrl = null;

    if (audioEngine.synthActive) {
      audioEngine.pauseProceduralFallback();
    }

    if (audioEngine.audioElement) {
      audioEngine.audioElement.pause();
    }

    audioEngine.isPlaying = false;
    if (audioEngine.onLoadingCallback) audioEngine.onLoadingCallback(false);
  };
}

export { audioEngine };
