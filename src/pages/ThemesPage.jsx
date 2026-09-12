import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import { useVibeStore } from '../stores/vibeStore';
import { VIBE_LIST, VIBE_CATEGORIES } from '../config/vibes';
import { Sparkles, Compass, CheckCircle2 } from 'lucide-react';

/**
 * ThemesPage
 * 
 * Master Atmosphere Discovery Portal.
 * Showcases all 24+ experiential visual worlds with category filtering,
 * mood tags, genre metadata, and 1-click 3D world morphing.
 */
export default function ThemesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Dimensions');

  const activeVibe = useVibeStore((state) => state.activeVibe);
  const targetVibe = useVibeStore((state) => state.targetVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const setVibe = useVibeStore((state) => state.setVibe);

  const currentSelectionId = isTransitioning ? targetVibe.id : activeVibe.id;

  const filteredVibes = selectedCategory === 'All Dimensions'
    ? VIBE_LIST
    : VIBE_LIST.filter((v) => v.category === selectedCategory);

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full pt-6 sm:pt-10">
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
          <span>Experiential Atmosphere Library ({VIBE_LIST.length} Worlds)</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold mb-3 tracking-tight">
          Atmospheric Worlds
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-2xl mx-auto font-light">
          Each vibe is a distinct 3D visual reality. Selecting a world transforms the 3D environment, 
          camera kinetics, atmospheric fog, and musical temperament in real time.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 mb-10 select-none">
        {VIBE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200
                border backdrop-blur-xl
                ${isSelected
                  ? 'bg-white/[0.14] border-white/30 text-white shadow-glass-sm'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06] text-white/60 hover:text-white'
                }
              `}
              style={{
                borderColor: isSelected ? activeVibe.colors.primary : undefined,
                boxShadow: isSelected ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid of Experiential Vibe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredVibes.map((vibe) => {
          const isActive = currentSelectionId === vibe.id;

          return (
            <GlassCard
              key={vibe.id}
              hoverable
              onClick={() => setVibe(vibe.id)}
              className={`
                relative flex flex-col justify-between min-h-[260px] p-6 transition-all duration-300
                ${isActive
                  ? 'border-white/40 ring-1 scale-[1.02]'
                  : 'hover:border-white/25'
                }
              `}
              style={{
                borderColor: isActive ? vibe.colors.primary : undefined,
                boxShadow: isActive ? `0 0 35px ${vibe.colors.glow}` : undefined,
              }}
            >
              {/* Dynamic ambient radial tint in the corner */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at top right, ${vibe.colors.primary}, transparent 70%)`
                }}
              />

              {/* Top Header: Emoji + Title + Active Pill */}
              <div className="relative z-10 flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-white/[0.06] border border-white/[0.1] shadow-glass-sm shrink-0"
                    style={{
                      borderColor: isActive ? vibe.colors.primary : undefined,
                    }}
                  >
                    {vibe.emoji}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white leading-snug">
                      {vibe.name}
                    </h3>
                    <span className="text-[11px] font-medium tracking-wide text-white/50 block">
                      {vibe.category}
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <GlassBadge 
                    variant="accent" 
                    className="text-[10px] px-2.5 py-1 shrink-0"
                    style={{ 
                      backgroundColor: `${vibe.colors.primary}20`,
                      borderColor: vibe.colors.primary,
                      boxShadow: `0 0 10px ${vibe.colors.glow}`,
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active World</span>
                  </GlassBadge>
                ) : (
                  <span className="text-[10px] uppercase font-semibold text-white/40 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                    {vibe.visualWorld.environmentType}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="relative z-10 mb-4 flex-1">
                <p className="text-xs text-white/80 font-medium mb-1.5 italic">
                  "{vibe.tagline}"
                </p>
                <p className="text-xs text-vibe-textMuted leading-relaxed line-clamp-3 font-light">
                  {vibe.description}
                </p>
              </div>

              {/* Bottom Footer: Mood Tags & Recommended Genres */}
              <div className="relative z-10 border-t border-white/[0.06] pt-3 flex flex-col gap-2">
                {/* Mood Tags */}
                <div className="flex flex-wrap gap-1">
                  {vibe.moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/60 border border-white/[0.06]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Recommended Future Genres */}
                <div className="flex items-center justify-between text-[11px] text-white/40">
                  <span className="truncate">
                    🎵 {vibe.recommendedGenres.slice(0, 3).join(' • ')}
                  </span>
                  <span className="font-mono text-[10px] text-white/50 shrink-0 ml-2">
                    {vibe.bpmRange[0]}-{vibe.bpmRange[1]} BPM
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
