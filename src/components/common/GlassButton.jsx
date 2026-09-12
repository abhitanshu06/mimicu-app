import React from 'react';

/**
 * Reusable frosted glass button component
 * Supports primary, secondary, and ghost variants.
 * All colors use theme CSS variables — works in light and dark themes.
 */
export default function GlassButton({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  onClick,
  style = {},
  ...props
}) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl font-medium',
  };

  const variantInlineStyles = {
    primary: {
      backgroundColor: 'var(--theme-btn-primary)',
      color: 'var(--theme-btn-primary-text)',
      border: '1px solid var(--theme-border)',
    },
    secondary: {
      backgroundColor: 'var(--theme-btn-secondary)',
      color: 'var(--theme-btn-secondary-text)',
      border: '1px solid var(--theme-border)',
      backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
      WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
    },
    ghost: {
      backgroundColor: 'var(--theme-btn-ghost, transparent)',
      color: 'var(--theme-btn-ghost-text)',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 select-none
        disabled:opacity-40 disabled:pointer-events-none
        hover:scale-[1.02] active:scale-[0.98]
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      style={{
        ...variantInlineStyles[variant],
        ...style,
      }}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" />}
      {children}
    </button>
  );
}
