import { create } from 'zustand';
import { THEMES, DEFAULT_THEME_ID } from '../config/themes.js';

const STORAGE_KEY = 'mimicu_theme_id';

// Map legacy theme IDs from previous versions to new core theme IDs
const LEGACY_ID_MAP = {
  'dark': 'glass-dark',
  'dracula': 'glass-dark',
  'amoled': 'solid-black',
  'tokyo-night': 'glass-night',
  'nord-dark': 'frost-dark',
  'gruvbox-dark': 'solid-amber',
  'one-dark': 'glass-smoke',
  'solarized-dark': 'solid-forest',
  'light': 'glass-light',
  'github-light': 'solid-white',
  'nord-light': 'frost-light',
  'catppuccin-latte': 'solid-cream',
  'gruvbox-light': 'solid-sand',
  'rose-pine-dawn': 'solid-rose',
  'solarized-light': 'solid-ivory',
  'tokyo-day': 'frost-light',
  'paper': 'solid-ivory',
  'solid-dark': 'solid-black',
  'solid-light': 'solid-white',
};

/**
 * Applies all canonical design tokens and backward-compatible variables to :root
 */
function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const t = theme.tokens;

  // Theme mode / style classes
  if (theme.mode === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  // Data attributes for custom CSS targeting
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-type', theme.type);
  root.setAttribute('data-theme-style', theme.type);
  root.setAttribute('data-theme-mode', theme.mode);

  // ── Backgrounds & Surfaces ─────────────────────────────────────
  root.style.setProperty('--theme-background', t.background);
  root.style.setProperty('--theme-bg', t.background);
  root.style.setProperty('--theme-background-secondary', t.backgroundSecondary);
  root.style.setProperty('--theme-bg-elevated', t.backgroundElevated || t.backgroundSecondary);
  root.style.setProperty('--theme-surface', t.surface);
  root.style.setProperty('--theme-surface-secondary', t.surfaceSecondary || t.surfaceElevated);
  root.style.setProperty('--theme-surface-elevated', t.surfaceElevated);
  root.style.setProperty('--theme-surface-hover', t.surfaceHover);
  root.style.setProperty('--theme-card', t.card || t.surface);
  root.style.setProperty('--theme-card-hover', t.cardHover || t.surfaceHover);

  // ── Glass Layers ───────────────────────────────────────────────
  root.style.setProperty('--theme-glass', t.glass);
  root.style.setProperty('--theme-glass-strong', t.glassStrong);
  root.style.setProperty('--theme-glass-border', t.glassBorder);
  root.style.setProperty('--theme-glass-blur', t.glassBlur);
  root.style.setProperty('--theme-glass-opacity', t.glassOpacity);

  // ── Borders ────────────────────────────────────────────────────
  root.style.setProperty('--theme-border', t.border);
  root.style.setProperty('--theme-border-strong', t.borderStrong);
  root.style.setProperty('--theme-border-hover', t.borderStrong);

  // ── Typography ─────────────────────────────────────────────────
  root.style.setProperty('--theme-text', t.textPrimary);
  root.style.setProperty('--theme-text-primary', t.textPrimary);
  root.style.setProperty('--theme-text-secondary', t.textSecondary);
  root.style.setProperty('--theme-text-muted', t.textMuted);

  // ── Icons ──────────────────────────────────────────────────────
  root.style.setProperty('--theme-icon-primary', t.iconPrimary);
  root.style.setProperty('--theme-icon-secondary', t.iconSecondary);

  // ── Buttons ────────────────────────────────────────────────────
  root.style.setProperty('--theme-button-primary', t.buttonPrimary);
  root.style.setProperty('--theme-btn-primary', t.buttonPrimary);
  root.style.setProperty('--theme-button-primary-text', t.buttonPrimaryText);
  root.style.setProperty('--theme-btn-primary-text', t.buttonPrimaryText);
  root.style.setProperty('--theme-button-primary-hover', t.buttonPrimaryHover);
  root.style.setProperty('--theme-btn-primary-hover', t.buttonPrimaryHover);

  root.style.setProperty('--theme-button-secondary', t.buttonSecondary);
  root.style.setProperty('--theme-btn-secondary', t.buttonSecondary);
  root.style.setProperty('--theme-button-secondary-text', t.buttonSecondaryText);
  root.style.setProperty('--theme-btn-secondary-text', t.buttonSecondaryText);
  root.style.setProperty('--theme-button-secondary-hover', t.buttonSecondaryHover);
  root.style.setProperty('--theme-btn-secondary-hover', t.buttonSecondaryHover);

  root.style.setProperty('--theme-btn-ghost', t.buttonGhost);
  root.style.setProperty('--theme-btn-ghost-text', t.buttonGhostText);
  root.style.setProperty('--theme-btn-ghost-hover', t.buttonGhostHover);

  // ── Inputs ─────────────────────────────────────────────────────
  root.style.setProperty('--theme-input', t.input);
  root.style.setProperty('--theme-input-text', t.inputText);
  root.style.setProperty('--theme-input-placeholder', t.inputPlaceholder);
  root.style.setProperty('--theme-input-border', t.inputBorder);

  // ── Navigation ─────────────────────────────────────────────────
  root.style.setProperty('--theme-navigation', t.navigation);
  root.style.setProperty('--theme-dock-bg', t.navigation);
  root.style.setProperty('--theme-navigation-text', t.navigationText);
  root.style.setProperty('--theme-nav-text', t.navigationText);
  root.style.setProperty('--theme-navigation-active', t.navigationActive);
  root.style.setProperty('--theme-nav-active', t.navigationActive);
  root.style.setProperty('--theme-navigation-inactive', t.navigationInactive);
  root.style.setProperty('--theme-nav-inactive', t.navigationInactive);

  // ── Player ─────────────────────────────────────────────────────
  root.style.setProperty('--theme-player-background', t.playerBackground);
  root.style.setProperty('--theme-player-bg', t.playerBackground);
  root.style.setProperty('--theme-player-border', t.playerBorder);
  root.style.setProperty('--theme-player-text', t.playerText);

  // ── Accent & Glow ──────────────────────────────────────────────
  root.style.setProperty('--theme-accent', t.accent);
  root.style.setProperty('--theme-accent-hover', t.accentHover);
  root.style.setProperty('--theme-accent-text', t.accentText);
  root.style.setProperty('--theme-accent-glow', t.accentGlow);
  root.style.setProperty('--theme-glow', t.accentGlow);

  root.style.setProperty('--theme-modal-bg', t.modalBackground);
  root.style.setProperty('--theme-shadow', t.shadow);
  root.style.setProperty('--theme-shadow-strong', t.shadowStrong);
  root.style.setProperty('--theme-focus-ring', t.focusRing);
  root.style.setProperty('--theme-overlay', t.overlay);
  root.style.setProperty('--theme-overlay-bg', t.overlay);
}

