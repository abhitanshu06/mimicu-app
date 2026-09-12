import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GLASS_THEMES, SOLID_THEMES } from '../../config/themes';
import { useThemeStore } from '../../stores/themeStore';
import { X, Check } from 'lucide-react';

/**
 * ThemeCard
 *
 * Ultra-clean visual card containing ONLY:
 * 1. Large real-aesthetic preview demonstrating actual Glass vs. Solid behavior
 * 2. Theme name
 * 3. Minimal selected state (subtle outline + small check indicator)
 *
 * Strictly no descriptions, badges, counts, or extraneous metadata.
 */
function ThemeCard({ theme, isSelected, onSelect }) {
  const t = theme.tokens;
  const isGlass = theme.type === 'glass';

  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className="group relative rounded-2xl p-2 sm:p-2.5 transition-all duration-200 cursor-pointer flex flex-col gap-2 text-center w-full select-none"
      style={{
        backgroundColor: isSelected ? 'var(--theme-surface-elevated)' : 'var(--theme-surface)',
        border: isSelected
          ? `2px solid ${t.accent}`
          : '1px solid var(--theme-border)',
        boxShadow: isSelected
          ? `0 8px 24px -4px var(--theme-shadow-strong), 0 0 16px ${t.accentGlow}`
          : '0 2px 8px 0 var(--theme-shadow)',
        transform: isSelected ? 'scale(1.02)' : undefined,
      }}
    >
      {/* 1. Large Visual Preview Window */}
      <div
        className="w-full rounded-xl p-2.5 sm:p-3 flex items-center justify-center relative overflow-hidden border shadow-inner transition-all duration-300"
        style={{
          backgroundColor: t.background,
          borderColor: isGlass ? t.glassBorder : t.border,
          height: '118px',
        }}
      >
        {isGlass ? (
          <>
            {/* Ambient radiant environment shapes visible through glass */}
            <div
              className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-lg pointer-events-none opacity-85 transition-transform group-hover:scale-110 duration-500"
              style={{ backgroundColor: t.accent }}
            />
            <div
              className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full blur-lg pointer-events-none opacity-75 transition-transform group-hover:scale-110 duration-500"
              style={{ backgroundColor: t.accentSecondary || t.accent }}
            />

            {/* Centered Translucent Glass Panel */}
            <div
              className="w-[84%] h-[72%] rounded-xl p-2 flex flex-col justify-between relative z-10 mx-auto my-auto transition-all"
              style={{
                backgroundColor: t.surface,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: `1px solid ${t.glassBorder || t.border}`,
                boxShadow: '0 6px 16px -2px rgba(0,0,0,0.25), inset 0 1px 1px 0 rgba(255,255,255,0.22)',
              }}
            >
              {/* Top: Typography mark & accent indicator */}
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold font-mono tracking-tight"
                  style={{ color: t.textPrimary }}
                >
                  Aa
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: t.accent,
                    boxShadow: `0 0 8px ${t.accentGlow}`,
                  }}
                />
              </div>

              {/* Bottom: Glass accent sheen line */}
              <div className="flex items-center gap-1.5 pt-1.5">
                <div
                  className="h-1.5 flex-1 rounded-full opacity-90"
                  style={{ backgroundColor: t.accent }}
                />
                <div
                  className="h-1.5 w-4 rounded-full opacity-50"
                  style={{ backgroundColor: t.textMuted }}
                />
                <div
                  className="h-1.5 w-3 rounded-full opacity-30"
                  style={{ backgroundColor: t.glassBorder || t.border }}
                />
              </div>
            </div>
          </>
        ) : (
          /* Solid Opaque Surface — completely opaque, flat, no transparency, no blur */
          <div
            className="w-[84%] h-[72%] rounded-xl p-2 flex flex-col justify-between relative z-10 mx-auto my-auto shadow-md"
            style={{
              backgroundColor: t.surface,
              border: `1px solid ${t.border}`,
            }}
          >
            {/* Top: Typography mark & solid accent indicator */}
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold font-mono tracking-tight"
                style={{ color: t.textPrimary }}
              >
                Aa
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: t.accent }}
              />
            </div>

            {/* Bottom: Solid palette swatch bars */}
            <div className="flex items-center gap-1.5 pt-1.5">
              <div
                className="h-1.5 flex-1 rounded-full"
                style={{ backgroundColor: t.accent }}
              />
              <div
                className="h-1.5 w-4 rounded-full opacity-70"
                style={{ backgroundColor: t.textMuted }}
              />
              <div
                className="h-1.5 w-3 rounded-full opacity-40"
                style={{ backgroundColor: t.border }}
              />
            </div>
          </div>
        )}

        {/* Selected Check Indicator */}
        {isSelected && (
          <div
            className="absolute top-2 right-2 z-20 w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
            style={{
              backgroundColor: t.accent,
              color: t.accentText,
            }}
          >
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* 2. Theme Name Only */}
      <span
        className="font-semibold text-xs sm:text-sm tracking-tight truncate px-1"
        style={{ color: 'var(--theme-text-primary)' }}
      >
        {theme.name}
      </span>
    </button>
  );
}

