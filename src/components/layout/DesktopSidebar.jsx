import React from 'react';
import { 
  Home, 
  Search, 
  Sparkles, 
  Library, 
  Settings 
} from 'lucide-react';
import mascotLogo from '../../../mimicu.png';
import { useVibeStore } from '../../stores/vibeStore';

const PRIMARY_NAV = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'search', label: 'Search', path: '/search', icon: Search },
  { id: 'vibes', label: 'Vibes', path: '/vibes', icon: Sparkles },
  { id: 'library', label: 'Library', path: '/library', icon: Library },
];

/**
 * Shared nav button used for both primary nav items and the Settings button.
 * Keeps hover state declarative via CSS variables rather than imperative style mutations.
 */
function NavButton({ icon: Icon, label, active, vibeColors, onClick, extraIconClass = '' }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-xs lg:text-sm font-medium transition-all duration-200
        hover:bg-[var(--theme-btn-secondary)] hover:text-[var(--theme-text-primary)]
        ${active ? 'font-semibold' : ''}
      `}
      style={{
        backgroundColor: active ? 'var(--theme-btn-secondary)' : 'transparent',
        color: active ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
        border: active ? `1px solid ${vibeColors.primary}60` : '1px solid transparent',
        boxShadow: active ? `0 0 16px -2px ${vibeColors.glow || 'rgba(168, 85, 247, 0.25)'}` : undefined,
      }}
    >
      {/* Active Indicator Bar */}
      {active && (
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
          style={{
            backgroundColor: vibeColors.primary || 'var(--theme-accent)',
            boxShadow: `0 0 8px ${vibeColors.primary || 'var(--theme-accent)'}`,
          }}
        />
      )}

      <Icon
        className={`w-4 h-4 lg:w-4.5 lg:h-4.5 transition-transform duration-200 group-hover:scale-110 ${active ? 'ml-1' : ''} ${extraIconClass}`}
        style={{
          color: active ? (vibeColors.primary || 'var(--theme-accent)') : 'var(--theme-nav-inactive)',
        }}
      />

      <span className="truncate">{label}</span>

      {active && (
        <span
          className="ml-auto text-[10px] opacity-60 group-hover:translate-x-0.5 transition-transform"
          style={{ color: vibeColors.primary }}
        >
          ●
        </span>
      )}
    </button>
  );
}




/**
 * DesktopSidebar
 * 
 * Refined compact left-side vertical glass sidebar for desktop and tablet screens.
 * Clean, minimal structure with zero duplicate controls:
 * 
 * ┌───────────────────────┐
 * │       MIMICU          │
 * │   SPATIAL SOUND       │
 * ├───────────────────────┤
 * │  Home                 │
 * │  Search               │
 * │  Vibes                │
 * │  Library              │
 * ├───────────────────────┤
 * │  Settings             │
 * └───────────────────────┘
 * 
 * Theme, Equalizer, and Profile are positioned exclusively in the top-right floating bar.
 */
export default function DesktopSidebar({ currentPath = '/', onNavigate }) {
  const activeVibe = useVibeStore((state) => state.activeVibe);

  const isItemActive = (path) => {
    if (path === '/') return currentPath === '/';
    if (path === '/vibes') {
      return currentPath === '/vibes' || currentPath === '/themes' || currentPath.startsWith('/vibes/');
    }
    return currentPath === path;
  };

  return (
    <aside
      aria-label="Desktop Primary Navigation"
      className="hidden md:flex flex-col fixed left-3 lg:left-5 top-3 lg:top-5 bottom-3 lg:bottom-5 z-40 w-56 lg:w-60 rounded-3xl select-none transition-all duration-300 pointer-events-auto shadow-2xl justify-between"
      style={{
        backgroundColor: 'var(--theme-glass-strong)',
        backdropFilter: 'blur(var(--theme-glass-blur, 28px))',
        WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 28px))',
        border: '1px solid var(--theme-border)',
        boxShadow: `0 20px 50px -12px var(--theme-shadow-strong), 0 0 32px -4px ${activeVibe.colors.glow || 'rgba(168, 85, 247, 0.25)'}`,
      }}
    >
      <div>
        {/* 1. Brand Header: Mascot + MIMICU + SPATIAL SOUND */}
        <div 
          onClick={() => onNavigate && onNavigate('/')}
          className="cursor-pointer group flex flex-col items-center pt-5 pb-4 px-4 text-center transition-all duration-300"
          title="Mimicu Home"
        >
          {/* Mimicu Mascot Image - Prominent, Uncropped, Natural Proportions */}
          <div className="relative flex items-center justify-center w-20 h-22 lg:w-22 lg:h-26 mb-2 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
            {/* Subtle themed ambient aura behind mascot */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: activeVibe.colors.primary || 'var(--theme-accent)' }}
            />
            <img
              src={mascotLogo}
              alt="Mimicu Mascot"
              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          </div>

          {/* Wordmark */}
          <h1 
            className="font-display font-black text-xl lg:text-2xl tracking-[0.22em] leading-none mb-1 transition-colors"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            MIMICU
          </h1>

          {/* Subtitle */}
          <span 
            className="text-[9px] lg:text-[9.5px] uppercase font-bold tracking-[0.28em] transition-colors"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            SPATIAL SOUND
          </span>
        </div>

        {/* Subtle Top Divider */}
        <div className="px-5 mb-3">
          <div className="h-px w-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>

        {/* 2. Primary Navigation Cluster */}
        <nav className="flex flex-col gap-1.5 px-3 lg:px-4">
          {PRIMARY_NAV.map((item) => (
            <NavButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={isItemActive(item.path)}
              vibeColors={activeVibe.colors}
              onClick={() => onNavigate && onNavigate(item.path)}
            />
          ))}
        </nav>
      </div>

      {/* 3. Bottom / Utility Section: Settings with subtle divider */}
      <div className="px-3 lg:px-4 pb-4 pt-2">
        {/* Subtle Divider before Settings */}
        <div className="px-2 mb-3">
          <div className="h-px w-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>

        <NavButton
          icon={Settings}
          label="Settings"
          active={isItemActive('/settings')}
          vibeColors={activeVibe.colors}
          onClick={() => onNavigate && onNavigate('/settings')}
          extraIconClass="group-hover:rotate-45 duration-300"
        />
      </div>
    </aside>
  );
}

