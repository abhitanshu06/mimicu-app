import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import { useAudioStore } from '../stores/audioStore';
import { useVibeStore } from '../stores/vibeStore';
import { TRACKS, formatDuration } from '../data/tracks';
import { 
  Library, 
  Heart, 
  ListMusic, 
  Compass, 
  Play, 
  Pause, 
  Clock, 
  Music, 
  History, 
  Sparkles 
} from 'lucide-react';

/**
 * LibraryPage
 * 
 * Master Vault for user's saved sonic collection, Liked Tracks,
 * and Recently Played listening history.
 * Full integration with useAudioStore and local persistence.
 */
export default function LibraryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('liked'); // 'liked' | 'history'

  const activeVibe = useVibeStore((state) => state.activeVibe);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const likedTrackIds = useAudioStore((state) => state.likedTrackIds || []);
  const history = useAudioStore((state) => state.history || []);
  const playTrack = useAudioStore((state) => state.playTrack);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  // Filter full track catalog by liked IDs
  const likedTracks = TRACKS.filter((t) => likedTrackIds.includes(t.id));

  const handleTrackClick = (track, queueContext) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn pb-16">
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
          <Library className="w-3.5 h-3.5" style={{ color: activeVibe.colors.primary }} />
          <span>Sonic Vault &amp; Collections</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          Your Library
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-lg mx-auto font-light">
          Your saved vibe tracks, personal favorites, and recently explored journeys.
        </p>
      </div>

      {/* Summary Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('liked')}
          className="flex flex-col items-center text-center py-6 cursor-pointer transition-all"
          style={{
            border: activeTab === 'liked' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'liked' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
          >
            <Heart className="w-5 h-5 text-rose-400 fill-current" />
          </div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Liked Tracks</h3>
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            {likedTracks.length} {likedTracks.length === 1 ? 'Track' : 'Tracks'} saved
          </span>
        </GlassCard>

        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('history')}
          className="flex flex-col items-center text-center py-6 cursor-pointer transition-all"
          style={{
            border: activeTab === 'history' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'history' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
          >
            <History className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Recently Played</h3>
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
            {history.length} {history.length === 1 ? 'Track' : 'Tracks'} in history
          </span>
        </GlassCard>

        <GlassCard 
          hoverable 
          onClick={() => onNavigate && onNavigate('/vibes')}
          className="flex flex-col items-center text-center py-6 cursor-pointer"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <Compass className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Atmospheres</h3>
          <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>15 Fixed Worlds</span>
        </GlassCard>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('liked')}
          className="px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'liked' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'liked' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'liked' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Favorites ({likedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'history' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'history' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'history' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recently Played ({history.length})</span>
        </button>
      </div>

      {/* Content Section: Liked Tracks or History */}
      {activeTab === 'liked' ? (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Your Liked Tracks
              </h2>
            </div>
            {likedTracks.length > 0 && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => playTrack(likedTracks[0], likedTracks)}
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
                }}
              >
                Play All Liked
              </GlassButton>
            )}
          </div>

          {likedTracks.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--theme-btn-secondary)' }}
              >
                <Heart className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                No liked tracks yet
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Tap the heart icon on any track in any Vibe page to save it directly to your vault.
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={Compass}
                onClick={() => onNavigate && onNavigate('/vibes')}
              >
                Explore Atmospheres
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-1.5">
              {likedTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isRowPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.id}
                    onClick={() => handleTrackClick(track, likedTracks)}
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

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-rose-500"
                        title="Remove from Liked Tracks"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

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
      ) : (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Recently Played Frequencies
              </h2>
            </div>
            {history.length > 0 && (
              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                Last {history.length} tracks
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--theme-btn-secondary)' }}
              >
                <History className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                No listening history yet
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Tracks you play will automatically appear here for quick access and resumption.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isRowPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => handleTrackClick(track, history)}
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

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: isLiked(track.id) ? '#f43f5e' : 'var(--theme-text-muted)' }}
                      >
                        <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                      </button>

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
      )}
    </div>
  );
}
