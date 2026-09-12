import React, { useEffect } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import { useVibeStore } from '../stores/vibeStore';
import { useAudioStore } from '../stores/audioStore';
import { VIBES } from '../config/vibes';
import { getTracksForVibe, getRecommendedTracks, formatDuration } from '../data/tracks';
import { 
  Play, 
  Pause, 
  Shuffle, 
  ArrowLeft, 
  Music, 
  Clock, 
  Sparkles, 
  Activity,
  Radio,
  Volume2,
  Heart,
  Plus,
  Check,
  ListMusic,
  Compass
} from 'lucide-react';

/**
 * VibePage
 * 
 * Reusable personalized music hub for any Mimicu Vibe.
 * Automatically synchronizes the persistent 3D WebGL background and CSS tokens.
 * Displays vibe metadata, audio temperament, interactive track collection,
 * queue info, and recommended tracks.
 */
export default function VibePage({ vibeId, onNavigate }) {
  // 1. Resolve active vibe configuration
  const vibe = VIBES[vibeId] || Object.values(VIBES)[0];
  const setVibe = useVibeStore((state) => state.setVibe);

  // 2. Audio store state & actions
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const queue = useAudioStore((state) => state.queue);
  const queueIndex = useAudioStore((state) => state.queueIndex);
  const likedTrackIds = useAudioStore((state) => state.likedTrackIds);
  const playTrack = useAudioStore((state) => state.playTrack);
  const playVibe = useAudioStore((state) => state.playVibe);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const addToQueue = useAudioStore((state) => state.addToQueue);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);
  const currentVibeContext = useAudioStore((state) => state.currentVibeContext);

  // 3. Fetch tracks for this vibe
  const tracks = getTracksForVibe(vibe.id);
  const recommendedTracks = getRecommendedTracks(vibe.id, 3);
  const totalDurationSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  // Is this vibe currently playing?
  const isThisVibeActive = currentVibeContext?.id === vibe.id;
  const isThisVibePlaying = isThisVibeActive && isPlaying;

  // 4. Automatically morph 3D environment to match this Vibe on mount
  useEffect(() => {
    if (vibe?.id) {
      setVibe(vibe.id);
    }
  }, [vibe?.id, setVibe]);

  const handlePlayVibe = () => {
    if (isThisVibePlaying) {
      togglePlay();
    } else {
      playVibe(vibe.id, false);
    }
  };

  const handleShuffleVibe = () => {
    playVibe(vibe.id, true);
  };

  const handleSelectTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks, {
        id: vibe.id,
        name: vibe.name,
        emoji: vibe.emoji,
        page: `/vibes/${vibe.id}`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-4 sm:pt-8 animate-fadeIn pb-16">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('/vibes')}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: 'var(--theme-btn-secondary)',
            border: '1px solid var(--theme-border)',
            color: 'var(--theme-text-muted)',
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>All Worlds</span>
        </button>

        <GlassBadge
          variant="glow"
          className="text-xs"
          style={{
            borderColor: `${vibe.colors.primary}60`,
            boxShadow: `0 0 16px ${vibe.colors.glow}`,
          }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: vibe.colors.primary }} />
          <span>Active Dimension: {vibe.category}</span>
        </GlassBadge>
      </div>

      {/* Vibe Hero Banner Card */}
      <GlassCard
        className="mb-8 p-6 sm:p-10 relative overflow-hidden"
        style={{
          border: `1px solid ${vibe.colors.primary}40`,
          boxShadow: `0 20px 48px -10px rgba(0, 0, 0, 0.5), 0 0 32px ${vibe.colors.glow}`,
        }}
      >
        {/* Ambient Top Glow Sheen */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: vibe.colors.primary }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
          {/* Big Vibe Emblem / Icon Circle */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shrink-0 shadow-2xl transition-transform duration-500 hover:scale-105"
            style={{
              backgroundColor: `${vibe.colors.bg}dd`,
              border: `2px solid ${vibe.colors.primary}80`,
              boxShadow: `0 0 28px ${vibe.colors.glow}`,
            }}
          >
            {vibe.emoji}
          </div>

          {/* Vibe Information */}
          <div className="flex-1 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${vibe.colors.primary}20`,
                  color: vibe.colors.primary,
                  border: `1px solid ${vibe.colors.primary}40`,
                }}
              >
                {vibe.category}
              </span>
              <span className="text-xs text-white/50">•</span>
              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                {tracks.length} curated tracks • {formatDuration(totalDurationSeconds)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight mb-2">
              {vibe.name}
            </h1>

            <p className="text-sm sm:text-base italic mb-3 font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              "{vibe.tagline}"
            </p>

            <p className="text-xs sm:text-sm font-light max-w-2xl leading-relaxed mb-6" style={{ color: 'var(--theme-text-muted)' }}>
              {vibe.description}
            </p>

            {/* Play & Shuffle CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <GlassButton
                variant="primary"
                size="lg"
                icon={isThisVibePlaying ? Pause : Play}
                onClick={handlePlayVibe}
                className="px-6 shadow-xl"
                style={{
                  backgroundColor: vibe.colors.primary,
                  borderColor: vibe.colors.accent || vibe.colors.primary,
                  boxShadow: `0 0 24px ${vibe.colors.glow}`,
                  color: '#ffffff',
                }}
              >
                {isThisVibePlaying ? 'PAUSE VIBE' : 'PLAY VIBE'}
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="lg"
                icon={Shuffle}
                onClick={handleShuffleVibe}
                className="px-5"
              >
                SHUFFLE
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Temperament & Genre Tags Shelf */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
              Sonic Palette:
            </span>
            {vibe.recommendedGenres?.map((genre) => (
              <span
                key={genre}
                className="px-2.5 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" style={{ color: vibe.colors.primary }} />
              Tempo: {vibe.bpmRange ? `${vibe.bpmRange[0]}-${vibe.bpmRange[1]} BPM` : '75 BPM'}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color: vibe.colors.secondary }} />
              Energy: {Math.round((vibe.energy || 0.3) * 100)}%
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Track Collection Table */}
      <GlassCard className="p-4 sm:p-6 text-left">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" style={{ color: vibe.colors.primary }} />
            <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              Atmospheric Tracklist
            </h2>
          </div>
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            {tracks.length} Songs Available
          </span>
        </div>

        {/* Track Rows */}
        <div className="space-y-1.5">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isRowPlaying = isCurrent && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`
                  group relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 select-none
                  ${isCurrent ? 'backdrop-blur-xl' : 'hover:bg-white/[0.04]'}
                `}
                style={{
                  backgroundColor: isCurrent ? 'var(--theme-surface-elevated)' : 'transparent',
                  border: isCurrent ? `1px solid ${vibe.colors.primary}60` : '1px solid transparent',
                  boxShadow: isCurrent ? `0 0 16px ${vibe.colors.glow}` : undefined,
                }}
              >
                {/* Left: Track Number / Play Indicator + Artwork + Title */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  {/* Track Index or Animated Waveform Indicator */}
                  <div className="w-7 text-center shrink-0 flex items-center justify-center">
                    {isRowPlaying ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" style={{ backgroundColor: vibe.colors.primary }} />
                        <span className="w-1 bg-purple-400 rounded-full animate-bounce h-4 delay-75" style={{ backgroundColor: vibe.colors.primary }} />
                        <span className="w-1 bg-purple-400 rounded-full animate-bounce h-2 delay-150" style={{ backgroundColor: vibe.colors.primary }} />
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-white/40 group-hover:hidden">
                        {idx + 1}
                      </span>
                    )}
                    <Play
                      className={`w-3.5 h-3.5 hidden group-hover:block transition-colors ${isCurrent ? 'text-purple-400' : 'text-white/80'}`}
                      style={{ color: isCurrent ? vibe.colors.primary : undefined }}
                    />
                  </div>

                  {/* Artwork Thumbnail */}
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 flex items-center justify-center shadow-md border border-white/10"
                    style={{ background: track.coverArtUrl }}
                  >
                    <Music className="w-4 h-4 text-white/60" />
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 text-left">
                    <h3
                      className={`text-sm font-semibold truncate transition-colors ${isCurrent ? 'text-purple-300' : 'text-white/90'}`}
                      style={{ color: isCurrent ? vibe.colors.primary : 'var(--theme-text-primary)' }}
                    >
                      {track.title}
                    </h3>
                    <p className="text-xs truncate font-light" style={{ color: 'var(--theme-text-muted)' }}>
                      {track.artist} • <span className="opacity-75">{track.album}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Like + Queue + Genre Badge + Duration */}
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  {/* Like Button (Section 17) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className="p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
                    style={{
                      color: isLiked(track.id) ? '#f43f5e' : 'var(--theme-text-muted)',
                    }}
                    title={isLiked(track.id) ? 'Unlike track' : 'Save to Liked Tracks'}
                  >
                    <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Add to Queue Button (Section 16) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    className="p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95 text-xs hidden sm:inline-flex"
                    style={{ color: 'var(--theme-text-muted)' }}
                    title="Add to Up Next Queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {track.genres && track.genres[0] && (
                    <span
                      className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full border border-white/10"
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

        {/* Section 2: Queue Information Footer inside Tracklist */}
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
          <div className="flex items-center gap-2">
            <ListMusic className="w-3.5 h-3.5" style={{ color: vibe.colors.primary }} />
            <span>
              {isThisVibeActive 
                ? `Currently playing from this world • Track ${queueIndex + 1} of ${queue.length}`
                : `Sequence ready • ${tracks.length} tracks available in session`
              }
            </span>
          </div>
          <span className="text-[11px]">
            {isThisVibePlaying ? 'Active Session' : 'Ready to Stream'}
          </span>
        </div>
      </GlassCard>

      {/* Section 2: Recommended Tracks Shelf */}
      {recommendedTracks.length > 0 && (
        <div className="mt-8 text-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: vibe.colors.accent || vibe.colors.primary }} />
              <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Harmonic Recommendations
              </h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
              Compatible Ambient Frequencies
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {recommendedTracks.map((recTrack) => {
              const isRecCurrent = currentTrack?.id === recTrack.id;
              const isRecPlaying = isRecCurrent && isPlaying;

              return (
                <GlassCard
                  key={recTrack.id}
                  hoverable
                  onClick={() => handleSelectTrack(recTrack)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer group"
                  style={{
                    border: isRecCurrent ? `1px solid ${vibe.colors.primary}` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md relative overflow-hidden"
                      style={{ background: recTrack.coverArtUrl }}
                    >
                      <Music className="w-4 h-4 text-white/70" />
                      {isRecPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: vibe.colors.primary }} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 text-left">
                      <h4
                        className={`text-xs font-semibold truncate transition-colors ${isRecCurrent ? 'text-purple-300' : 'group-hover:text-purple-300'}`}
                        style={{ color: isRecCurrent ? vibe.colors.primary : 'var(--theme-text-primary)' }}
                      >
                        {recTrack.title}
                      </h4>
                      <p className="text-[11px] truncate font-light" style={{ color: 'var(--theme-text-muted)' }}>
                        {recTrack.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(recTrack.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: isLiked(recTrack.id) ? '#f43f5e' : 'var(--theme-text-muted)' }}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked(recTrack.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTrack(recTrack);
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95"
                      style={{
                        backgroundColor: vibe.colors.primary,
                      }}
                      title="Play Track"
                    >
                      {isRecPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
