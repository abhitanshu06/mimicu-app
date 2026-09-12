/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vibe: {
          bg: 'var(--vibe-bg, #08090e)',
          surface: 'rgba(255, 255, 255, 0.04)',
          surfaceHover: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.09)',
          borderHover: 'rgba(255, 255, 255, 0.22)',
          accent: 'var(--vibe-accent, #a855f7)',
          accentGlow: 'var(--vibe-glow, rgba(168, 85, 247, 0.45))',
          secondary: 'var(--vibe-secondary, #38bdf8)',
          // IMPORTANT: These now use theme tokens so they work in light themes
          textMuted: 'var(--theme-text-muted, #64748b)',
          textSubtle: 'var(--theme-text-secondary, #94a3b8)',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.05)',
          medium: 'rgba(255, 255, 255, 0.08)',
          heavy: 'rgba(255, 255, 255, 0.12)',
          dark: 'rgba(9, 11, 17, 0.7)',
          deep: 'rgba(6, 8, 13, 0.85)',
        },
        // Theme token aliases — map to CSS variables
        theme: {
          bg: 'var(--theme-bg)',
          surface: 'var(--theme-surface)',
          border: 'var(--theme-border)',
          text: 'var(--theme-text-primary)',
          muted: 'var(--theme-text-muted)',
          accent: 'var(--theme-accent)',
        },
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '24px',
        '3xl': '36px',
        '4xl': '48px',
      },
      boxShadow: {
        'glass-card': '0 8px 32px 0 var(--theme-shadow, rgba(0,0,0,0.35)), inset 0 1px 0 0 var(--theme-border)',
        'glass-dock': '0 16px 40px -4px var(--theme-shadow-strong, rgba(0,0,0,0.6)), 0 0 24px -2px var(--vibe-glow, rgba(168,85,247,0.25)), inset 0 1px 1px 0 var(--theme-border-hover)',
        'glass-glow': '0 0 30px var(--vibe-glow, rgba(168, 85, 247, 0.35))',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
