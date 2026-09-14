import { create } from 'zustand';
import { audioEngine } from '../utils/audioEngine.js';
import { TRACKS, getTracksForVibe } from '../data/tracks.js';
import { VIBES } from '../config/vibes.js';
import { useVibeStore } from './vibeStore.js';
import {
  getAudioStreamUrl,
  likeTrackApi,
  unlikeTrackApi,
  recordRecentPlayApi,
} from '../services/api/index.js';

/**
 * Resolves the primary audio streaming URL with fallback to track.audioUrl
 * @param {Object} track
 * @returns {string}
 */
function getPlayableUrl(track) {
  if (!track) return '';
  if (track.id) {
    return getAudioStreamUrl(track.id);
  }
  return track.audioUrl || '';
}

/**
 * Fisher-Yates Array Shuffle
 * @param {Array} array 
 * @param {Object|null} retainFirst - Optional item to pin at index 0
 * @returns {Array} Shuffled clone
 */
function shuffleTracks(array, retainFirst = null) {
  const items = retainFirst 
    ? array.filter((t) => t.id !== retainFirst.id)
    : [...array];

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return retainFirst ? [retainFirst, ...items] : items;
}

/**
 * useAudioStore
 * 
 * Master Zustand store managing Mimicu's persistent music playback,
 * audio queue, shuffle logic, repeat cycles, and Vibe context.
 */
