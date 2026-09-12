import React, { useState } from 'react';
import { useLibraryStore } from '../../stores/libraryStore';
import { useVibeStore } from '../../stores/vibeStore';
import { X, Plus, Check, ListMusic, Music } from 'lucide-react';

/**
 * AddToPlaylistModal
 *
 * Clean modal dialog allowing the user to add a specific track to any of their
 * custom playlists, or create a brand new playlist on the fly.
 */
export default function AddToPlaylistModal({ track, isOpen, onClose }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const playlists = useLibraryStore((state) => state.playlists);
  const addTrackToPlaylist = useLibraryStore((state) => state.addTrackToPlaylist);
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const activeVibe = useVibeStore((state) => state.activeVibe);

  if (!isOpen || !track) return null;

  const handleToggleTrackInPlaylist = (playlist) => {
    const isAlreadyIn = playlist.trackIds?.includes(track.id);
    if (!isAlreadyIn) {
      addTrackToPlaylist(playlist.id, track.id);
    }
  };

  const handleCreateAndAdd = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim(), '', [track.id]);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add track to playlist"
        className="relative z-10 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-surface-elevated)',
          border: '1px solid var(--theme-border)',
          color: 'var(--theme-text-primary)',
          boxShadow: '0 24px 48px -8px var(--theme-shadow-strong)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5" style={{ color: activeVibe.colors.primary }} />
            <h3 className="font-display font-bold text-base sm:text-lg">Add to Playlist</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Track Pill */}
        <div
          className="flex items-center gap-3 p-2.5 rounded-2xl mb-4 shrink-0"
          style={{ backgroundColor: 'var(--theme-surface)' }}
        >
          <div
            className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border border-white/10"
            style={{ background: track.coverArtUrl }}
          >
            <Music className="w-4 h-4 text-white/70" />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--theme-text-primary)' }}>
              {track.title}
            </p>
            <p className="text-xs truncate font-light" style={{ color: 'var(--theme-text-muted)' }}>
              {track.artist}
            </p>
          </div>
        </div>

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
          {playlists.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                No playlists created yet.
              </p>
            </div>
          ) : (
            playlists.map((playlist) => {
              const isAdded = playlist.trackIds?.includes(track.id);

              return (
                <div
                  key={playlist.id}
                  onClick={() => handleToggleTrackInPlaylist(playlist)}
                  className={`
                    flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer select-none
                    ${isAdded ? 'opacity-85' : 'hover:bg-white/5'}
                  `}
                  style={{
                    backgroundColor: isAdded ? 'var(--theme-surface)' : 'transparent',
                    border: isAdded ? `1px solid ${activeVibe.colors.primary}50` : '1px solid var(--theme-border)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border border-white/10 text-xs font-bold"
                      style={{ background: playlist.coverArt }}
                    >
                      <ListMusic className="w-4 h-4 text-white/80" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'var(--theme-text-primary)' }}>
                        {playlist.name}
                      </p>
                      <p className="text-[11px] font-light" style={{ color: 'var(--theme-text-muted)' }}>
                        {playlist.trackIds?.length || 0} tracks
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isAdded ? (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: `${activeVibe.colors.primary}20`,
                          color: activeVibe.colors.primary,
                          border: `1px solid ${activeVibe.colors.primary}40`,
                        }}
                      >
                        <Check className="w-3 h-3" />
                        <span>Added</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full hover:bg-white/10 text-white/70"
                        style={{ border: '1px solid var(--theme-border)' }}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create New Playlist Inline Toggle */}
        <div className="pt-4 mt-3 border-t border-white/10 shrink-0">
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                color: 'var(--theme-text-primary)',
                border: '1px solid var(--theme-border)',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  color: '#ffffff',
                }}
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewPlaylistName('');
                }}
                className="px-2.5 py-2 rounded-xl text-xs hover:bg-white/10 text-white/60"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