/**
 * ThemeSelector
 *
 * Master Theme Switcher Modal rendered via React Portal at root body level.
 * - Sits strictly at z-[990] (backdrop) and z-[1000] (modal dialog), above MiniPlayer (z-50) and Sidebar (z-40).
 * - Locks underlying body scrolling when active.
 * - Internal scrolling strictly on theme grid container; header remains stable.
 * - Exactly TWO top-level tabs: [ Glass ] and [ Solid ].
 */
export default function ThemeSelector() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const isThemeModalOpen = useThemeStore((state) => state.isThemeModalOpen);
  const closeThemeModal = useThemeStore((state) => state.closeThemeModal);
  const setTheme = useThemeStore((state) => state.setTheme);

  // Default active tab to current theme's type ('glass' | 'solid')
  const [activeTab, setActiveTab] = useState(() => {
    return currentTheme?.type === 'solid' ? 'solid' : 'glass';
  });

  // Keep active tab in sync when modal opens
  useEffect(() => {
    if (isThemeModalOpen && currentTheme?.type) {
      setActiveTab(currentTheme.type);
    }
  }, [isThemeModalOpen, currentTheme?.type]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isThemeModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isThemeModalOpen]);

  const displayedThemes = useMemo(() => {
    return activeTab === 'solid' ? SOLID_THEMES : GLASS_THEMES;
  }, [activeTab]);

  if (!isThemeModalOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[990] flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn"
      style={{
        backgroundColor: 'var(--theme-overlay, rgba(0, 0, 0, 0.70))',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={closeThemeModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        className="relative z-[1000] w-full max-w-4xl max-h-[85vh] rounded-3xl p-5 sm:p-7 flex flex-col shadow-2xl overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--theme-modal-bg, var(--theme-surface-elevated))',
          backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
          border: '1px solid var(--theme-glass-border, var(--theme-border))',
          color: 'var(--theme-text-primary)',
          boxShadow: '0 24px 64px -8px var(--theme-shadow-strong)',
        }}
      >
        {/* Stable Header */}
        <div
          className="shrink-0 flex items-center justify-between pb-3.5 mb-3.5"
          style={{ borderBottom: '1px solid var(--theme-border)' }}
        >
          <h2
            className="text-lg sm:text-xl font-display font-bold tracking-tight"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            Application Themes
          </h2>

          <button
            onClick={closeThemeModal}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

        {/* Strictly Two Category Tabs: [ Glass ]  [ Solid ] */}
        <div className="shrink-0 grid grid-cols-2 gap-2 pb-3.5 mb-3.5 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('glass')}
            className="py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'glass' ? 'var(--theme-btn-primary)' : 'var(--theme-btn-secondary)',
              color: activeTab === 'glass' ? 'var(--theme-btn-primary-text)' : 'var(--theme-text-secondary)',
              border: activeTab === 'glass' ? '1px solid var(--theme-accent)' : '1px solid var(--theme-border)',
              boxShadow: activeTab === 'glass' ? '0 0 14px var(--theme-glow)' : undefined,
            }}
          >
            Glass
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('solid')}
            className="py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'solid' ? 'var(--theme-btn-primary)' : 'var(--theme-btn-secondary)',
              color: activeTab === 'solid' ? 'var(--theme-btn-primary-text)' : 'var(--theme-text-secondary)',
              border: activeTab === 'solid' ? '1px solid var(--theme-accent)' : '1px solid var(--theme-border)',
              boxShadow: activeTab === 'solid' ? '0 0 14px var(--theme-glow)' : undefined,
            }}
          >
            Solid
          </button>
        </div>

        {/* Scrollable Theme Grid: Only this inner container scrolls */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-2">
            {displayedThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={currentTheme?.id === theme.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render directly at body level via React Portal so no container stacking context can trap it
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