export const useAudioStore = create((set, get) => {
  // Set up listeners between audioEngine and the store
  audioEngine.onTimeUpdateCallback = (currentTime, duration) => {
    const dur = duration > 0 ? duration : (get().currentTrack?.duration || 0);
    const progress = dur > 0 ? Math.min(1, Math.max(0, currentTime / dur)) : 0;
    set({
      currentTime,
      duration: dur,
      progress,
    });
  };

  audioEngine.onEndedCallback = () => {
    const { repeat, queue, queueIndex, shuffle, originalQueue, playbackContext } = get();

    if (repeat === 'track') {
      // Repeat current track
      audioEngine.seek(0);
      audioEngine.play();
      set({ currentTime: 0, progress: 0, playing: true });
      return;
    }

    if (queueIndex < queue.length - 1) {
      // Advance to next song in queue
      get().next();
    } else if (repeat === 'queue' || repeat === 'vibe') {
      // Reached end of queue with Repeat Queue / Repeat Vibe ON
      if (shuffle) {
        const reshuffled = shuffleTracks(originalQueue);
        const firstTrack = reshuffled[0];
        set({
          queue: reshuffled,
          queueIndex: 0,
          currentTrack: firstTrack,
          currentTime: 0,
          progress: 0,
          playing: true,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().syncTrackChange(firstTrack, 0);
        }
        recordHistory(firstTrack);
        audioEngine.loadAndPlay(getPlayableUrl(firstTrack), firstTrack.duration, firstTrack.audioUrl);
      } else {
        const firstTrack = queue[0];
        set({
          queueIndex: 0,
          currentTrack: firstTrack,
          currentTime: 0,
          progress: 0,
          playing: true,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().syncTrackChange(firstTrack, 0);
        }
        recordHistory(firstTrack);
        audioEngine.loadAndPlay(getPlayableUrl(firstTrack), firstTrack.duration, firstTrack.audioUrl);
      }
    } else {
      // End of queue with repeat OFF -> Stop playback gracefully
      set({ playing: false, progress: 0, currentTime: 0 });
      audioEngine.pause();
      audioEngine.seek(0);
      if (playbackContext?.type === 'vibe') {
        useVibeStore.getState().setVibePlaybackActive(false);
      }
    }
  };

  audioEngine.onLoadingCallback = (loading) => {
    set({ loading });
  };

  audioEngine.onErrorCallback = (error) => {
    console.warn('[AudioStore] Playback error encountered:', error);
    set({ error: 'Audio source unavailable. Playing ambient generator.' });
  };

  // Storage persistence helpers
  let initialLikedTracks = [];
  let initialHistory = [];
  if (typeof window !== 'undefined') {
    try {
      const savedLikes = localStorage.getItem('mimicu_liked_tracks');
      if (savedLikes) initialLikedTracks = JSON.parse(savedLikes);
    } catch (e) {
      console.warn('Could not read saved liked tracks:', e);
    }
    try {
      const savedHistory = localStorage.getItem('mimicu_recently_played');
      if (savedHistory) initialHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.warn('Could not read saved history:', e);
    }
  }

  const recordHistory = (track) => {
    if (!track || !track.id) return;
    const currentHistory = get().history || [];
    const filtered = currentHistory.filter((t) => t.id !== track.id);
    const updated = [track, ...filtered].slice(0, 20);
    set({ history: updated });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mimicu_recently_played', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist history:', e);
      }
    }
    // Async backend record
    try {
      recordRecentPlayApi(track.id).catch(() => {});
    } catch (_) {}
  };

  // Initial default tracks queue
  const initialVibeId = '3-am-night-walk';
  const initialVibeTracks = getTracksForVibe(initialVibeId);
  const defaultTrack = initialVibeTracks[0] || TRACKS[0];

  return {
    // Current playback state
    currentTrack: defaultTrack,
    playing: false,
    progress: 0,
    currentTime: 0,
    duration: defaultTrack.duration || 214,
    volume: 0.8,
    muted: false,
    loading: false,
    error: null,

    // Queue & navigation state
    queue: initialVibeTracks,
    originalQueue: initialVibeTracks,
    queueIndex: 0,
    history: initialHistory,

    // Likes state
    likedTrackIds: initialLikedTracks,

    // Modes: 'off' | 'queue' | 'vibe' | 'track'
    shuffle: false,
    repeat: 'vibe', // canonical repeat mode: 'off' | 'queue' | 'vibe' | 'track'

    // Playback Context Architecture (Section 12)
    playbackContext: {
      type: 'vibe',
      id: initialVibeId,
      name: VIBES[initialVibeId]?.name || '3 AM Night Walk',
      emoji: VIBES[initialVibeId]?.emoji || '🌃',
      page: `/vibes/${initialVibeId}`,
    },

    // Vibe Context (backward-compatibility)
    currentVibe: VIBES[initialVibeId]?.name || '3 AM Night Walk',
    currentVibeContext: {
      type: 'vibe',
      id: initialVibeId,
      name: VIBES[initialVibeId]?.name || '3 AM Night Walk',
      emoji: VIBES[initialVibeId]?.emoji || '🌃',
      page: `/vibes/${initialVibeId}`,
    },

    // UI State
    isFullPlayerOpen: false,

    /**
     * Start playing a specific track
     * @param {Object} track
     * @param {Array|null} customQueue
     * @param {Object|null} context - { type: 'vibe' | 'playlist' | 'search' | 'library', ... }
     */
    playTrack: (track, customQueue = null, context = null) => {
      if (!track) return;
      const state = get();
      let activeQueue = customQueue || state.queue;
      let newOriginalQueue = customQueue || state.originalQueue;

      // If track is not currently in queue, prepend it
      if (!activeQueue.some((t) => t.id === track.id)) {
        activeQueue = [track, ...activeQueue];
        newOriginalQueue = [track, ...newOriginalQueue];
      }

      const idx = activeQueue.findIndex((t) => t.id === track.id);
      const isVibe = context?.type === 'vibe';
      const resolvedContext = context || (isVibe ? state.currentVibeContext : {
        type: 'search',
        name: 'Single Playback',
        emoji: '🎵',
        page: '/search',
      });

      set({
        currentTrack: track,
        queue: activeQueue,
        originalQueue: newOriginalQueue,
        queueIndex: idx !== -1 ? idx : 0,
        playing: true,
        progress: 0,
        currentTime: 0,
        duration: track.duration || 200,
        error: null,
        playbackContext: resolvedContext,
        currentVibe: isVibe ? (resolvedContext.name || state.currentVibe) : state.currentVibe,
        currentVibeContext: isVibe ? resolvedContext : null,
      });

      // Context separation: if non-vibe context, clear vibe session to prevent corruption
      if (!isVibe) {
        useVibeStore.getState().clearVibePlayback();
      } else {
        useVibeStore.getState().syncTrackChange(track, idx !== -1 ? idx : 0);
      }

      recordHistory(track);
      audioEngine.loadAndPlay(getPlayableUrl(track), track.duration, track.audioUrl);
    },

    /**
     * Play an entire Vibe's collection from start, specific index, or with shuffle
     * @param {string} vibeId
     * @param {boolean} shouldShuffle
     * @param {number} startIndex
     */
    playVibe: (vibeId, shouldShuffle = false, startIndex = 0) => {
      const vibe = VIBES[vibeId];
      if (!vibe) return;

      const vibeTracks = getTracksForVibe(vibeId);
      if (!vibeTracks.length) return;

      const validStartIndex = (startIndex >= 0 && startIndex < vibeTracks.length) ? startIndex : 0;
      const startSelectedTrack = vibeTracks[validStartIndex] || vibeTracks[0];

      let queue = [...vibeTracks];
      let queueIdx = validStartIndex;

      if (shouldShuffle) {
        // Pin selected track at index 0, randomize remainder via Fisher-Yates
        queue = shuffleTracks(vibeTracks, startSelectedTrack);
        queueIdx = 0;
      }

      const activeTrack = queue[queueIdx];
      const vibeContext = {
        type: 'vibe',
        id: vibeId,
        name: vibe.name,
        emoji: vibe.emoji,
        page: `/vibes/${vibeId}`,
      };

      set({
        currentTrack: activeTrack,
        queue,
        originalQueue: [...vibeTracks],
        queueIndex: queueIdx,
        shuffle: shouldShuffle,
        repeat: get().repeat === 'track' ? 'track' : (get().repeat === 'off' ? 'off' : 'vibe'),
        playing: true,
        progress: 0,
        currentTime: 0,
        duration: activeTrack.duration || 200,
        error: null,
        playbackContext: vibeContext,
        currentVibe: vibe.name,
        currentVibeContext: vibeContext,
      });

      // Synchronize vibeStore session
      useVibeStore.getState().setVibePlaylist(vibeTracks);
      useVibeStore.getState().syncTrackChange(activeTrack, validStartIndex);
      useVibeStore.getState().setVibePlaybackActive(true);

      recordHistory(activeTrack);
      audioEngine.loadAndPlay(getPlayableUrl(activeTrack), activeTrack.duration, activeTrack.audioUrl);
    },

    /**
     * Play/Pause toggle
     */
    togglePlay: () => {
      const { playing, currentTrack } = get();
      if (!currentTrack) return;

      if (playing) {
        audioEngine.pause();
        set({ playing: false });
      } else {
        audioEngine.play();
        set({ playing: true });
      }
    },

    play: () => {
      audioEngine.play();
      set({ playing: true });
    },

    pause: () => {
      audioEngine.pause();
      set({ playing: false });
    },

    /**
     * Skip to next track in queue
     */
    next: () => {
      const { queue, queueIndex, repeat, shuffle, originalQueue, playbackContext } = get();
      if (!queue.length) return;

      if (queueIndex < queue.length - 1) {
        const nextIdx = queueIndex + 1;
        const nextTrack = queue[nextIdx];
        set({
          queueIndex: nextIdx,
          currentTrack: nextTrack,
          progress: 0,
          currentTime: 0,
          playing: true,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().syncTrackChange(nextTrack, nextIdx);
        }
        recordHistory(nextTrack);
        audioEngine.loadAndPlay(getPlayableUrl(nextTrack), nextTrack.duration, nextTrack.audioUrl);
      } else if (repeat === 'queue' || repeat === 'vibe') {
        // Wrap back to beginning
        if (shuffle) {
          const reshuffled = shuffleTracks(originalQueue);
          const firstTrack = reshuffled[0];
          set({
            queue: reshuffled,
            queueIndex: 0,
            currentTrack: firstTrack,
            progress: 0,
            currentTime: 0,
            playing: true,
          });
          if (playbackContext?.type === 'vibe') {
            useVibeStore.getState().syncTrackChange(firstTrack, 0);
          }
          recordHistory(firstTrack);
          audioEngine.loadAndPlay(getPlayableUrl(firstTrack), firstTrack.duration, firstTrack.audioUrl);
        } else {
          const firstTrack = queue[0];
          set({
            queueIndex: 0,
            currentTrack: firstTrack,
            progress: 0,
            currentTime: 0,
            playing: true,
          });
          if (playbackContext?.type === 'vibe') {
            useVibeStore.getState().syncTrackChange(firstTrack, 0);
          }
          recordHistory(firstTrack);
          audioEngine.loadAndPlay(getPlayableUrl(firstTrack), firstTrack.duration, firstTrack.audioUrl);
        }
      } else {
        // Stop at end
        set({ playing: false, progress: 0, currentTime: 0 });
        audioEngine.pause();
        audioEngine.seek(0);
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().setVibePlaybackActive(false);
        }
      }
    },

    /**
     * Go to previous track or restart current track
     * (Plays previous track if currentTime <= 3s, else restarts current track at 0:00)
     */
    previous: () => {
      const { queue, queueIndex, currentTime, repeat, playbackContext } = get();
      if (!queue.length) return;

      // If played > 3 seconds, restart current track
      if (currentTime > 3) {
        audioEngine.seek(0);
        set({ currentTime: 0, progress: 0 });
        return;
      }

      if (queueIndex > 0) {
        const prevIdx = queueIndex - 1;
        const prevTrack = queue[prevIdx];
        set({
          queueIndex: prevIdx,
          currentTrack: prevTrack,
          progress: 0,
          currentTime: 0,
          playing: true,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().syncTrackChange(prevTrack, prevIdx);
        }
        recordHistory(prevTrack);
        audioEngine.loadAndPlay(getPlayableUrl(prevTrack), prevTrack.duration, prevTrack.audioUrl);
      } else if (repeat === 'queue' || repeat === 'vibe') {
        const lastIdx = queue.length - 1;
        const lastTrack = queue[lastIdx];
        set({
          queueIndex: lastIdx,
          currentTrack: lastTrack,
          progress: 0,
          currentTime: 0,
          playing: true,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.getState().syncTrackChange(lastTrack, lastIdx);
        }
        recordHistory(lastTrack);
        audioEngine.loadAndPlay(getPlayableUrl(lastTrack), lastTrack.duration, lastTrack.audioUrl);
      } else {
        audioEngine.seek(0);
        set({ currentTime: 0, progress: 0 });
      }
    },

    /**
     * Seek to percentage (0.0 to 1.0)
     */
    seek: (progress) => {
      const clamped = Math.max(0, Math.min(1, progress));
      const dur = get().duration || 200;
      const targetTime = clamped * dur;

      set({ progress: clamped, currentTime: targetTime });
      audioEngine.seek(targetTime);
    },

    /**
     * Set master volume (0.0 to 1.0)
     */
    setVolume: (volume) => {
      const clamped = Math.max(0, Math.min(1, volume));
      audioEngine.setVolume(clamped);
      set({ volume: clamped, muted: clamped === 0 });
    },

    /**
     * Toggle mute
     */
    toggleMute: () => {
      const isMuted = audioEngine.toggleMute();
      set({ muted: isMuted });
    },

    /**
     * Toggle Shuffle state
     * Reorders queue non-destructively, maintaining current track at index 0
     */
    toggleShuffle: () => {
      const { shuffle, currentTrack, originalQueue, playbackContext } = get();
      const nextShuffle = !shuffle;

      if (nextShuffle) {
        // Enable shuffle: keep current track at index 0, randomize rest
        const newQueue = shuffleTracks(originalQueue, currentTrack);
        set({
          shuffle: true,
          queue: newQueue,
          queueIndex: 0,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.setState({ vibeShuffle: true });
        }
      } else {
        // Disable shuffle: restore original order, point index to current track
        const restored = [...originalQueue];
        const idx = restored.findIndex((t) => t.id === currentTrack?.id);
        set({
          shuffle: false,
          queue: restored,
          queueIndex: idx !== -1 ? idx : 0,
        });
        if (playbackContext?.type === 'vibe') {
          useVibeStore.setState({ vibeShuffle: false });
        }
      }
    },

    /**
     * Set explicit repeat mode: 'off' | 'queue' | 'vibe' | 'track'
     */
    setRepeatMode: (mode) => {
      const { playbackContext } = get();
      set({ repeat: mode });
      if (playbackContext?.type === 'vibe') {
        useVibeStore.setState({ vibeRepeatMode: mode === 'queue' ? 'vibe' : mode });
      }
    },

    /**
     * Cycle Repeat mode: 'queue'/'vibe' -> 'track' -> 'off'
     */
    toggleRepeat: () => {
      const { repeat, playbackContext } = get();
      const isVibe = playbackContext?.type === 'vibe';
      const modes = isVibe ? ['vibe', 'track', 'off'] : ['queue', 'track', 'off'];
      const normalizedCurrent = isVibe && repeat === 'queue' ? 'vibe' : (!isVibe && repeat === 'vibe' ? 'queue' : repeat);
      const nextIdx = (modes.indexOf(normalizedCurrent) + 1) % modes.length;
      const nextMode = modes[nextIdx];
      set({ repeat: nextMode });
      if (isVibe) {
        useVibeStore.setState({ vibeRepeatMode: nextMode });
      }
    },

    /**
     * Replace the current playback queue
     */
    setQueue: (newQueue, startIndex = 0) => {
      if (!newQueue.length) return;
      const track = newQueue[startIndex] || newQueue[0];
      set({
        queue: newQueue,
        originalQueue: [...newQueue],
        queueIndex: startIndex,
        currentTrack: track,
        progress: 0,
        currentTime: 0,
        duration: track.duration || 200,
      });
      recordHistory(track);
      audioEngine.loadAndPlay(getPlayableUrl(track), track.duration, track.audioUrl);
    },

    /**
     * Append a track to the current queue
     */
    addToQueue: (track) => {
      if (!track || !track.id) return;
      const { queue, originalQueue } = get();
      if (queue.some((t) => t.id === track.id)) return;
      set({
        queue: [...queue, track],
        originalQueue: [...originalQueue, track],
      });
    },

    clearQueue: () => {
      set({ queue: [], originalQueue: [], queueIndex: 0 });
    },

    /**
     * Section 17: Like System with Cloud Sync
     */
    toggleLike: async (trackId) => {
      if (!trackId) return;
      const currentLiked = get().likedTrackIds || [];
      const isAlreadyLiked = currentLiked.includes(trackId);
      const updated = isAlreadyLiked
        ? currentLiked.filter((id) => id !== trackId)
        : [...currentLiked, trackId];

      set({ likedTrackIds: updated });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mimicu_liked_tracks', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not persist liked tracks:', e);
        }
      }

      // Backend sync
      try {
        if (isAlreadyLiked) {
          await unlikeTrackApi(trackId);
        } else {
          await likeTrackApi(trackId);
        }
      } catch (_) {}
    },

    isLiked: (trackId) => {
      return (get().likedTrackIds || []).includes(trackId);
    },

    hydrateFromBackend: (library) => {
      if (!library) return;
      const updates = {};
      if (Array.isArray(library.likedTrackIds)) {
        updates.likedTrackIds = library.likedTrackIds;
      }
      if (Array.isArray(library.recentlyPlayed) && library.recentlyPlayed.length > 0) {
        const resolved = library.recentlyPlayed
          .map((item) => {
            const id = typeof item === 'string' ? item : item.trackId;
            return TRACKS.find((t) => t.id === id);
          })
          .filter(Boolean);
        if (resolved.length > 0) {
          updates.history = resolved;
        }
      }
      set(updates);
    },

    resetToGuest: () => {
      let guestLikes = [];
      let guestHistory = [];
      if (typeof window !== 'undefined') {
        try {
          const l = localStorage.getItem('mimicu_liked_tracks');
          if (l) guestLikes = JSON.parse(l);
        } catch (_) {}
        try {
          const h = localStorage.getItem('mimicu_recently_played');
          if (h) guestHistory = JSON.parse(h);
        } catch (_) {}
      }
      set({ likedTrackIds: guestLikes, history: guestHistory });
    },

    openFullPlayer: () => set({ isFullPlayerOpen: true }),
    closeFullPlayer: () => set({ isFullPlayerOpen: false }),
  };
});