/**
 * useThemeStore
 *
 * Manages application UI themes separately from 3D Vibe environments.
 * Persists theme preference to localStorage and injects CSS tokens reactively.
 */
export const useThemeStore = create((set) => {
  let initialTheme = THEMES[DEFAULT_THEME_ID];

  if (typeof window !== 'undefined') {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        if (THEMES[savedId]) {
          initialTheme = THEMES[savedId];
        } else if (LEGACY_ID_MAP[savedId] && THEMES[LEGACY_ID_MAP[savedId]]) {
          initialTheme = THEMES[LEGACY_ID_MAP[savedId]];
        }
      }
    } catch (e) {
      console.warn('[ThemeStore] Could not read saved theme:', e);
    }
  }

  applyThemeToDOM(initialTheme);

  return {
    currentTheme: initialTheme,
    activeTheme: initialTheme, // alias for backwards compatibility
    isThemeModalOpen: false,

    setTheme: (themeId) => {
      let target = THEMES[themeId];
      if (!target && LEGACY_ID_MAP[themeId]) {
        target = THEMES[LEGACY_ID_MAP[themeId]];
      }
      if (!target) {
        console.warn(`[ThemeStore] Unknown theme ID: "${themeId}"`);
        return;
      }

      set({ currentTheme: target, activeTheme: target });
      applyThemeToDOM(target);

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, target.id);
        } catch (e) {
          console.warn('[ThemeStore] Could not save theme:', e);
        }
      }
    },

    openThemeModal: () => set({ isThemeModalOpen: true }),
    closeThemeModal: () => set({ isThemeModalOpen: false }),
    toggleThemeModal: () => set((state) => ({ isThemeModalOpen: !state.isThemeModalOpen })),
  };
});
