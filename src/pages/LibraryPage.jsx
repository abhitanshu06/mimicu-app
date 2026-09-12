import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import AddToPlaylistModal from '../components/common/AddToPlaylistModal';
import PlaylistDetailView from '../components/library/PlaylistDetailView';
import { useAudioStore } from '../stores/audioStore';
import { useVibeStore } from '../stores/vibeStore';
import { useLibraryStore } from '../stores/libraryStore';
import { TRACKS, formatDuration } from '../data/tracks';
import { VIBES } from '../config/vibes';
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
  Sparkles, 
  Plus, 
  Bookmark, 
  Trash2, 
  X,
  ArrowRight
} from 'lucide-react';

/**
 * LibraryPage
 * 
 * Master Vault for user's personal audio sanctuary:
 * - Liked Songs (Favorites)
 * - Recently Played (Listening History)
 * - Saved Vibes (Atmospheric Worlds)
 * - Custom User Playlists (with creation, reordering, rename, delete)
 */
export default function LibraryPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('liked'); // 'liked' | 'history' | 'vibes' | 'playlists'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  // Stores
  const activeVibe = useVibeStore((state) => state.activeVibe);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const likedTrackIds = useAudioStore((state) => state.likedTrackIds || []);
  const history = useAudioStore((state) => state.history || []);
  const playTrack = useAudioStore((state) => state.playTrack);
  const playVibe = useAudioStore((state) => state.playVibe);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  const playlists = useLibraryStore((state) => state.playlists);
  const savedVibeIds = useLibraryStore((state) => state.savedVibeIds);
  const toggleSaveVibe = useLibraryStore((state) => state.toggleSaveVibe);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const activePlaylistId = useLibraryStore((state) => state.activePlaylistId);
  const setActivePlaylistId = useLibraryStore((state) => state.setActivePlaylistId);

  // Filter full track catalog by liked IDs (avoiding duplicates)
  const likedTracks = TRACKS.filter((t) => likedTrackIds.includes(t.id));

  // Resolve saved vibes against canonical 15 vibes
  const savedVibes = savedVibeIds
    .map((vid) => VIBES[vid])
    .filter(Boolean);

  const handleTrackClick = (track, queueContext, contextName = 'Library') => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queueContext, {
        id: 'library-context',
        name: contextName,
        type: 'library',
      });
    }
  };

  const handleCreatePlaylistSubmit = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newId = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setIsCreateModalOpen(false);
    setActivePlaylistId(newId);
  };

  // If a playlist is actively selected, show dedicated PlaylistDetailView
  if (activePlaylistId) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn pb-20">
        <PlaylistDetailView 
          playlistId={activePlaylistId} 
          onBack={() => setActivePlaylistId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn pb-20">
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
          Your saved tracks, personal playlists, recently explored journeys, and favorited worlds.
        </p>
      </div>

      {/* 4 Summary Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Liked Tracks Card */}
        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('liked')}
          className="flex flex-col items-center text-center py-5 cursor-pointer transition-all"
          style={{
            border: activeTab === 'liked' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'liked' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)' }}
          >
            <Heart className="w-5 h-5 text-rose-400 fill-current" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Liked Songs</h3>
          <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            {likedTracks.length} {likedTracks.length === 1 ? 'Song' : 'Songs'}
          </span>
        </GlassCard>

        {/* Recently Played Card */}
        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('history')}
          className="flex flex-col items-center text-center py-5 cursor-pointer transition-all"
          style={{
            border: activeTab === 'history' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'history' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)' }}
          >
            <History className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Recently Played</h3>
          <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            {history.length} {history.length === 1 ? 'Track' : 'Tracks'}
          </span>
        </GlassCard>

        {/* Saved Vibes Card */}
        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('vibes')}
          className="flex flex-col items-center text-center py-5 cursor-pointer transition-all"
          style={{
            border: activeTab === 'vibes' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'vibes' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <Bookmark className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Saved Vibes</h3>
          <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            {savedVibes.length} {savedVibes.length === 1 ? 'Vibe' : 'Vibes'}
          </span>
        </GlassCard>

        {/* Custom Playlists Card */}
        <GlassCard 
          hoverable 
          onClick={() => setActiveTab('playlists')}
          className="flex flex-col items-center text-center py-5 cursor-pointer transition-all"
          style={{
            border: activeTab === 'playlists' ? `1px solid ${activeVibe.colors.primary}` : undefined,
            boxShadow: activeTab === 'playlists' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <ListMusic className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-xs sm:text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Playlists</h3>
          <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
            {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
          </span>
        </GlassCard>
      </div>

      {/* Tab Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 select-none">
        <button
          onClick={() => setActiveTab('liked')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: activeTab === 'liked' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'liked' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'liked' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Liked Songs ({likedTracks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: activeTab === 'history' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'history' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'history' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <History className="w-3.5 h-3.5" />
          <span>Recently Played ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vibes')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: activeTab === 'vibes' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'vibes' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'vibes' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Vibes ({savedVibes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: activeTab === 'playlists' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
            color: activeTab === 'playlists' ? '#ffffff' : 'var(--theme-text-muted)',
            boxShadow: activeTab === 'playlists' ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlists ({playlists.length})</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────
          TAB 1: LIKED SONGS
          ────────────────────────────────────────────── */}
      {activeTab === 'liked' && (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400 fill-current" />
              <h2 className="text-xs sm:text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Your Liked Songs
              </h2>
            </div>
            {likedTracks.length > 0 && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={Play}
                onClick={() => handleTrackClick(likedTracks[0], likedTracks, 'Liked Songs')}
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
                No liked songs yet
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Tap the heart icon on any song while listening to save it directly to your vault.
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
                    onClick={() => handleTrackClick(track, likedTracks, 'Liked Songs')}
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
                          className="text-sm font-semibold truncate"
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
                      {/* Unlike */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-rose-500 cursor-pointer"
                        title="Remove from Liked"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      {/* Add to Playlist */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForPlaylist(track);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white cursor-pointer"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
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

      {/* ──────────────────────────────────────────────
          TAB 2: RECENTLY PLAYED
          ────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs sm:text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
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
                Start listening and your history will appear here
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Tracks you play will automatically be recorded here for fast resumption and replay.
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={Compass}
                onClick={() => onNavigate && onNavigate('/vibes')}
              >
                Discover Atmospheres
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-1.5">
              {history.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const isRowPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => handleTrackClick(track, history, 'Recently Played')}
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
                          className="text-sm font-semibold truncate"
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
                      {/* Like */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        style={{ color: isLiked(track.id) ? '#f43f5e' : 'var(--theme-text-muted)' }}
                        title="Like track"
                      >
                        <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Add to playlist */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrackForPlaylist(track);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white cursor-pointer"
                        title="Add to Playlist"
                      >
                        <Plus className="w-4 h-4" />
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

      {/* ──────────────────────────────────────────────
          TAB 3: SAVED VIBES
          ────────────────────────────────────────────── */}
      {activeTab === 'vibes' && (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs sm:text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Saved Atmospheric Worlds ({savedVibes.length})
              </h2>
            </div>
          </div>

          {savedVibes.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--theme-btn-secondary)' }}
              >
                <Bookmark className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                Save a Vibe to find it here
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Bookmark your favorite 3D atmospheres to quickly immerse into your most loved spaces.
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={Compass}
                onClick={() => onNavigate && onNavigate('/vibes')}
              >
                Browse All 15 Vibes
              </GlassButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedVibes.map((vibe) => (
                <div
                  key={vibe.id}
                  onClick={() => onNavigate && onNavigate(`/vibes/${vibe.id}`)}
                  className="group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-3xl">{vibe.emoji}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVibe(vibe.id);
                        }}
                        className="p-2 rounded-xl transition-all hover:scale-110 shadow-md cursor-pointer"
                        style={{
                          backgroundColor: vibe.colors.primary,
                          color: '#ffffff',
                        }}
                        title={`Play ${vibe.name}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveVibe(vibe.id);
                        }}
                        className="p-2 rounded-xl hover:bg-white/10 text-purple-400 transition-colors cursor-pointer"
                        title="Remove from Saved Vibes"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base truncate mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                      {vibe.name}
                    </h4>
                    <p className="text-xs font-light line-clamp-2" style={{ color: 'var(--theme-text-muted)' }}>
                      {vibe.tagline}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                    <span>{vibe.category}</span>
                    <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-white/70">
                      <span>Enter World</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* ──────────────────────────────────────────────
          TAB 4: PLAYLISTS
          ────────────────────────────────────────────── */}
      {activeTab === 'playlists' && (
        <GlassCard className="p-4 sm:p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs sm:text-sm uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                Your Playlists ({playlists.length})
              </h2>
            </div>
            <GlassButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                backgroundColor: activeVibe.colors.primary,
                boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
              }}
            >
              New Playlist
            </GlassButton>
          </div>

          {playlists.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--theme-btn-secondary)' }}
              >
                <ListMusic className="w-6 h-6 text-white/40" />
              </div>
              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                Create your first playlist
              </h4>
              <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
                Organize your favorite spatial sounds into custom mood tapes and listening journeys.
              </p>
              <GlassButton
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
                style={{ backgroundColor: activeVibe.colors.primary }}
              >
                Create Playlist
              </GlassButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => setActivePlaylistId(playlist.id)}
                  className="group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border)',
                  }}
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <div
                      className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center shadow-lg border border-white/20"
                      style={{ background: playlist.coverArt }}
                    >
                      <ListMusic className="w-7 h-7 text-white/90" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="font-semibold text-sm sm:text-base truncate mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>
                        {playlist.name}
                      </h4>
                      <p className="text-xs font-light line-clamp-2" style={{ color: 'var(--theme-text-muted)' }}>
                        {playlist.description || 'Custom playlist'}
                      </p>
                      <span className="text-[11px] font-mono opacity-60 mt-1 block">
                        {playlist.trackIds?.length || 0} {playlist.trackIds?.length === 1 ? 'track' : 'tracks'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50 group-hover:text-white transition-colors">
                      Open Playlist
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-white/50 group-hover:text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Create Playlist Modal Dialog */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create Playlist"
            className="relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col"
            style={{
              backgroundColor: 'var(--theme-surface-elevated)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5" style={{ color: activeVibe.colors.primary }} />
                <h3 className="font-display font-bold text-base sm:text-lg">Create New Playlist</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Midnight Solitude, Cyber Flow..."
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="What is the mood and vibe of this collection?"
                  className="w-full rounded-xl px-3.5 py-2 text-sm focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-white/10 text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all hover:scale-105 shadow-md"
                  style={{
                    backgroundColor: activeVibe.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  Create &amp; Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal for Track Rows */}
      {selectedTrackForPlaylist && (
        <AddToPlaylistModal
          track={selectedTrackForPlaylist}
          isOpen={Boolean(selectedTrackForPlaylist)}
          onClose={() => setSelectedTrackForPlaylist(null)}
        />
      )}
    </div>
  );
}
