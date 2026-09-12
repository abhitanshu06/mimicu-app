import React from 'react';
import { LIGHT_THEMES, DARK_THEMES } from '../../config/themes';
import { useThemeStore } from '../../stores/themeStore';
import { Palette, Check, X, Moon, Sun } from 'lucide-react';

/**
 * ThemeSelector
 *
 * Premium Theme Switcher Modal.
 * - Separate Light / Dark sections
 * - Real themed mini-preview (shows actual bg, surface, accent, and text)
 * - 1-click persistent activation without modifying the active 3D Vibe world
 * - All colors use CSS variable tokens — works in all themes
 */
export default function ThemeSelector() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const isThemeModalOpen = useThemeStore((state) => state.isThemeModalOpen);
  const closeThemeModal = useThemeStore((state) => state.closeThemeModal);
  const setTheme = useThemeStore((state) => state.setTheme);

  if (!isThemeModalOpen) return null;

  const ThemeCard = ({ theme }) => {
    const isSelected = currentTheme.id === theme.id;
    const t = theme.tokens;

    return (
      <div
        onClick={() => setTheme(theme.id)}
        className="group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col gap-3"
        style={{
          backgroundColor: isSelected ? 'var(--theme-surface-elevated)' : 'var(--theme-surface)',
          border: isSelected
            ? `1px solid ${t.accent}`
            : '1px solid var(--theme-border)',
          boxShadow: isSelected
            ? `0 8px 24px 0 var(--theme-shadow), 0 0 16px ${t.accentGlow}`
            : `0 4px 16px 0 var(--theme-shadow)`,
          transform: isSelected ? 'scale(1.02)' : undefined,
        }}
      >
        {/* Theme name & check */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-wide" style={{ color: 'var(--theme-text-primary)' }}>
              {theme.name}
            </span>
            {isSelected && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </span>
            )}
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-muted)',
            }}
          >
            {theme.type === 'light' ? '☀' : '◗'}
          </span>
        </div>

        {/* Real themed mini-preview */}
        <div
          className="w-full rounded-xl p-2.5 flex flex-col gap-1.5 relative overflow-hidden"
          style={{ backgroundColor: t.bg, border: `1px solid ${t.border}` }}
        >
          {/* Mini surface card */}
          <div
            className="rounded-lg px-2 py-1.5 flex items-center justify-between"
            style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
          >
            <span className="text-[9px] font-semibold" style={{ color: t.textPrimary }}>MIMICU</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.accent }} />
          </div>
          {/* Mini button row */}
          <div className="flex gap-1">
            <div
              className="flex-1 rounded-md text-center"
              style={{ backgroundColor: t.buttonPrimary, height: '10px' }}
            />
            <div
              className="flex-1 rounded-md"
              style={{ backgroundColor: t.buttonSecondary, border: `1px solid ${t.border}`, height: '10px' }}
            />
          </div>
          {/* Accent strip */}
          <div
            className="w-full h-[3px] rounded-full"
            style={{ background: `linear-gradient(to right, ${t.accent}, ${t.accentGlow})` }}
          />
        </div>

        {/* Tagline */}
        <p className="text-[10px] font-light line-clamp-1" style={{ color: 'var(--theme-text-muted)' }}>
          {theme.tagline}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      style={{ backgroundColor: 'var(--theme-overlay)' }}
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={closeThemeModal} aria-hidden="true" />

      {/* Modal Dialog Window */}
      <div
        className="relative w-full max-w-4xl max-h-[88vh] rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden z-10 transition-all"
        style={{
          backgroundColor: 'var(--theme-bg-elevated)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-text-primary)',
          boxShadow: '0 24px 64px -8px var(--theme-shadow-strong)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-5 mb-6"
          style={{ borderBottom: '1px solid var(--theme-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
            >
              <Palette className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Application Themes
              </h2>
              <p className="text-xs sm:text-sm font-light" style={{ color: 'var(--theme-text-muted)' }}>
                UI styling only — never interrupts the active 3D atmosphere world.
              </p>
            </div>
          </div>

          <button
            onClick={closeThemeModal}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-secondary)',
            }}
            aria-label="Close Theme Selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Theme Content */}
        <div className="flex-1 overflow-y-auto pr-1">

          {/* ── LIGHT THEMES ─── */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-secondary)' }}>
                Light Themes
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--theme-btn-secondary)', color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' }}
              >
                {LIGHT_THEMES.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {LIGHT_THEMES.map((theme) => <ThemeCard key={theme.id} theme={theme} />)}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ borderTop: '1px solid var(--theme-border)' }} />

          {/* ── DARK THEMES ─── */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
              <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-secondary)' }}>
                Dark Themes
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--theme-btn-secondary)', color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border)' }}
              >
                {DARK_THEMES.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {DARK_THEMES.map((theme) => <ThemeCard key={theme.id} theme={theme} />)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-4 mt-4 flex items-center justify-between text-xs font-light"
          style={{ borderTop: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}
        >
          <span>Active: <strong style={{ color: 'var(--theme-text-primary)' }}>{currentTheme.name}</strong> — persists automatically across navigation.</span>
          <button
            onClick={closeThemeModal}
            className="px-4 py-1.5 rounded-xl font-medium transition-all"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
