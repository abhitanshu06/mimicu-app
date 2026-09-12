import React from 'react';
import { Sliders, User, Palette } from 'lucide-react';
import logo from '../../../mimicu.png';
import { useThemeStore } from '../../stores/themeStore';
import { useVibeStore } from '../../stores/vibeStore';

/**
 * TopNav
 *
 * Streamlined floating header controls:
 * - Left (mobile only): Compact brand logo
 * - Center: Pure visual breathing space letting the 3D world shine
 * - Right: Independent floating glass buttons: [ Theme ] [ Equalizer ] [ Profile ]
 *
 * Redundant top-center Active Vibe badge removed to maximize 3D atmosphere visibility.
 * All colors adapt dynamically across dark, AMOLED, and light themes.
 */
export default function TopNav({ currentPath = '/', onNavigate, onProfileClick }) {
  const toggleThemeModal = useThemeStore((state) => state.toggleThemeModal);
  const activeVibe = useVibeStore((state) => state.activeVibe);

  const isEqActive = currentPath === '/equalizer';
  const isProfileActive = currentPath === '/profile';

  return (
    <header className="fixed top-3 lg:top-5 inset-x-0 z-40 px-4 sm:px-6 md:pl-64 lg:pl-72 md:pr-8 flex items-center justify-between pointer-events-none transition-all duration-300">
      {/* 1. Mobile Brand Identity (Hidden on Desktop where Left Sidebar serves as brand anchor) */}
      <div
        onClick={() => onNavigate && onNavigate('/')}
        className="pointer-events-auto flex md:hidden items-center gap-2 px-2.5 py-1.5 rounded-2xl cursor-pointer group select-none transition-all duration-300 shadow-glass-sm"
        style={{
          backgroundColor: 'var(--theme-glass-strong)',
          backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
          border: '1px solid var(--theme-glass-border, var(--theme-border))',
        }}
        title="Mimicu Home"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src={logo}
            alt="Mimicu Mascot"
            className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex flex-col pr-1">
          <span
            className="font-display font-black text-sm tracking-wider leading-tight"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            MIMICU
          </span>
          <span
            className="text-[7.5px] uppercase tracking-[0.2em] font-semibold"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Spatial Sound
          </span>
        </div>
      </div>

      {/* 2. Center Breathing Space (No large redundant active vibe badge) */}
      <div className="flex-1" />

      {/* 3. Top-Right Floating Controls: [ Theme ] [ Equalizer ] [ Profile ] */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
        {/* [ Theme Button ] */}
        <button
          title="Theme & Appearance"
          onClick={toggleThemeModal}
          className="group relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            backgroundColor: 'var(--theme-glass-strong)',
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            border: '1px solid var(--theme-glass-border, var(--theme-border))',
            color: 'var(--theme-text-primary)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--theme-border-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--theme-border)'; }}
        >
          <Palette 
            className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" 
            style={{ color: 'var(--theme-accent)' }} 
          />
        </button>

        {/* [ Equalizer Button ] */}
        <button
          title="Spatial Equalizer"
          onClick={() => onNavigate && onNavigate('/equalizer')}
          className="group relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            backgroundColor: isEqActive ? 'var(--theme-btn-secondary)' : 'var(--theme-glass-strong)',
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            border: isEqActive 
              ? `1px solid ${activeVibe.colors.primary}` 
              : '1px solid var(--theme-glass-border, var(--theme-border))',
            boxShadow: isEqActive ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
            color: isEqActive ? activeVibe.colors.primary : 'var(--theme-text-primary)',
          }}
          onMouseEnter={(e) => { 
            if (!isEqActive) e.currentTarget.style.borderColor = 'var(--theme-border-hover)'; 
          }}
          onMouseLeave={(e) => { 
            if (!isEqActive) e.currentTarget.style.borderColor = 'var(--theme-border)'; 
          }}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* [ Profile Button ] */}
        <button
          onClick={onProfileClick || (() => onNavigate && onNavigate('/profile'))}
          title="User Profile"
          className="group relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          style={{
            backgroundColor: isProfileActive ? 'var(--theme-btn-secondary)' : 'var(--theme-glass-strong)',
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            border: isProfileActive 
              ? `1px solid ${activeVibe.colors.primary}` 
              : '1px solid var(--theme-glass-border, var(--theme-border))',
            boxShadow: isProfileActive ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
            color: isProfileActive ? activeVibe.colors.primary : 'var(--theme-text-primary)',
          }}
          onMouseEnter={(e) => { 
            if (!isProfileActive) e.currentTarget.style.borderColor = 'var(--theme-border-hover)'; 
          }}
          onMouseLeave={(e) => { 
            if (!isProfileActive) e.currentTarget.style.borderColor = 'var(--theme-border)'; 
          }}
        >
          <User className="w-4 h-4" />
          {/* Active online status indicator */}
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
            style={{ border: '2px solid var(--theme-bg)' }}
          />
        </button>
      </div>
    </header>
  );
}
