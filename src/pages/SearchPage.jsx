import React, { useState, useMemo } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import { useAudioStore } from '../stores/audioStore';
import { useVibeStore } from '../stores/vibeStore';
import { TRACKS, formatDuration } from '../data/tracks';
import { 
  Search, 
  Play, 
  Pause, 
  Music, 
  Clock, 
  Heart, 
  Plus, 
  Sparkles,
  X
} from 'lucide-react';

/**
 * SearchPage
 * 
 * Interactive Spatial Search Portal.
 * Enables searching across all 36 curated tracks by title, artist, genre, or mood.
 * Supports instant playback ("Search -> Play Track"), likes, and queueing.
 */
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  const activeVibe = useVibeStore((state) => state.activeVibe);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const playTrack = useAudioStore((state) => state.playTrack);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const addToQueue = useAudioStore((state) => state.addToQueue);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  const filterTags = [
    'All',
    'Lo-Fi',
    'Ambient',
    'Indie',
    'Synthwave',
    'Acoustic',
    'Electronic',
    'Solitary',
    'Chill',
  ];

  const results = useMemo(() => {
    let list = TRACKS;

    if (selectedTag && selectedTag !== 'All') {
      const lowerTag = selectedTag.toLowerCase();
      list = list.filter((t) => 
        t.genres?.some((g) => g.toLowerCase().includes(lowerTag)) ||
        t.moodTags?.some((m) => m.toLowerCase().includes(lowerTag))
      );
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genres?.some((g) => g.toLowerCase().includes(q)) ||
        t.moodTags?.some((m) => m.toLowerCase().includes(q))
      );
    }

    return list;
  }, [query, selectedTag]);

  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, results);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn pb-16">
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
          <Search className="w-3.5 h-3.5" style={{ color: activeVibe.colors.primary }} />
          <span>Spatial Search &amp; Frequencies</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          Spatial Search
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-lg mx-auto font-light">
          Explore songs, artists, genres, and moodscapes across ambient dimensions.
        </p>
      </div>

      {/* Interactive Search Bar */}
      <div className="w-full max-w-2xl mb-6">
        <div
          className="relative flex items-center w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all shadow-lg"
          style={{
            backgroundColor: 'var(--theme-surface-elevated)',
            border: `1px solid ${query ? activeVibe.colors.primary : 'var(--theme-border)'}`,
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            boxShadow: query ? `0 0 20px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <Search className="w-5 h-5 mr-3 shrink-0" style={{ color: query ? activeVibe.colors.primary : 'var(--theme-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, genres, or moods..."
            className="w-full bg-transparent text-sm sm:text-base focus:outline-none"
            style={{ color: 'var(--theme-text-primary)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 select-none">
        {filterTags.map((tag) => {
          const isSelected = selectedTag === tag || (!selectedTag && tag === 'All');
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'All' ? null : tag)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                backgroundColor: isSelected ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
                border: isSelected ? `1px solid ${activeVibe.colors.primary}` : '1px solid var(--theme-border)',
                color: isSelected ? '#ffffff' : 'var(--theme-text-muted)',
                boxShadow: isSelected ? `0 0 12px ${activeVibe.colors.glow}` : undefined,
              }}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Search Results List */}
      <GlassCard className="w-full p-4 sm:p-6 text-left">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
            <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              Search Results
            </h2>
          </div>
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            {results.length} {results.length === 1 ? 'Track' : 'Tracks'} found
          </span>
        </div>

        {results.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              No matches found for "{query}"
            </p>
            <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              Try searching for genres like "Lo-Fi", "Ambient", "Acoustic", or moods like "solitary".
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {results.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isRowPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`
                    group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all select-none
                    ${isCurrent ? 'backdrop-blur-xl' : 'hover:bg-white/[0.04]'}
                  `}
                  style={{
                    backgroundColor: isCurrent ? 'var(--theme-surface-elevated)' : 'transparent',
                    border: isCurrent ? `1px solid ${activeVibe.colors.primary}60` : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-7 text-center shrink-0 flex items-center justify-center">
                      {isRowPlaying ? (
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-1 rounded-full animate-bounce h-2.5" style={{ backgroundColor: activeVibe.colors.primary }} />
                          <span className="w-1 rounded-full animate-bounce h-3.5 delay-75" style={{ backgroundColor: activeVibe.colors.primary }} />
                          <span className="w-1 rounded-full animate-bounce h-2 delay-150" style={{ backgroundColor: activeVibe.colors.primary }} />
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-white/40 group-hover:hidden">
                          {idx + 1}
                        </span>
                      )}
                      <Play className="w-3.5 h-3.5 hidden group-hover:block text-white/80" />
                    </div>

                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md border border-white/10"
                      style={{ background: track.coverArtUrl }}
                    >
                      <Music className="w-4 h-4 text-white/60" />
                    </div>

                    <div className="min-w-0 text-left">
                      <h4
                        className={`text-sm font-semibold truncate ${isCurrent ? 'text-purple-300' : 'text-white/90'}`}
                        style={{ color: isCurrent ? activeVibe.colors.primary : 'var(--theme-text-primary)' }}
                      >
                        {track.title}
                      </h4>
                      <p className="text-xs truncate font-light" style={{ color: 'var(--theme-text-muted)' }}>
                        {track.artist} • <span className="opacity-75">{track.album}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: isLiked(track.id) ? '#f43f5e' : 'var(--theme-text-muted)' }}
                      title="Like track"
                    >
                      <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-flex"
                      style={{ color: 'var(--theme-text-muted)' }}
                      title="Add to Queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {track.genres && track.genres[0] && (
                      <span
                        className="hidden md:inline-block text-[11px] px-2.5 py-0.5 rounded-full border border-white/10"
                        style={{
                          backgroundColor: 'var(--theme-btn-secondary)',
                          color: 'var(--theme-text-secondary)',
                        }}
                      >
                        {track.genres[0]}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                      <Clock className="w-3 h-3 opacity-60" />
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
