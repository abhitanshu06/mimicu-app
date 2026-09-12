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
 * 3. Minimal selected check indicator safely inside preview area
 *
 * Strictly no descriptions, badges, counts, or extraneous metadata.
 */
function ThemeCard({ theme, isSelected, isHovered }) {
  const t = theme.tokens;
  const isGlass = theme.type === 'glass';

  return (
    <div className="flex flex-col gap-2 text-center w-full select-none overflow-visible">
      {/* 1. Large Visual Preview Window — overflow-hidden strictly on preview content */}
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

            {/* Centered Translucent Glass Panel — physically demonstrating glass blur, border, sheen */}
            <div
              className="w-[84%] h-[72%] rounded-xl p-2 flex flex-col justify-between relative z-10 mx-auto my-auto transition-all"
              style={{
                backgroundColor: t.surface,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${t.glassBorder || t.border}`,
                boxShadow: `0 8px 20px -2px rgba(0,0,0,0.30), inset 0 1px 1px 0 ${t.glassHighlight || 'rgba(255,255,255,0.22)'}`,
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

        {/* Selected Check Indicator — strictly inside preview top-right, safely bounded */}
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
    </div>
  );
}

/**
 * SelectionWrapper
 *
 * Dedicated wrapper that owns the active selection and hover borders with subtle glow.
 * Separated from ThemeCard child so:
 * - Active border is completely unclipped
 * - Boundary appears IMMEDIATELY on hover (no delay, no click flash)
 * - Zero layout shift between idle, hovered, and selected states (consistent 2px border)
 * - Browser focus/click outlines strictly disabled
 */
function SelectionWrapper({ theme, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const t = theme.tokens;
  const showActiveBorder = isSelected || isHovered;

  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-2xl p-2 sm:p-2.5 w-full text-left cursor-pointer overflow-visible outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none select-none transition-[border-color,box-shadow,background-color] duration-150"
      style={{
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        backgroundColor: isSelected
          ? 'var(--theme-surface-elevated)'
          : isHovered
          ? 'var(--theme-surface-hover, var(--theme-surface-elevated))'
          : 'var(--theme-surface)',
        border: showActiveBorder
          ? `2px solid ${t.accent}`
          : '2px solid var(--theme-border)',
        boxShadow: isSelected
          ? `0 0 14px -2px ${t.accentGlow}, 0 4px 16px -2px var(--theme-shadow-strong)`
          : isHovered
          ? `0 0 10px -2px ${t.accentGlow}, 0 4px 12px -2px var(--theme-shadow)`
          : '0 2px 8px 0 var(--theme-shadow)',
      }}
    >
      <ThemeCard theme={theme} isSelected={isSelected} isHovered={isHovered} />
    </button>
  );
}

/**
 * ThemeGridItem
 * Outer grid cell wrapper.
 * Sets minimal z-index (z-10 when selected or hovered, z-0 otherwise) so that the
 * card's outer glow and border cleanly render above neighboring grid items without being obscured.
 */
function ThemeGridItem({ theme, isSelected, onSelect }) {
  return (
    <div
      className={`relative overflow-visible transition-all duration-150 hover:z-10 ${
        isSelected ? 'z-10' : 'z-0'
      }`}
    >
      <SelectionWrapper
        theme={theme}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    </div>
  );
}

/**
 * ThemeSelector
 *
 * Master Theme Switcher Modal rendered via React Portal at root body level.
 * - Sibling Stacking Architecture:
 *   1. Universal Blur Backdrop at z-[990]: full-screen blur(20px) overlay covering the entire underlying application
 *      (3D world, page content, left sidebar, persistent player, topnav).
 *   2. Modal Dialog Window at z-[1000]: 100% sharp, readable, non-blurred dialog.
 * - Complete background scroll lock (body + documentElement) while modal is open.
 * - Internal scrolling strictly on the theme card grid; header and tabs remain stable.
 * - Keyboard Escape listener for seamless dismissal.
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

  // Lock background scroll completely when modal is active
  useEffect(() => {
    if (isThemeModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isThemeModalOpen]);

  // Dismiss modal on Escape key
  useEffect(() => {
    if (!isThemeModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeThemeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThemeModalOpen, closeThemeModal]);

  const displayedThemes = useMemo(() => {
    return activeTab === 'solid' ? SOLID_THEMES : GLASS_THEMES;
  }, [activeTab]);

  if (!isThemeModalOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[990] pointer-events-none select-none">
      {/* Sibling 1: Universal Blur Backdrop at z-[990] — blurs entire underlying app (3D Canvas, sidebar, player, page) */}
      <div
        onClick={closeThemeModal}
        className="fixed inset-0 z-[990] pointer-events-auto cursor-pointer universal-modal-backdrop transition-opacity duration-300"
        style={{
          backgroundColor: 'var(--theme-overlay, rgba(0, 0, 0, 0.55))',
        }}
        aria-hidden="true"
      />

      {/* Sibling 2: Modal Container at z-[1000] — 100% crisp, sharp, non-blurred content */}
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Application Themes"
          className="pointer-events-auto w-full max-w-4xl max-h-[85vh] rounded-3xl p-5 sm:p-7 flex flex-col shadow-2xl overflow-hidden transition-all"
          style={{
            backgroundColor: 'var(--theme-glass-modal, var(--theme-modal-bg, var(--theme-surface-elevated)))',
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            border: '1px solid var(--theme-glass-border, var(--theme-border))',
            color: 'var(--theme-text-primary)',
            boxShadow: '0 24px 64px -8px var(--theme-shadow-strong), inset 0 1px 1px 0 var(--theme-glass-highlight, transparent)',
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

          {/* Scrollable Theme Grid: Scroll viewport */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 pr-1 sm:pr-1.5">
            {/* Internal Content Padding: Provides breathing room so top row, bottom row, left col, and right col borders/glows are NEVER clipped by the scroll viewport */}
            <div className="p-2.5 sm:p-3 pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
                {displayedThemes.map((theme) => (
                  <ThemeGridItem
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
      </div>
    </div>
  );

  // Render directly at body level via React Portal so no container stacking context can trap it
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
