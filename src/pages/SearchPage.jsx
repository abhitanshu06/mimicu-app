import React, { useState, useEffect, useMemo } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import AddToPlaylistModal from '../components/common/AddToPlaylistModal';
import { useAudioStore } from '../stores/audioStore';
import { useVibeStore } from '../stores/vibeStore';
import { useLibraryStore } from '../stores/libraryStore';
import { performUniversalSearch } from '../utils/searchEngine';
import { formatDuration } from '../data/tracks';
import { 
  Search, 
  Play, 
  Pause, 
  Music, 
  Clock, 
  Heart, 
  Plus, 
  Sparkles, 
  X, 
  History, 
  ListMusic, 
  User, 
  Compass, 
  ArrowRight 
} from 'lucide-react';

/**
 * SearchPage
 *
 * Universal Search Portal across Songs, Artists, Albums, Vibes, and User Playlists.
 * Features:
 * - Debounced input with instant partial-match search
 * - LocalStorage-backed Recent Searches with individual deletion and Clear History
 * - Categorized search filtering: [ All ] [ Songs ] [ Vibes ] [ Playlists ] [ Artists ]
 * - Direct playback from search results (feeding audioStore queue)
 * - Add to playlist integration
 */
export default function SearchPage({ onNavigate }) {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' | 'Songs' | 'Vibes' | 'Playlists' | 'Artists'
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  // Stores
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const playTrack = useAudioStore((state) => state.playTrack);
  const playVibe = useAudioStore((state) => state.playVibe);
  const togglePlay = useAudioStore((state) => state.togglePlay);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  const playlists = useLibraryStore((state) => state.playlists);
  const recentSearches = useLibraryStore((state) => state.recentSearches);
  const addRecentSearch = useLibraryStore((state) => state.addRecentSearch);
  const removeRecentSearch = useLibraryStore((state) => state.removeRecentSearch);
  const clearRecentSearches = useLibraryStore((state) => state.clearRecentSearches);
  const setActivePlaylistId = useLibraryStore((state) => state.setActivePlaylistId);

  // Debounce query to prevent excessive filtering on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(rawQuery);
      if (rawQuery.trim().length >= 2) {
        addRecentSearch(rawQuery.trim());
      }
    }, 150);
    return () => clearTimeout(handler);
  }, [rawQuery, addRecentSearch]);

  // Execute universal search across canonical tracks, 15 vibes, and user playlists
  const searchResults = useMemo(() => {
    return performUniversalSearch(debouncedQuery, playlists);
  }, [debouncedQuery, playlists]);

  const handleTrackClick = (track, queue) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, queue, {
        id: 'search-results',
        name: `Search: "${debouncedQuery}"`,
        type: 'search',
      });
    }
  };

  const handleOpenPlaylist = (playlistId) => {
    setActivePlaylistId(playlistId);
    if (onNavigate) {
      onNavigate('/library');
    }
  };

  const handleSelectRecentSearch = (term) => {
    setRawQuery(term);
    setDebouncedQuery(term);
  };

  const handleSelectArtist = (artistName) => {
    setRawQuery(artistName);
    setDebouncedQuery(artistName);
    setActiveCategory('Songs');
  };

  const categories = [
    { id: 'All', label: 'All', count: searchResults.totalCount },
    { id: 'Songs', label: 'Songs', count: searchResults.songs.length },
    { id: 'Vibes', label: 'Vibes', count: searchResults.vibes.length },
    { id: 'Playlists', label: 'Playlists', count: searchResults.playlists.length },
    { id: 'Artists', label: 'Artists', count: searchResults.artists.length },
  ];

  return (
    <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn pb-20">
      {/* Header */}
      <div className="text-center mb-6">
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
          <span>Universal Discovery &amp; Search</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          Universal Search
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-lg mx-auto font-light">
          Search across songs, artists, atmospheres, and custom personal playlists.
        </p>
      </div>

      {/* Universal Search Input */}
      <div className="w-full max-w-2xl mb-4">
        <div
          className="relative flex items-center w-full rounded-2xl px-4 sm:px-5 py-3.5 transition-all shadow-lg"
          style={{
            backgroundColor: 'var(--theme-surface-elevated)',
            border: `1px solid ${rawQuery ? activeVibe.colors.primary : 'var(--theme-border)'}`,
            backdropFilter: 'blur(var(--theme-glass-blur, 24px))',
            boxShadow: rawQuery ? `0 0 20px ${activeVibe.colors.glow}` : undefined,
          }}
        >
          <Search 
            className="w-5 h-5 mr-3 shrink-0" 
            style={{ color: rawQuery ? activeVibe.colors.primary : 'var(--theme-text-muted)' }} 
          />
          <input
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search tracks, artists, vibes, moods, playlists..."
            className="w-full bg-transparent text-sm sm:text-base focus:outline-none"
            style={{ color: 'var(--theme-text-primary)' }}
            autoFocus
          />
          {rawQuery && (
            <button
              onClick={() => {
                setRawQuery('');
                setDebouncedQuery('');
              }}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches Section (shown when query is empty) */}
      {!debouncedQuery && (
        <div className="w-full max-w-2xl mb-8">
          {recentSearches.length > 0 && (
            <div className="p-4 rounded-2xl mb-6" style={{ backgroundColor: 'var(--theme-surface)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs hover:underline cursor-pointer"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <span
                    key={term}
                    onClick={() => handleSelectRecentSearch(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--theme-btn-secondary)',
                      color: 'var(--theme-text-primary)',
                      border: '1px solid var(--theme-border)',
                    }}
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="p-0.5 rounded-full hover:bg-white/20 text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Atmospheric Suggestions */}
          <div className="text-center">
            <p className="text-xs mb-3 font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
              Or Explore Popular Vibes
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['3 AM Night Walk', 'Chai & Sutta', 'Midnight Highway', 'Coding Late Night', 'Celestial Drift'].map((vibeSuggestion) => (
                <button
                  key={vibeSuggestion}
                  type="button"
                  onClick={() => handleSelectRecentSearch(vibeSuggestion)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    color: 'var(--theme-text-secondary)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  {vibeSuggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categorized Filter Tabs (shown when searching) */}
      {debouncedQuery && (
        <div className="flex flex-wrap justify-center gap-2 mb-6 select-none">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isSelected ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
                  border: isSelected ? `1px solid ${activeVibe.colors.primary}` : '1px solid var(--theme-border)',
                  color: isSelected ? '#ffffff' : 'var(--theme-text-muted)',
                  boxShadow: isSelected ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
                }}
              >
                <span>{cat.label}</span>
                <span className="opacity-70 text-[10px]">({cat.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Results Container */}
      {debouncedQuery && (
        <div className="w-full space-y-6">
          {searchResults.totalCount === 0 ? (
            <GlassCard className="w-full p-12 text-center flex flex-col items-center justify-center">
              <div
                className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--theme-surface)' }}
              >
                <Search className="w-6 h-6 text-white/40" />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                No matches found for "{debouncedQuery}"
              </h3>
              <p className="text-xs max-w-sm" style={{ color: 'var(--theme-text-muted)' }}>
                Try searching for a different song title, artist like "Aarav", or a mood like "solitary" or "chill".
              </p>
            </GlassCard>
          ) : (
            <>
              {/* SECTION: SONGS */}
              {(activeCategory === 'All' || activeCategory === 'Songs') && searchResults.songs.length > 0 && (
                <GlassCard className="p-4 sm:p-6 text-left">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                        Songs ({searchResults.songs.length})
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {searchResults.songs.map((track, idx) => {
                      const isCurrent = currentTrack?.id === track.id;
                      const isRowPlaying = isCurrent && isPlaying;

                      return (
                        <div
                          key={track.id}
                          onClick={() => handleTrackClick(track, searchResults.songs)}
                          className={`
                            group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all select-none
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
                                {track.artist} • <span className="opacity-75">{track.album}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* Like Button */}
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
                              <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                            </button>

                            {/* Add to Playlist */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrackForPlaylist(track);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                              title="Add to Playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Duration */}
                            <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                              <Clock className="w-3 h-3 opacity-60" />
                              <span>{formatDuration(track.duration)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              )}

              {/* SECTION: VIBES */}
              {(activeCategory === 'All' || activeCategory === 'Vibes') && searchResults.vibes.length > 0 && (
                <GlassCard className="p-4 sm:p-6 text-left">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                        Atmospheric Worlds ({searchResults.vibes.length})
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {searchResults.vibes.map((vibe) => (
                      <div
                        key={vibe.id}
                        onClick={() => onNavigate && onNavigate(`/vibes/${vibe.id}`)}
                        className="group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02] shadow-sm"
                        style={{
                          backgroundColor: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-2xl">{vibe.emoji}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVibe(vibe.id);
                            }}
                            className="p-2 rounded-xl transition-all hover:scale-110 shadow-md"
                            style={{
                              backgroundColor: vibe.colors.primary,
                              color: '#ffffff',
                            }}
                            title={`Play ${vibe.name}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-sm truncate" style={{ color: 'var(--theme-text-primary)' }}>
                            {vibe.name}
                          </h4>
                          <p className="text-[11px] font-light line-clamp-2 mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                            {vibe.tagline}
                          </p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
                          <span>{vibe.category}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* SECTION: PLAYLISTS */}
              {(activeCategory === 'All' || activeCategory === 'Playlists') && searchResults.playlists.length > 0 && (
                <GlassCard className="p-4 sm:p-6 text-left">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <ListMusic className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                        Playlists ({searchResults.playlists.length})
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {searchResults.playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => handleOpenPlaylist(playlist.id)}
                        className="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center shadow-md border border-white/10"
                          style={{ background: playlist.coverArt }}
                        >
                          <ListMusic className="w-5 h-5 text-white/90" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs sm:text-sm truncate" style={{ color: 'var(--theme-text-primary)' }}>
                            {playlist.name}
                          </h4>
                          <p className="text-[11px] font-light truncate" style={{ color: 'var(--theme-text-muted)' }}>
                            {playlist.trackIds?.length || 0} tracks
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* SECTION: ARTISTS */}
              {(activeCategory === 'All' || activeCategory === 'Artists') && searchResults.artists.length > 0 && (
                <GlassCard className="p-4 sm:p-6 text-left">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                        Artists ({searchResults.artists.length})
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {searchResults.artists.map((artistItem) => (
                      <button
                        key={artistItem.artist}
                        type="button"
                        onClick={() => handleSelectArtist(artistItem.artist)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                        }}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 text-white/80">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                          {artistItem.artist}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5" style={{ color: 'var(--theme-text-muted)' }}>
                          {artistItem.trackCount} {artistItem.trackCount === 1 ? 'song' : 'songs'}
                        </span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              )}
            </>
          )}
        </div>
      )}

      {/* Add To Playlist Modal */}
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
