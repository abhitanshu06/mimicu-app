import { create } from 'zustand';
import { THEMES, DEFAULT_THEME_ID } from '../config/themes.js';

const STORAGE_KEY = 'mimicu_theme_id';

/**
 * Applies all 34 theme tokens as CSS custom properties on :root
 */
function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const t = theme.tokens;

  // Theme type class for any remaining utility-class targeting
  if (theme.type === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  // data-theme attribute for CSS selectors
  root.setAttribute('data-theme', theme.id);

  // ── Backgrounds & Surfaces ─────────────────────────────────────
  root.style.setProperty('--theme-bg', t.bg);
  root.style.setProperty('--theme-bg-elevated', t.bgElevated);
  root.style.setProperty('--theme-surface', t.surface);
  root.style.setProperty('--theme-surface-elevated', t.surfaceElevated);

  // ── Glass Layers ───────────────────────────────────────────────
  root.style.setProperty('--theme-glass', t.glass);
  root.style.setProperty('--theme-glass-strong', t.glassStrong);
  root.style.setProperty('--theme-dock-bg', t.dockBg);
  root.style.setProperty('--theme-glass-blur', t.glassBlur);

  // ── Borders ────────────────────────────────────────────────────
  root.style.setProperty('--theme-border', t.border);
  root.style.setProperty('--theme-border-hover', t.borderHover);

  // ── Typography ─────────────────────────────────────────────────
  root.style.setProperty('--theme-text', t.textPrimary);
  root.style.setProperty('--theme-text-primary', t.textPrimary);
  root.style.setProperty('--theme-text-secondary', t.textSecondary);
  root.style.setProperty('--theme-text-muted', t.textMuted);

  // ── Buttons ────────────────────────────────────────────────────
  root.style.setProperty('--theme-btn-primary', t.buttonPrimary);
  root.style.setProperty('--theme-btn-primary-text', t.buttonPrimaryText);
  root.style.setProperty('--theme-btn-primary-hover', t.buttonPrimaryHover);
  root.style.setProperty('--theme-btn-secondary', t.buttonSecondary);
  root.style.setProperty('--theme-btn-secondary-text', t.buttonSecondaryText);
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
  root.style.setProperty('--theme-nav-text', t.navText);
  root.style.setProperty('--theme-nav-active', t.navActive);
  root.style.setProperty('--theme-nav-inactive', t.navInactive);

  // ── Accent & Glow ──────────────────────────────────────────────
  root.style.setProperty('--theme-accent', t.accent);
  root.style.setProperty('--theme-accent-hover', t.accentHover);
  root.style.setProperty('--theme-accent-text', t.accentText);
  root.style.setProperty('--theme-glow', t.accentGlow);

  // ── Shadows & Overlay ──────────────────────────────────────────
  root.style.setProperty('--theme-shadow', t.shadow);
  root.style.setProperty('--theme-shadow-strong', t.shadowStrong);
  root.style.setProperty('--theme-overlay', t.overlay);
}

/**
 * useThemeStore
 *
 * Manages the application UI theme separately from the 3D Vibe environment.
 * Persists user preference to localStorage and injects CSS tokens reactively.
 */
export const useThemeStore = create((set) => {
  let initialTheme = THEMES[DEFAULT_THEME_ID];
  if (typeof window !== 'undefined') {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId && THEMES[savedId]) {
        initialTheme = THEMES[savedId];
      }
    } catch (e) {
      console.warn('[ThemeStore] Could not read saved theme:', e);
    }
  }

  applyThemeToDOM(initialTheme);

  return {
    currentTheme: initialTheme,
    isThemeModalOpen: false,

    setTheme: (themeId) => {
      const target = THEMES[themeId];
      if (!target) {
        console.warn(`[ThemeStore] Unknown theme ID: "${themeId}"`);
        return;
      }
      set({ currentTheme: target });
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
