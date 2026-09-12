import React, { useState, useRef } from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { useVibeStore } from '../../stores/vibeStore';
import { formatDuration } from '../../data/tracks';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  Sliders,
  Sparkles,
  Activity,
  Music,
  Disc3,
  Heart
} from 'lucide-react';

/**
 * FullPlayer
 * 
 * Expandable immersive full-screen player modal.
 * Features large rotating vinyl artwork, animated ambient glow,
 * interactive queue sheet, equalizer routing, and full scrubber controls.
 */
export default function FullPlayer({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('player'); // 'player' | 'queue'

  const isFullPlayerOpen = useAudioStore((state) => state.isFullPlayerOpen);
  const closeFullPlayer = useAudioStore((state) => state.closeFullPlayer);

  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const progress = useAudioStore((state) => state.progress);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.muted);
  const queue = useAudioStore((state) => state.queue);
  const queueIndex = useAudioStore((state) => state.queueIndex);
  const shuffle = useAudioStore((state) => state.shuffle);
  const repeat = useAudioStore((state) => state.repeat);
  const currentVibeContext = useAudioStore((state) => state.currentVibeContext);

  const togglePlay = useAudioStore((state) => state.togglePlay);
  const next = useAudioStore((state) => state.next);
  const previous = useAudioStore((state) => state.previous);
  const seek = useAudioStore((state) => state.seek);
  const setVolume = useAudioStore((state) => state.setVolume);
  const toggleMute = useAudioStore((state) => state.toggleMute);
  const toggleShuffle = useAudioStore((state) => state.toggleShuffle);
  const toggleRepeat = useAudioStore((state) => state.toggleRepeat);
  const playTrack = useAudioStore((state) => state.playTrack);
  const toggleLike = useAudioStore((state) => state.toggleLike);
  const isLiked = useAudioStore((state) => state.isLiked);

  const activeVibe = useVibeStore((state) => state.activeVibe);
  const scrubberRef = useRef(null);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const handleScrubberClick = (e) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    seek(newProgress);
  };

  const handleVibeClick = () => {
    if (currentVibeContext?.page && onNavigate) {
      closeFullPlayer();
      onNavigate(currentVibeContext.page);
    }
  };

  const handleEqualizerClick = () => {
    if (onNavigate) {
      closeFullPlayer();
      onNavigate('/equalizer');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto animate-fadeIn select-none"
      style={{
        backgroundColor: 'var(--theme-overlay-bg, rgba(9, 11, 18, 0.94))',
        backdropFilter: 'blur(36px)',
        WebkitBackdropFilter: 'blur(36px)',
        color: 'var(--theme-text-primary, #ffffff)',
      }}
    >
      {/* Background Atmosphere Radial Flare */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-colors duration-700"
        style={{ backgroundColor: activeVibe.colors.primary }}
      />

      {/* Top Action Bar */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-8 max-w-5xl mx-auto w-full">
        {/* Collapse Button */}
        <button
          onClick={closeFullPlayer}
          className="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-medium"
          style={{
            backgroundColor: 'var(--theme-btn-secondary)',
            border: '1px solid var(--theme-border)',
          }}
          title="Minimize to bar"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Current Vibe Pill Context */}
        {currentVibeContext && (
          <button
            onClick={handleVibeClick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              border: `1px solid ${activeVibe.colors.primary}60`,
              boxShadow: `0 0 20px ${activeVibe.colors.glow}`,
            }}
            title="Open Vibe Page"
          >
            <span>{currentVibeContext.emoji}</span>
            <span>PLAYING FROM: {currentVibeContext.name.toUpperCase()}</span>
          </button>
        )}

        {/* Right Tools: Equalizer & Queue Switcher */}
        <div className="flex items-center gap-2">
          {/* Equalizer Shortcut */}
          <button
            onClick={handleEqualizerClick}
            className="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--theme-btn-secondary)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
            title="Open Spatial Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Queue Sheet Tab Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'player' ? 'queue' : 'player')}
            className="p-2.5 rounded-full transition-all active:scale-95 relative"
            style={{
              backgroundColor: activeTab === 'queue' ? activeVibe.colors.primary : 'var(--theme-btn-secondary)',
              border: '1px solid var(--theme-border)',
              color: activeTab === 'queue' ? '#ffffff' : 'var(--theme-text-primary)',
              boxShadow: activeTab === 'queue' ? `0 0 16px ${activeVibe.colors.glow}` : undefined,
            }}
            title={activeTab === 'player' ? 'View Up Next Queue' : 'Back to Player'}
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body: Either Player Hero or Queue List */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-xl mx-auto w-full px-4 sm:px-8 py-4">
        {activeTab === 'player' ? (
          /* --- TAB 1: NOW PLAYING HERO --- */
          <div className="flex flex-col items-center text-center w-full animate-fadeIn">
            {/* Massive Album Cover / Vinyl Disc */}
            <div className="relative mb-8 group">
              {/* Outer Glow Halo */}
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-700"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  transform: isPlaying ? 'scale(1.06)' : 'scale(0.95)',
                }}
              />

              {/* Album Art Container */}
              <div
                className={`
                  w-60 h-60 sm:w-72 sm:h-72 rounded-3xl sm:rounded-full relative overflow-hidden flex items-center justify-center shadow-2xl border-2 border-white/20
                  ${isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''}
                `}
                style={{
                  background: currentTrack.coverArtUrl,
                  boxShadow: `0 24px 64px -12px rgba(0, 0, 0, 0.7), 0 0 36px ${activeVibe.colors.glow}`,
                }}
              >
                {/* Vinyl Grooves Texture Rings */}
                <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-10 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-16 rounded-full border border-white/10 pointer-events-none" />

                {/* Center Vinyl Center Hole */}
                <div className="w-14 h-14 rounded-full bg-black/80 border-2 border-white/30 flex items-center justify-center shadow-inner">
                  <Disc3 className="w-6 h-6 text-white/80" />
                </div>
              </div>
            </div>

            {/* Track Title & Artist & Like Button */}
            <div className="flex items-center justify-center gap-3 mb-1 max-w-full">
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-center truncate">
                {currentTrack.title}
              </h2>
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
                style={{ color: isLiked(currentTrack.id) ? '#f43f5e' : 'rgba(255,255,255,0.5)' }}
                title={isLiked(currentTrack.id) ? 'Unlike track' : 'Save to Liked Tracks'}
              >
                <Heart className={`w-5 h-5 ${isLiked(currentTrack.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <p className="text-sm sm:text-base font-medium mb-3 opacity-80" style={{ color: activeVibe.colors.accent || activeVibe.colors.primary }}>
              {currentTrack.artist} • <span className="opacity-75">{currentTrack.album}</span>
            </p>

            {/* Metadata Pills: Genre, Tempo, Energy */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs">
              {currentTrack.genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full border border-white/10"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary)',
                    color: 'var(--theme-text-secondary)',
                  }}
                >
                  {g}
                </span>
              ))}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-white/70">
                <Activity className="w-3 h-3 text-purple-400" />
                {currentTrack.bpm} BPM
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-[11px] text-white/70">
                <Sparkles className="w-3 h-3 text-sky-400" />
                {Math.round(currentTrack.energy * 100)}% Energy
              </span>
            </div>

            {/* Full Scrubber Progress Bar */}
            <div className="w-full mb-6">
              <div
                ref={scrubberRef}
                onClick={handleScrubberClick}
                className="w-full h-2 sm:h-2.5 bg-white/10 rounded-full cursor-pointer relative group overflow-hidden"
              >
                <div
                  className="h-full rounded-full transition-all duration-100 relative"
                  style={{
                    width: `${(progress || 0) * 100}%`,
                    backgroundColor: activeVibe.colors.primary,
                    boxShadow: `0 0 14px ${activeVibe.colors.primary}`,
                  }}
                />
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-xs font-mono text-white/50 mt-2">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Large Full Transport Controls */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className="p-3 rounded-full hover:bg-white/10 transition-colors"
                style={{
                  color: shuffle ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={shuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              {/* Previous */}
              <button
                onClick={previous}
                className="p-3 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                title="Previous Track"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              {/* Big Prominent Play / Pause Button */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-2xl hover:scale-105"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  color: '#ffffff',
                  boxShadow: `0 0 32px ${activeVibe.colors.glow}`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={next}
                className="p-3 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                title="Next Track"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className="p-3 rounded-full hover:bg-white/10 transition-colors relative"
                style={{
                  color: repeat !== 'off' ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={`Repeat mode: ${repeat}`}
              >
                {repeat === 'track' ? (
                  <Repeat1 className="w-5 h-5" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
                {repeat !== 'off' && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activeVibe.colors.primary }}
                  />
                )}
              </button>
            </div>

            {/* Bottom Volume Slider */}
            <div className="flex items-center gap-3 w-48 sm:w-64">
              <button
                onClick={toggleMute}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: activeVibe.colors.primary }}
              />
            </div>
          </div>
        ) : (
          /* --- TAB 2: UP NEXT QUEUE SHEET --- */
          <div className="w-full h-[450px] overflow-y-auto pr-1 animate-fadeIn">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs uppercase tracking-wider font-bold text-white/70">
                Playing Queue ({queue.length} Tracks)
              </span>
              <span className="text-xs font-mono text-purple-400">
                Track {queueIndex + 1} of {queue.length}
              </span>
            </div>

            <div className="space-y-2">
              {queue.map((track, idx) => {
                const isSelected = idx === queueIndex;

                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, queue)}
                    className={`
                      flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200
                      ${isSelected ? 'bg-white/10 border' : 'hover:bg-white/[0.04]'}
                    `}
                    style={{
                      borderColor: isSelected ? activeVibe.colors.primary : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 text-xs font-mono text-white/40 text-center shrink-0">
                        {idx + 1}
                      </span>

                      <div
                        className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-xs"
                        style={{ background: track.coverArtUrl }}
                      >
                        <Music className="w-3.5 h-3.5 text-white/70" />
                      </div>

                      <div className="min-w-0 text-left">
                        <h4
                          className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-purple-300' : 'text-white/90'}`}
                          style={{ color: isSelected ? activeVibe.colors.primary : undefined }}
                        >
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-white/50 truncate font-light">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        style={{ color: isLiked(track.id) ? '#f43f5e' : 'rgba(255,255,255,0.4)' }}
                        title={isLiked(track.id) ? 'Unlike track' : 'Save to Liked Tracks'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked(track.id) ? 'fill-current' : ''}`} />
                      </button>

                      <span className="text-xs font-mono text-white/50 shrink-0">
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding Info */}
      <footer className="relative z-10 p-4 text-center text-xs text-white/40 font-light">
        <span>Mimicu Experiential Sound Engine • Pure Spatial Audio</span>
      </footer>
    </div>
  );
}
