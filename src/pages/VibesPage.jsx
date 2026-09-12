import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import { useVibeStore } from '../stores/vibeStore';
import { VIBE_LIST, VIBE_CATEGORIES } from '../config/vibes';
import { Sparkles, Compass, CheckCircle2, Music2, Play } from 'lucide-react';

/**
 * VibesPage
 * 
 * Master Atmospheric Worlds Discovery Library.
 * Features:
 * - 8 Organized Vibe Categories with smooth filtering
 * - Horizontal Vibe Chips for quick activation
 * - Premium Vibe Cards with icon, atmospheric quote, music genres, and active state
 * - Direct navigation to personalized Vibe Music Pages (/vibes/:vibeId)
 */
export default function VibesPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All Vibes');

  const activeVibe = useVibeStore((state) => state.activeVibe);
  const targetVibe = useVibeStore((state) => state.targetVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const setVibe = useVibeStore((state) => state.setVibe);

  const currentSelectionId = isTransitioning ? targetVibe.id : activeVibe.id;

  // Safe canonical Vibe list references
  const safeVibeList = Array.isArray(VIBE_LIST) ? VIBE_LIST : [];
  const safeCategories = Array.isArray(VIBE_CATEGORIES) ? VIBE_CATEGORIES : ['All Vibes'];

  const filteredVibes = selectedCategory === 'All Vibes'
    ? safeVibeList
    : safeVibeList.filter((v) => v && v.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <GlassBadge 
          variant="glow" 
          pulse 
          className="mb-4"
          style={{
            borderColor: `${activeVibe.colors.primary}60`,
            boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
          }}
        >
          <Compass className="w-3.5 h-3.5" style={{ color: activeVibe.colors.primary }} />
          <span>Experiential Atmosphere Library ({safeVibeList.length} Worlds)</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          Atmospheric Worlds
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-2xl mx-auto font-light">
          Discover environments based on your current mood and activity. Selecting an atmosphere morphs the 3D world, camera kinetics, fog, and musical temperament.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-10 select-none">
        {safeCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 backdrop-blur-xl"
              style={{
                backgroundColor: isSelected ? 'var(--theme-btn-secondary)' : 'var(--theme-btn-ghost)',
                border: isSelected
                  ? `1px solid ${activeVibe.colors.primary}`
                  : '1px solid var(--theme-border)',
                color: isSelected ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                boxShadow: isSelected ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
                transform: isSelected ? 'scale(1.02)' : undefined,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Experiential Vibe Cards */}
      {filteredVibes.length === 0 ? (
        <GlassCard className="text-center py-16 mb-16">
          <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted)' }}>
            No atmospheric worlds found in "{selectedCategory}".
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-16">
          {filteredVibes.map((vibe) => {
          const isActive = currentSelectionId === vibe.id;

          const handleCardClick = () => {
            setVibe(vibe.id);
            if (onNavigate) {
              onNavigate(`/vibes/${vibe.id}`);
            }
          };

          return (
            <GlassCard
              key={vibe.id}
              hoverable
              active={isActive}
              onClick={handleCardClick}
              className={`
                group relative flex flex-col justify-between p-6 transition-all duration-300 min-h-[260px] cursor-pointer
                ${isActive ? 'scale-[1.02]' : 'hover:-translate-y-1'}
              `}
              style={{
                borderColor: isActive ? vibe.colors.primary : undefined,
                boxShadow: isActive ? `0 12px 36px 0 rgba(0, 0, 0, 0.45), 0 0 22px ${vibe.colors.glow}` : undefined,
              }}
            >
              <div>
                {/* Top Row: Emoji & Category Badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: 'var(--theme-btn-secondary)',
                        borderColor: 'var(--theme-border)',
                        boxShadow: `0 0 16px ${vibe.colors.primary}20`,
                      }}
                    >
                      {vibe.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-purple-300 transition-colors" style={{ color: 'var(--theme-text-primary)' }}>
                        {vibe.name}
                      </h3>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                        {vibe.category}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <GlassBadge 
                      variant="glow" 
                      className="text-[10px] px-2 py-0.5 gap-1 shrink-0"
                      style={{
                        borderColor: `${vibe.colors.primary}80`,
                        boxShadow: `0 0 10px ${vibe.colors.glow}`,
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Active</span>
                    </GlassBadge>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/10">
                      <Play className="w-3.5 h-3.5 ml-0.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Atmospheric Description */}
                <p className="text-xs text-vibe-textMuted leading-relaxed line-clamp-3 mb-4 font-light">
                  "{vibe.description}"
                </p>
              </div>

              {/* Bottom Metadata: Recommended Music Mood Genres & Action */}
              <div
                className="pt-3 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--theme-border)' }}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-light truncate" style={{ color: 'var(--theme-text-muted)' }}>
                  <Music2 className="w-3 h-3 shrink-0" style={{ color: 'var(--theme-accent)' }} />
                  <span className="truncate">
                    {vibe.recommendedGenres.slice(0, 3).join(' • ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      border: '1px solid var(--theme-border)',
                      color: vibe.colors.primary,
                    }}
                  >
                    {Math.round(vibe.energy * 100)}%
                  </span>
                  <span className="text-[11px] font-medium text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Explore →
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
        </div>
      )}
    </div>
  );
}
