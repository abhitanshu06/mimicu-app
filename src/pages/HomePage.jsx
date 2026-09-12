import React from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import { useVibeStore } from '../stores/vibeStore';
import { Sparkles, ArrowRight, Compass, Play } from 'lucide-react';

/**
 * HomePage
 * 
 * Immersive arrival portal reflecting the active 3D world atmosphere.
 * Features 1-click atmosphere selection, mood tags, and future sonic curation.
 */
export default function HomePage({ onNavigate }) {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const targetVibe = useVibeStore((state) => state.targetVibe);

  const displayVibe = isTransitioning ? targetVibe : activeVibe;

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-14 animate-fadeIn">
      {/* Active Dimension Badge */}
      <GlassBadge 
        variant="glow" 
        pulse 
        className="mb-6 px-4 py-1.5 transition-all duration-500"
        style={{
          borderColor: `${displayVibe.colors.primary}60`,
          boxShadow: `0 0 20px ${displayVibe.colors.glow}`,
        }}
      >
        <span className="text-base">{displayVibe.emoji}</span>
        <span>Active World • {displayVibe.name}</span>
      </GlassBadge>

      {/* Cinematic Hero Title with Dynamic Vibe Accent */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight mb-4 max-w-4xl leading-[1.1]">
        Inhabiting{' '}
        <span 
          className="bg-clip-text text-transparent transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to right, ${displayVibe.colors.primary}, ${displayVibe.colors.secondary}, ${displayVibe.colors.accent})`
          }}
        >
          {displayVibe.name}
        </span>
      </h1>

      {/* Tagline & Description */}
      <p className="text-sm sm:text-base font-medium italic mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
        "{displayVibe.tagline}"
      </p>
      <p className="text-xs sm:text-sm max-w-2xl mb-8 leading-relaxed font-light" style={{ color: 'var(--theme-text-muted)' }}>
        {displayVibe.description}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
        <GlassButton 
          variant="primary" 
          size="lg" 
          icon={Play}
          onClick={() => onNavigate(`/vibes/${displayVibe.id}`)}
          style={{
            backgroundColor: `${displayVibe.colors.primary}ee`,
            borderColor: `${displayVibe.colors.primary}`,
            boxShadow: `0 0 24px ${displayVibe.colors.glow}`,
          }}
        >
          Enter {displayVibe.name} Music
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          size="lg" 
          icon={Compass}
          onClick={() => onNavigate('/vibes')}
        >
          All 15 Atmospheres
        </GlassButton>
        <GlassButton 
          variant="secondary" 
          size="lg" 
          icon={ArrowRight}
          onClick={() => onNavigate('/search')}
        >
          Search Dimensions
        </GlassButton>
      </div>

      {/* Active World Diagnostics & Sonic Direction Card */}
      <GlassCard 
        className="max-w-2xl w-full text-left" 
        glow
        style={{
          borderColor: `${displayVibe.colors.primary}40`,
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 24px ${displayVibe.colors.glow}`,
        }}
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{displayVibe.emoji}</span>
            <span 
              className="text-sm font-semibold tracking-wider uppercase"
              style={{ color: displayVibe.colors.primary }}
            >
              World Telemetry
            </span>
          </div>
          <GlassBadge variant="default" className="text-[11px]">
            {isTransitioning ? 'Interpolating World...' : `${displayVibe.visualWorld.environmentType}`}
          </GlassBadge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
            <span className="block mb-1" style={{ color: 'var(--theme-text-muted)' }}>Atmospheric Mood</span>
            <div className="flex flex-wrap gap-1">
              {displayVibe.moodTags.map((tag) => (
                <span key={tag} className="font-medium" style={{ color: 'var(--theme-text-secondary)' }}>#{tag}</span>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
            <span className="block mb-1" style={{ color: 'var(--theme-text-muted)' }}>Sonic Temperament</span>
            <span className="font-medium block" style={{ color: 'var(--theme-text-secondary)' }}>
              {displayVibe.recommendedGenres.slice(0, 2).join(' • ')}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
              {displayVibe.bpmRange[0]}-{displayVibe.bpmRange[1]} BPM • Energy: {Math.round(displayVibe.energy * 100)}%
            </span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          This 3D atmosphere remains persistently active while navigating between Home, Search, Vibes, Library, and Profile.
        </p>
      </GlassCard>
    </div>
  );
}
