import React from 'react';
import { useVibeStore } from '../../stores/vibeStore';
import { VIBE_LIST } from '../../config/vibes';
import { Sparkles } from 'lucide-react';

/**
 * VibeSelector
 *
 * Reusable frosted glass horizontal selector displaying the experiential vibes.
 * Shows emoji, vibe title, dynamic glow, and 1-click 3D world activation.
 * All colors use CSS variable tokens — works in light and dark themes.
 */
export default function VibeSelector({ className = '' }) {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const targetVibe = useVibeStore((state) => state.targetVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const setVibe = useVibeStore((state) => state.setVibe);

  const currentSelectionId = isTransitioning ? targetVibe.id : activeVibe.id;

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-4 h-4 transition-colors duration-300"
            style={{ color: activeVibe.colors.primary }}
          />
          <span
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Select Atmosphere World
          </span>
        </div>

        {isTransitioning && (
          <span className="text-[11px] font-medium animate-pulse flex items-center gap-1.5" style={{ color: targetVibe.colors.primary }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: targetVibe.colors.primary }} />
            Entering {targetVibe.name}...
          </span>
        )}
      </div>

      {/* Horizontal Scrollable Frosted Glass Track */}
      <div className="relative w-full overflow-x-auto no-scrollbar pb-2 pt-1 flex items-center gap-2.5 select-none">
        {VIBE_LIST.map((vibe) => {
          const isActive = currentSelectionId === vibe.id;

          return (
            <button
              key={vibe.id}
              onClick={() => setVibe(vibe.id)}
              className="group relative shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 cursor-pointer backdrop-blur-2xl"
              style={{
                backgroundColor: isActive ? 'var(--theme-btn-secondary)' : 'var(--theme-btn-ghost)',
                border: isActive ? `1px solid ${vibe.colors.primary}` : '1px solid var(--theme-border)',
                color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                boxShadow: isActive ? `0 0 24px ${vibe.colors.glow}` : undefined,
                transform: isActive ? 'scale(1.03)' : undefined,
              }}
            >
              {/* Emoji Icon */}
              <span className="text-sm">{vibe.emoji}</span>

              {/* Color indicator dot */}
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'scale-125' : 'opacity-70 group-hover:opacity-100'}`}
                style={{
                  backgroundColor: vibe.colors.primary,
                  boxShadow: isActive ? `0 0 8px ${vibe.colors.primary}` : undefined,
                }}
              />

              {/* Vibe Name */}
              <span className={`tracking-wide whitespace-nowrap ${isActive ? 'font-bold' : ''}`}>
                {vibe.name}
              </span>

              {/* Active top reflection sheen using theme border token */}
              {isActive && (
                <span
                  className="absolute inset-x-3 top-0 h-[1px] rounded-full pointer-events-none"
                  style={{ backgroundColor: 'var(--theme-border-hover)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
