import React from 'react';
import { Home, Search, Sparkles, Library, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'search', label: 'Search', path: '/search', icon: Search },
  { id: 'vibes', label: 'Vibes', path: '/vibes', icon: Sparkles },
  { id: 'library', label: 'Library', path: '/library', icon: Library },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

/**
 * FloatingDock
 *
 * Compact mobile-only bottom navigation dock (hidden on desktop).
 * Equalizer, Theme, and Profile are available via top-right floating buttons.
 * All colors use CSS variable tokens — works in light and dark themes.
 */
export default function FloatingDock({ currentPath = '/', onNavigate }) {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex justify-center px-2 sm:px-4 pointer-events-none"
    >
      <div
        className="pointer-events-auto flex items-center gap-0.5 sm:gap-1.5 p-1 sm:p-2 rounded-full transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-dock-bg)',
          backdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          border: '1px solid var(--theme-border)',
          boxShadow: '0 16px 40px -4px var(--theme-shadow-strong), 0 0 24px -2px var(--vibe-glow, rgba(168, 85, 247, 0.3)), inset 0 1px 1px 0 var(--theme-border-hover)',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/vibes' && (currentPath === '/themes' || currentPath.startsWith('/vibes/')));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 select-none"
              style={{ color: isActive ? 'var(--theme-nav-active)' : 'var(--theme-nav-inactive)' }}
            >
              {/* Active Background Pill with vibe glow */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300 pointer-events-none"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary)',
                    border: '1px solid var(--vibe-accent, rgba(168, 85, 247, 0.5))',
                    boxShadow: '0 0 14px var(--vibe-glow, rgba(168, 85, 247, 0.35))',
                  }}
                >
                  {/* Top sheen using theme border token */}
                  <div
                    className="absolute inset-x-2 top-0 h-[1px] rounded-full"
                    style={{ backgroundColor: 'var(--theme-border-hover)' }}
                  />
                </div>
              )}

              {/* Icon */}
              <span className="relative z-10">
                <Icon
                  className="w-4 h-4 transition-transform duration-200"
                  style={{
                    color: isActive ? 'var(--vibe-accent, var(--theme-accent))' : 'var(--theme-nav-inactive)',
                  }}
                />
              </span>

              {/* Label */}
              <span className={`relative z-10 hidden md:inline transition-opacity duration-200 ${isActive ? 'font-semibold tracking-wide' : 'font-normal'}`}>
                {item.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full shadow-sm"
                  style={{ backgroundColor: 'var(--vibe-accent, var(--theme-accent))' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
