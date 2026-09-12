import React, { useRef } from 'react';
import { useAudioStore } from '../../stores/audioStore';
import { useVibeStore } from '../../stores/vibeStore';
import { formatDuration } from '../../data/tracks';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Maximize2,
  Music,
} from 'lucide-react';


/**
 * MiniPlayer
 * 
 * Persistent frosted glass floating player mounted inside AppShell.
 * Stays active and continuous across all route changes.
 * Incorporates Mimicu design tokens, volume, seeker, shuffle, and expand triggers.
 */
export default function MiniPlayer({ onNavigate }) {
  const currentTrack = useAudioStore((state) => state.currentTrack);
  const isPlaying = useAudioStore((state) => state.playing);
  const progress = useAudioStore((state) => state.progress);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.muted);
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
  const openFullPlayer = useAudioStore((state) => state.openFullPlayer);

  const activeVibe = useVibeStore((state) => state.activeVibe);

  const progressBarRef = useRef(null);

  if (!currentTrack) return null;

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
    seek(newProgress);
  };

  const handleVibeBadgeClick = (e) => {
    e.stopPropagation();
    if (currentVibeContext?.page && onNavigate) {
      onNavigate(currentVibeContext.page);
    }
  };

  return (
    <div
      className="fixed bottom-[4.8rem] sm:bottom-[5.5rem] md:bottom-4 inset-x-0 md:left-60 lg:left-68 md:right-4 z-30 flex justify-center px-2 sm:px-6 pointer-events-none transition-all duration-300"
    >
      <div
        className="pointer-events-auto w-full max-w-4xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 relative overflow-hidden transition-all duration-300 shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-dock-bg)',
          backdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          border: '1px solid var(--theme-border)',
          boxShadow: `0 16px 40px -4px var(--theme-shadow-strong), 0 0 24px -2px ${activeVibe.colors.glow || 'rgba(168, 85, 247, 0.3)'}`,
        }}
      >
        {/* Continuous Top Progress Scrubber Bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="absolute top-0 inset-x-0 h-1 sm:h-1.5 bg-white/[0.08] cursor-pointer group hover:h-2 transition-all"
        >
          <div
            className="h-full rounded-r-full transition-all duration-100 relative"
            style={{
              width: `${(progress || 0) * 100}%`,
              backgroundColor: activeVibe.colors.primary,
              boxShadow: `0 0 10px ${activeVibe.colors.primary}`,
            }}
          >
            {/* Scrubber thumb handle on hover */}
            <span
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Player Controls Grid */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mt-1">
          {/* 1. Track Info & Artwork */}
          <div
            onClick={openFullPlayer}
            className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[40%] sm:max-w-[30%] cursor-pointer group select-none"
          >
            {/* Album Artwork with Vinyl Rotation */}
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden border border-white/10 shadow-md ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
              style={{ background: currentTrack.coverArtUrl }}
            >
              <Music className="w-4 h-4 text-white/70" />
              {/* Center spindle dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-black/60 border border-white/30 absolute" />
            </div>

            {/* Title & Artist & Vibe context */}
            <div className="min-w-0 text-left">
              <h4
                className="text-xs sm:text-sm font-semibold truncate transition-colors group-hover:text-purple-300"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                {currentTrack.title}
              </h4>

              <p className="text-[11px] truncate font-light" style={{ color: 'var(--theme-text-muted)' }}>
                {currentTrack.artist}
              </p>

              {/* Vibe Context Badge (Clickable) */}
              {currentVibeContext && (
                <button
                  onClick={handleVibeBadgeClick}
                  className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium tracking-wide mt-0.5 px-1.5 py-0.5 rounded-md hover:opacity-100 transition-opacity opacity-80"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary)',
                    color: activeVibe.colors.primary,
                  }}
                  title="Go to Vibe Page"
                >
                  <span>{currentVibeContext.emoji}</span>
                  <span className="truncate max-w-[120px]">{currentVibeContext.name}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Primary Playback Transport Controls */}
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Shuffle Button */}
              <button
                onClick={toggleShuffle}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors hidden sm:inline-flex"
                style={{
                  color: shuffle ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={shuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              {/* Previous Track */}
              <button
                onClick={previous}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  color: '#ffffff',
                  boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={next}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Repeat Button */}
              <button
                onClick={toggleRepeat}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors hidden sm:inline-flex relative"
                style={{
                  color: repeat !== 'off' ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={`Repeat: ${repeat}`}
              >
                {repeat === 'track' ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
                {repeat !== 'off' && (
                  <span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: activeVibe.colors.primary }}
                  />
                )}
              </button>
            </div>

            {/* Time Stamp display */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono" style={{ color: 'var(--theme-text-muted)' }}>
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* 3. Volume Slider & Fullscreen Expand Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                style={{ color: 'var(--theme-text-muted)' }}
                title={isMuted ? 'Unmute' : 'Mute'}
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
                className="w-16 lg:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-400"
                style={{ accentColor: activeVibe.colors.primary }}
              />
            </div>

            {/* Expand into Full Player Modal */}
            <button
              onClick={openFullPlayer}
              className="p-2 rounded-xl hover:bg-white/10 transition-all text-xs flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
              title="Expand Full Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Expand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
