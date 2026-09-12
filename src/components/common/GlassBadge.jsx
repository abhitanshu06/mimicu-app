import React from 'react';

/**
 * Reusable frosted glass badge for tags, categories, and status indicators.
 * Uses theme CSS variables — works in both light and dark themes.
 */
export default function GlassBadge({
  children,
  variant = 'default',
  pulse = false,
  className = '',
  style = {},
  ...props
}) {
  const variantStyles = {
    default: {
      backgroundColor: 'var(--theme-btn-secondary)',
      color: 'var(--theme-text-secondary)',
      border: '1px solid var(--theme-border)',
    },
    accent: {
      backgroundColor: 'var(--theme-btn-secondary)',
      color: 'var(--theme-accent)',
      border: '1px solid var(--theme-border-hover)',
    },
    glow: {
      backgroundColor: 'var(--theme-btn-secondary)',
      color: 'var(--theme-text-primary)',
      border: '1px solid var(--theme-border-hover)',
      boxShadow: '0 0 12px var(--theme-glow)',
    },
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        backdrop-blur-md tracking-wide select-none
        ${className}
      `}
      style={{
        ...(variantStyles[variant] || variantStyles.default),
        ...style,
      }}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
          <span
            className="relative inline-flex rounded-full h-1.5 w-1.5"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          />
        </span>
      )}
      {children}
    </span>
  );
}
