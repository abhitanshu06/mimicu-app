import React from 'react';

/**
 * Reusable frosted glass card component
 *
 * Provides:
 * - Theme-controlled surface hierarchy (light and dark themes)
 * - Translucent backdrop blur revealing the 3D scene beneath
 * - Crisp theme-token border (works on light and dark)
 * - Optional active state with glowing border
 * - Top edge sheen that adapts to theme
 */
export default function GlassCard({
  children,
  className = '',
  hoverable = false,
  glow = false,
  active = false,
  onClick,
  style = {},
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl p-6
        transition-all duration-300 ease-out
        ${hoverable ? 'hover:translate-y-[-2px] cursor-pointer' : ''}
        ${className}
      `}
      style={{
        backgroundColor: active
          ? 'var(--theme-surface-elevated)'
          : 'var(--theme-surface)',
        backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
        WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
        borderColor: active
          ? 'var(--vibe-accent, var(--theme-accent))'
          : 'var(--theme-glass-border, var(--theme-border))',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: 'var(--theme-text-primary)',
        boxShadow: active
          ? `0 12px 36px 0 var(--theme-shadow-strong), 0 0 20px var(--vibe-glow, rgba(168,85,247,0.35))`
          : glow
          ? `0 8px 32px 0 var(--theme-shadow), 0 0 16px var(--vibe-glow, rgba(168,85,247,0.20))`
          : `0 8px 32px 0 var(--theme-shadow)`,
        ...style,
      }}
      {...props}
    >
      {/* Subtle top edge sheen — uses border token so it works in both light/dark */}
      <div
        className="absolute inset-x-0 top-0 h-[1px] rounded-t-2xl pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, var(--theme-border-hover), transparent)` }}
      />
      {children}
    </div>
  );
}
