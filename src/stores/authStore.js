import { create } from 'zustand';
import {
  loginApi,
  registerApi,
  logoutApi,
  fetchCurrentUserApi,
  updateProfileApi,
  syncLibraryApi,
  fetchLibraryApi,
} from '../services/api/index.js';
import { useLibraryStore } from './libraryStore.js';
import { useAudioStore } from './audioStore.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authChecked: false,
  isAuthModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  error: null,

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authModalMode: mode, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  setAuthModalMode: (mode) => {
    set({ authModalMode: mode, error: null });
  },

  /**
   * Application Startup Auth Check
   * Proactively verifies current session cookie without UI flicker
   */
  initAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetchCurrentUserApi();
      if (res && res.success && res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          authChecked: true,
          isLoading: false,
        });

        // Hydrate library from server
        try {
          const library = await fetchLibraryApi();
          if (library) {
            useLibraryStore.getState().hydrateFromBackend(library);
            useAudioStore.getState().hydrateFromBackend(library);
          }
        } catch (libErr) {
          console.warn('[AuthStore] Failed hydrating user library on boot:', libErr.message);
        }

        return;
      }
    } catch (_) {
      // Unauthenticated guest session
    }

    set({
      user: null,
      isAuthenticated: false,
      authChecked: true,
      isLoading: false,
    });
  },

  /**
   * Log in user and migrate local guest data
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(email, password);
      if (res && res.success && res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });

        // Perform safe guest state migration
        await get().migrateGuestData(res.user.id);
        return res.user;
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: errorMsg });
      throw err;
    }
  },

  /**
   * Register user and migrate local guest data
   */
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await registerApi(name, email, password);
      if (res && res.success && res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isAuthModalOpen: false,
          isLoading: false,
          error: null,
        });

        // Perform safe guest state migration
        await get().migrateGuestData(res.user.id);
        return res.user;
      }
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMsg });
      throw err;
    }
  },

  /**
   * Log out user, reset server-bound state, preserve audio playback
   */
  logout: async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('[AuthStore] Logout network notice:', err.message);
    }

    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });

    // Reset stores to default local state without disrupting playback
    useLibraryStore.getState().resetToGuest();
    useAudioStore.getState().resetToGuest();
  },

  /**
   * Update profile (name, avatar)
   */
  updateProfile: async (data) => {
    try {
      const res = await updateProfileApi(data);
      if (res && res.success && res.user) {
        set({ user: res.user });
        return res.user;
      }
    } catch (err) {
      console.error('[AuthStore] Profile update failed:', err);
      throw err;
    }
  },

  /**
   * Safely merges guest localStorage into user account
   */
  migrateGuestData: async (userId) => {
    try {
      let localLikes = [];
      let localHistory = [];
      let localVibes = [];
      let localPlaylists = [];

      if (typeof window !== 'undefined') {
        try {
          const l = localStorage.getItem('mimicu_liked_tracks');
          if (l) localLikes = JSON.parse(l);
        } catch (_) {}
        try {
          const h = localStorage.getItem('mimicu_recently_played');
          if (h) localHistory = JSON.parse(h);
        } catch (_) {}
        try {
          const v = localStorage.getItem('mimicu_saved_vibes');
          if (v) localVibes = JSON.parse(v);
        } catch (_) {}
        try {
          const p = localStorage.getItem('mimicu_user_playlists');
          if (p) localPlaylists = JSON.parse(p);
        } catch (_) {}
      }

      const merged = await syncLibraryApi({
        likedTrackIds: localLikes,
        savedVibeIds: localVibes,
        recentlyPlayed: localHistory,
        playlists: localPlaylists,
      });

      if (merged) {
        useLibraryStore.getState().hydrateFromBackend(merged);
        useAudioStore.getState().hydrateFromBackend(merged);
      }
    } catch (err) {
      console.warn('[AuthStore] Notice during guest data migration:', err.message);
    }
  },
}));
