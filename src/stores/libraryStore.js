import { create } from 'zustand';
import { TRACKS } from '../data/tracks';
import {
  saveVibeApi,
  unsaveVibeApi,
  createUserPlaylistApi,
  updateUserPlaylistApi,
  deleteUserPlaylistApi,
  addTrackToUserPlaylistApi,
  removeTrackFromUserPlaylistApi,
  reorderUserPlaylistTracksApi,
} from '../services/api/index.js';

const STORAGE_PLAYLISTS = 'mimicu_user_playlists';
const STORAGE_SAVED_VIBES = 'mimicu_saved_vibes';
const STORAGE_RECENT_SEARCHES = 'mimicu_recent_searches';

// Default starter playlists for immediate rich experience if empty
const DEFAULT_STARTER_PLAYLISTS = [
  {
    id: 'playlist-midnight-chill',
    name: 'Midnight Chill Frequencies',
    description: 'Deep nocturnal focus, gentle rainscapes, and relaxing solitary beats.',
    coverArt: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #38bdf8 100%)',
    trackIds: ['track-3am-1', 'track-3am-2', 'track-nightdrive-1', 'track-rain-1'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'playlist-cyber-coding',
    name: 'Late Night Cyber Terminal',
    description: 'Brisk electronic pulses and synthesizer rhythms for deep flow states.',
    coverArt: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #10b981 100%)',
    trackIds: ['track-coding-1', 'track-coding-2', 'track-cyber-1', 'track-highway-1'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

// Helper to safely read from localStorage
function readFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[LibraryStore] Error reading ${key}:`, e);
    return fallback;
  }
}

// Helper to safely write to localStorage
function writeToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[LibraryStore] Error writing ${key}:`, e);
  }
}

export const useLibraryStore = create((set, get) => {
  const initialPlaylists = readFromStorage(STORAGE_PLAYLISTS, DEFAULT_STARTER_PLAYLISTS);
  const initialSavedVibes = readFromStorage(STORAGE_SAVED_VIBES, ['3-am-night-walk', 'coding-late-night', 'rainy-window-reading']);
  const initialRecentSearches = readFromStorage(STORAGE_RECENT_SEARCHES, ['Night Walk', 'Lo-Fi', 'Aarav Sen']);

  return {
    playlists: initialPlaylists,
    savedVibeIds: initialSavedVibes,
    recentSearches: initialRecentSearches,
    activePlaylistId: null,

    setActivePlaylistId: (id) => set({ activePlaylistId: id }),

    // ──────────────────────────────────────────────
    // Backend Hydration & Reset
    // ──────────────────────────────────────────────
    hydrateFromBackend: (library) => {
      if (!library) return;
      const updates = {};
      if (Array.isArray(library.savedVibeIds)) {
        updates.savedVibeIds = library.savedVibeIds;
      }
      if (Array.isArray(library.playlists) && library.playlists.length > 0) {
        updates.playlists = library.playlists.map((pl) => ({
          ...pl,
          coverArt: pl.cover || pl.coverArt,
        }));
      }
      set(updates);
    },

    resetToGuest: () => {
      const playlists = readFromStorage(STORAGE_PLAYLISTS, DEFAULT_STARTER_PLAYLISTS);
      const savedVibes = readFromStorage(STORAGE_SAVED_VIBES, ['3-am-night-walk', 'coding-late-night', 'rainy-window-reading']);
      set({ playlists, savedVibeIds: savedVibes });
    },

    // ──────────────────────────────────────────────
    // Playlists CRUD
    // ──────────────────────────────────────────────

    /**
     * Create a new playlist
     * @param {string} name
     * @param {string} description
     * @param {string[]} initialTrackIds
     * @returns {string} newly created playlist id
     */
    createPlaylist: async (name, description = '', initialTrackIds = []) => {
      const id = `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const gradients = [
        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #9333ea 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)',
      ];
      const randomCover = gradients[Math.floor(Math.random() * gradients.length)];

      const newPlaylist = {
        id,
        name: name.trim() || 'Untitled Playlist',
        description: description.trim() || 'A personal collection of ambient tracks.',
        coverArt: randomCover,
        trackIds: initialTrackIds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updated = [newPlaylist, ...get().playlists];
      set({ playlists: updated, activePlaylistId: id });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      // Async backend sync if authenticated
      try {
        await createUserPlaylistApi({
          name: newPlaylist.name,
          description: newPlaylist.description,
          cover: newPlaylist.coverArt,
          trackIds: newPlaylist.trackIds,
        });
      } catch (_) {}

      return id;
    },

    /**
     * Rename or update playlist metadata
     */
    renamePlaylist: async (id, name, description) => {
      const updated = get().playlists.map((pl) => {
        if (pl.id !== id) return pl;
        return {
          ...pl,
          name: name.trim() || pl.name,
          description: description !== undefined ? description.trim() : pl.description,
          updatedAt: Date.now(),
        };
      });
      set({ playlists: updated });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      try {
        await updateUserPlaylistApi(id, { name, description });
      } catch (_) {}
    },

    /**
     * Delete playlist
     */
    deletePlaylist: async (id) => {
      const updated = get().playlists.filter((pl) => pl.id !== id);
      const activeId = get().activePlaylistId === id ? null : get().activePlaylistId;
      set({ playlists: updated, activePlaylistId: activeId });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      try {
        await deleteUserPlaylistApi(id);
      } catch (_) {}
    },

    /**
     * Add track to playlist (prevents duplicates)
     */
    addTrackToPlaylist: async (playlistId, trackId) => {
      if (!trackId) return;
      const updated = get().playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.trackIds.includes(trackId)) return pl;
        return {
          ...pl,
          trackIds: [...pl.trackIds, trackId],
          updatedAt: Date.now(),
        };
      });
      set({ playlists: updated });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      try {
        await addTrackToUserPlaylistApi(playlistId, trackId);
      } catch (_) {}
    },

    /**
     * Remove track from playlist
     */
    removeTrackFromPlaylist: async (playlistId, trackId) => {
      const updated = get().playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          trackIds: pl.trackIds.filter((tid) => tid !== trackId),
          updatedAt: Date.now(),
        };
      });
      set({ playlists: updated });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      try {
        await removeTrackFromUserPlaylistApi(playlistId, trackId);
      } catch (_) {}
    },

    /**
     * Move track up or down inside playlist
     */
    reorderPlaylistTracks: async (playlistId, fromIndex, toIndex) => {
      const updated = get().playlists.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const newTrackIds = [...pl.trackIds];
        if (fromIndex < 0 || fromIndex >= newTrackIds.length || toIndex < 0 || toIndex >= newTrackIds.length) {
          return pl;
        }
        const [moved] = newTrackIds.splice(fromIndex, 1);
        newTrackIds.splice(toIndex, 0, moved);
        return {
          ...pl,
          trackIds: newTrackIds,
          updatedAt: Date.now(),
        };
      });
      set({ playlists: updated });
      writeToStorage(STORAGE_PLAYLISTS, updated);

      try {
        await reorderUserPlaylistTracksApi(playlistId, fromIndex, toIndex);
      } catch (_) {}
    },

    /**
     * Resolve playlist tracks against canonical catalog, skipping missing songs
     */
    getTracksForPlaylist: (playlistId) => {
      const playlist = get().playlists.find((pl) => pl.id === playlistId);
      if (!playlist || !playlist.trackIds) return [];
      return playlist.trackIds
        .map((tid) => TRACKS.find((t) => t.id === tid))
        .filter(Boolean);
    },

    // ──────────────────────────────────────────────
    // Saved Vibes (out of 15 canonical vibes)
    // ──────────────────────────────────────────────

    toggleSaveVibe: async (vibeId) => {
      if (!vibeId) return;
      const current = get().savedVibeIds;
      const isSaved = current.includes(vibeId);
      const updated = isSaved ? current.filter((id) => id !== vibeId) : [...current, vibeId];
      set({ savedVibeIds: updated });
      writeToStorage(STORAGE_SAVED_VIBES, updated);

      try {
        if (isSaved) {
          await unsaveVibeApi(vibeId);
        } else {
          await saveVibeApi(vibeId);
        }
      } catch (_) {}
    },

    isVibeSaved: (vibeId) => {
      return get().savedVibeIds.includes(vibeId);
    },

    // ──────────────────────────────────────────────
    // Recent Searches
    // ──────────────────────────────────────────────

    addRecentSearch: (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const current = get().recentSearches;
      const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      set({ recentSearches: updated });
      writeToStorage(STORAGE_RECENT_SEARCHES, updated);
    },

    removeRecentSearch: (query) => {
      const updated = get().recentSearches.filter((q) => q !== query);
      set({ recentSearches: updated });
      writeToStorage(STORAGE_RECENT_SEARCHES, updated);
    },

    clearRecentSearches: () => {
      set({ recentSearches: [] });
      writeToStorage(STORAGE_RECENT_SEARCHES, []);
    },
  };
});
