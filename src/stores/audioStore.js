import { create } from 'zustand';
import { audioEngine } from '../utils/audioEngine.js';
import { TRACKS, getTracksForVibe } from '../data/tracks.js';
import { VIBES } from '../config/vibes.js';

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
    const { repeat, queue, queueIndex, shuffle, originalQueue } = get();

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
    } else if (repeat === 'queue') {
      // Reached end of queue with Repeat Queue ON
      if (shuffle) {
        const reshuffled = shuffleTracks(originalQueue);
        set({ queue: reshuffled, queueIndex: 0 });
        get().playTrack(reshuffled[0]);
      } else {
        set({ queueIndex: 0 });
        get().playTrack(queue[0]);
      }
    } else {
      // End of queue with repeat OFF -> Stop playback
      set({ playing: false, progress: 0, currentTime: 0 });
      audioEngine.pause();
      audioEngine.seek(0);
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

    // Modes: 'off' | 'queue' | 'track'
    shuffle: false,
    repeat: 'queue', // canonical repeat mode: 'off' | 'queue' | 'track'

    // Vibe Context
    currentVibe: VIBES[initialVibeId]?.name || '3 AM Night Walk',
    currentVibeContext: {
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
     * @param {Object|null} vibeContext
     */
    playTrack: (track, customQueue = null, vibeContext = null) => {
      const state = get();
      let activeQueue = customQueue || state.queue;
      let newOriginalQueue = customQueue || state.originalQueue;

      // If track is not currently in queue, prepend it
      if (!activeQueue.some((t) => t.id === track.id)) {
        activeQueue = [track, ...activeQueue];
        newOriginalQueue = [track, ...newOriginalQueue];
      }

      const idx = activeQueue.findIndex((t) => t.id === track.id);
      const newVibeContext = vibeContext || state.currentVibeContext;

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
        currentVibe: newVibeContext?.name || state.currentVibe,
        currentVibeContext: newVibeContext,
      });

      recordHistory(track);
      audioEngine.loadAndPlay(track.audioUrl, track.duration);
    },

    /**
     * Play an entire Vibe's collection from start or with shuffle
     * @param {string} vibeId
     * @param {boolean} shouldShuffle
     */
    playVibe: (vibeId, shouldShuffle = false) => {
      const vibe = VIBES[vibeId];
      if (!vibe) return;

      const vibeTracks = getTracksForVibe(vibeId);
      if (!vibeTracks.length) return;

      const queue = shouldShuffle ? shuffleTracks(vibeTracks) : [...vibeTracks];
      const startTrack = queue[0];

      const vibeContext = {
        id: vibeId,
        name: vibe.name,
        emoji: vibe.emoji,
        page: `/vibes/${vibeId}`,
      };

      set({
        currentTrack: startTrack,
        queue,
        originalQueue: [...vibeTracks],
        queueIndex: 0,
        shuffle: shouldShuffle,
        playing: true,
        progress: 0,
        currentTime: 0,
        duration: startTrack.duration || 200,
        error: null,
        currentVibe: vibe.name,
        currentVibeContext: vibeContext,
      });

      recordHistory(startTrack);
      audioEngine.loadAndPlay(startTrack.audioUrl, startTrack.duration);
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
      const { queue, queueIndex, repeat, shuffle, originalQueue } = get();
      if (!queue.length) return;

      if (queueIndex < queue.length - 1) {
        const nextIdx = queueIndex + 1;
        const nextTrack = queue[nextIdx];
        set({ queueIndex: nextIdx, currentTrack: nextTrack, progress: 0, currentTime: 0, playing: true });
        recordHistory(nextTrack);
        audioEngine.loadAndPlay(nextTrack.audioUrl, nextTrack.duration);
      } else if (repeat === 'queue') {
        // Wrap back to beginning
        if (shuffle) {
          const reshuffled = shuffleTracks(originalQueue);
          const firstTrack = reshuffled[0];
          set({ queue: reshuffled, queueIndex: 0, currentTrack: firstTrack, progress: 0, currentTime: 0, playing: true });
          recordHistory(firstTrack);
          audioEngine.loadAndPlay(firstTrack.audioUrl, firstTrack.duration);
        } else {
          const firstTrack = queue[0];
          set({ queueIndex: 0, currentTrack: firstTrack, progress: 0, currentTime: 0, playing: true });
          recordHistory(firstTrack);
          audioEngine.loadAndPlay(firstTrack.audioUrl, firstTrack.duration);
        }
      } else {
        // Stop at end
        set({ playing: false, progress: 0, currentTime: 0 });
        audioEngine.pause();
        audioEngine.seek(0);
      }
    },

    /**
     * Go to previous track or restart current track
     */
    previous: () => {
      const { queue, queueIndex, currentTime, repeat } = get();
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
        set({ queueIndex: prevIdx, currentTrack: prevTrack, progress: 0, currentTime: 0, playing: true });
        recordHistory(prevTrack);
        audioEngine.loadAndPlay(prevTrack.audioUrl, prevTrack.duration);
      } else if (repeat === 'queue') {
        const lastIdx = queue.length - 1;
        const lastTrack = queue[lastIdx];
        set({ queueIndex: lastIdx, currentTrack: lastTrack, progress: 0, currentTime: 0, playing: true });
        recordHistory(lastTrack);
        audioEngine.loadAndPlay(lastTrack.audioUrl, lastTrack.duration);
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
      const { shuffle, currentTrack, originalQueue } = get();
      const nextShuffle = !shuffle;

      if (nextShuffle) {
        // Enable shuffle: keep current track at index 0, randomize rest
        const newQueue = shuffleTracks(originalQueue, currentTrack);
        set({
          shuffle: true,
          queue: newQueue,
          queueIndex: 0,
        });
      } else {
        // Disable shuffle: restore original order, point index to current track
        const restored = [...originalQueue];
        const idx = restored.findIndex((t) => t.id === currentTrack?.id);
        set({
          shuffle: false,
          queue: restored,
          queueIndex: idx !== -1 ? idx : 0,
        });
      }
    },

    /**
     * Set explicit repeat mode: 'off' | 'queue' | 'track'
     */
    setRepeatMode: (mode) => {
      set({ repeat: mode });
    },

    /**
     * Cycle Repeat mode: 'queue' -> 'track' -> 'off'
     */
    toggleRepeat: () => {
      const modes = ['queue', 'track', 'off'];
      const current = get().repeat;
      const nextIdx = (modes.indexOf(current) + 1) % modes.length;
      const nextMode = modes[nextIdx];
      set({ repeat: nextMode });
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
      audioEngine.loadAndPlay(track.audioUrl, track.duration);
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
     * Section 17: Local Like System
     */
    toggleLike: (trackId) => {
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
    },

    isLiked: (trackId) => {
      return (get().likedTrackIds || []).includes(trackId);
    },

    openFullPlayer: () => set({ isFullPlayerOpen: true }),
    closeFullPlayer: () => set({ isFullPlayerOpen: false }),
  };
});
