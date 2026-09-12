import React, { useState, useMemo } from 'react';
import GlassCard from '../common/GlassCard';
import GlassButton from '../common/GlassButton';
import { useLibraryStore } from '../../stores/libraryStore';
import { useAudioStore } from '../../stores/audioStore';
import { useVibeStore } from '../../stores/vibeStore';
import { TRACKS, formatDuration } from '../../data/tracks';
import { 
  Play, 
  Pause, 
  Shuffle, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Music, 
  Clock, 
  Heart, 
  X, 
  Check, 
  ListMusic 
} from 'lucide-react';

/**
 * PlaylistDetailView
 *
 * Full playlist management workspace:
 * - Play & Shuffle playlist (via existing AudioStore queue)
 * - Track list with real-time Up/Down reordering (zero heavy dependencies, 100% responsive)
 * - Remove songs from playlist
 * - Inline Rename & Delete playlist
 * - Add songs to playlist from full canonical catalog
 */
export default function PlaylistDetailView({ playlistId, onBack }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isAddSongsOpen, setIsAddSongsOpen] = useState(false);
  const [catalogFilterQuery, setCatalogFilterQuery] = useState('');

  // Stores
  const playlist = useLibraryStore((state) => 
    state.playlists.find((pl) => pl.id === playlistId)
  );
  const renamePlaylist = useLibraryStore((state) => state.renamePlaylist);
  const deletePlaylist = useLibraryStore((state) => state.deletePlaylist);
  const removeTrackFromPlaylist = useLibraryStore((state) => state.removeTrackFromPlaylist);
  const reorderPlaylistTracks = useLibraryStore((state) => state.reorderPlaylistTracks);
  const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);

  const activeVibe = useVibeStore((state) => state.activeVibe);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const playTrack = useAudioStore((state) => state.playTrack);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  // Gracefully resolve playlist tracks against canonical catalog, skipping missing IDs
  const tracks = useMemo(() => {
    if (!playlist || !playlist.trackIds) return [];
    return playlist.trackIds
      .map((tid) => TRACKS.find((t) => t.id === tid))
      .filter(Boolean);
  }, [playlist]);

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  if (!playlist) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--theme-text-primary)' }}>
          Playlist not found or was deleted.
        </p>
        <GlassButton variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Back to Library
        </GlassButton>
      </div>
    );
  }

  // Play whole playlist starting from first track
  const handlePlayPlaylist = () => {
    if (!tracks.length) return;
    playTrack(tracks[0], tracks, {
      id: playlist.id,
      name: playlist.name,
      type: 'playlist',
    });
  };

  // Shuffle playlist using existing shuffle system
  const handleShufflePlaylist = () => {
    if (!tracks.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled, {
      id: playlist.id,
      name: `${playlist.name} (Shuffle)`,
      type: 'playlist',
    });
  };

  // Click single track row
  const handleTrackClick = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks, {
        id: playlist.id,
        name: playlist.name,
        type: 'playlist',
      });
    }
  };

  const handleStartEditing = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description || '');
    setIsEditing(true);
  };

  const handleSaveEditing = (e) => {
    e.preventDefault();
    if (editName.trim()) {
      renamePlaylist(playlist.id, editName.trim(), editDesc.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      onBack();
    }
  };

  // Filter available catalog tracks for adding
  const availableTracksToAdd = TRACKS.filter((t) => {
    const isAlreadyIn = playlist.trackIds?.includes(t.id);
    if (isAlreadyIn) return false;
    if (!catalogFilterQuery.trim()) return true;
    const q = catalogFilterQuery.toLowerCase().trim();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col text-left animate-fadeIn">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
          style={{ color: 'var(--theme-text-muted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vault</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleStartEditing}
            className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Rename Playlist"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playlist Hero Banner */}
      <GlassCard className="p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Cover Art Thumbnail */}
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl shrink-0 flex items-center justify-center shadow-2xl border border-white/20"
            style={{ background: playlist.coverArt }}
          >
            <ListMusic className="w-14 h-14 text-white/90 drop-shadow-md" />
          </div>

          {/* Playlist Info & Controls */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <span
              className="text-[11px] uppercase tracking-widest font-semibold block mb-1"
              style={{ color: activeVibe.colors.primary }}
            >
              Custom Playlist
            </span>

            {isEditing ? (
              <form onSubmit={handleSaveEditing} className="space-y-2 mb-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl px-3 py-1.5 text-lg sm:text-2xl font-bold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                  autoFocus
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Add optional description..."
                  className="w-full rounded-xl px-3 py-1 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text-muted)',
                  }}
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                    style={{ backgroundColor: activeVibe.colors.primary, color: '#fff' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-lg text-xs hover:bg-white/10 text-white/60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1
                  className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight mb-2 truncate"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {playlist.name}
                </h1>
                <p
                  className="text-xs sm:text-sm font-light line-clamp-2 mb-3"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  {playlist.description || 'A custom ambient playlist curated in Mimicu.'}
                </p>
              </>
            )}

            <div
              className="flex items-center justify-center sm:justify-start gap-4 text-xs font-mono mb-5"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <span>{tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}</span>
              <span>•</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <GlassButton
                variant="primary"
                size="md"
                icon={Play}
                disabled={tracks.length === 0}
                onClick={handlePlayPlaylist}
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
                }}
              >
                Play Playlist
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="md"
                icon={Shuffle}
                disabled={tracks.length === 0}
                onClick={handleShufflePlaylist}
              >
                Shuffle
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="md"
                icon={Plus}
                onClick={() => setIsAddSongsOpen(true)}
              >
                Add Songs
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Playlist Track List */}
      <GlassCard className="p-4 sm:p-6 mb-12">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <span className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            Tracks
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
            # • Title • Duration
          </span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
              style={{ backgroundColor: 'var(--theme-surface)' }}
            >
              <Music className="w-6 h-6 text-white/40" />
            </div>
            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              This playlist is empty
            </h4>
            <p className="text-xs max-w-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
              Add ambient and lo-fi tracks from the Mimicu catalog to customize your listening flow.
            </p>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddSongsOpen(true)}
            >
              Add Songs to Playlist
            </GlassButton>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isRowPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`
                    group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all select-none
                    ${isCurrent ? 'backdrop-blur-xl' : 'hover:bg-white/[0.04]'}
                  `}
                  style={{
                    backgroundColor: isCurrent ? 'var(--theme-surface-elevated)' : 'transparent',
                    border: isCurrent ? `1px solid ${activeVibe.colors.primary}60` : '1px solid transparent',
                  }}
                >
                  {/* Left: Index / Play status + Cover + Info */}
                  <div className="flex items-center gap-3 min-w-0">
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
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-white/10 shadow-sm"
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
                        {track.artist} {track.album && `• ${track.album}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Reorder Up/Down + Like + Remove + Duration */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Reorder Buttons (Simplest reliable implementation, works seamlessly on mobile & desktop) */}
                    <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderPlaylistTracks(playlist.id, idx, idx - 1);
                        }}
                        className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white transition-colors"
                        title="Move track up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === tracks.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderPlaylistTracks(playlist.id, idx, idx + 1);
                        }}
                        className="p-1 rounded hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white transition-colors"
                        title="Move track down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Like button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      style={{ color: isLiked(track.id) ? '#f43f5e' : 'var(--theme-text-muted)' }}
                      title="Like track"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Remove from playlist */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackFromPlaylist(playlist.id, track.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition-colors"
                      title="Remove from playlist"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-xs font-mono pl-1" style={{ color: 'var(--theme-text-muted)' }}>
                      <Clock className="w-3 h-3 opacity-60 hidden sm:inline" />
                      <span>{formatDuration(track.duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Add Songs to Playlist Modal */}
      {isAddSongsOpen && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddSongsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <div
            className="relative z-10 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            style={{
              backgroundColor: 'var(--theme-surface-elevated)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 shrink-0">
              <h3 className="font-display font-bold text-base sm:text-lg">Add Songs to "{playlist.name}"</h3>
              <button
                onClick={() => setIsAddSongsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 shrink-0">
              <input
                type="text"
                value={catalogFilterQuery}
                onChange={(e) => setCatalogFilterQuery(e.target.value)}
                placeholder="Search catalog by title, artist..."
                className="w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px]">
              {availableTracksToAdd.length === 0 ? (
                <div className="py-8 text-center text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  {catalogFilterQuery ? 'No matching tracks found.' : 'All available tracks have been added!'}
                </div>
              ) : (
                availableTracksToAdd.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all"
                    style={{ border: '1px solid var(--theme-border)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border border-white/10"
                        style={{ background: track.coverArtUrl }}
                      >
                        <Music className="w-4 h-4 text-white/60" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--theme-text-primary)' }}>
                          {track.title}
                        </p>
                        <p className="text-[11px] font-light truncate" style={{ color: 'var(--theme-text-muted)' }}>
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addTrackToPlaylist(playlist.id, track.id)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: activeVibe.colors.primary,
                        color: '#ffffff',
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
