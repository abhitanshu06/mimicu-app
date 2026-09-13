import React, { useRef, useState } from 'react';
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
 * MiniPlayerProgress
 *
 * Isolated sub-component that owns the 4x/second progress subscriptions.
 * By keeping `progress`, `currentTime`, `duration`, and `seek` here,
 * progress ticks only re-render this tiny subtree — not the rest of MiniPlayer or the app.
 *
 * Layout:
 * [0:00]  ──────────────────────●──────────────────────  [3:34]
 * Left: Current elapsed time
 * Center: Seekable progress bar (unplayed track visible in both Light and Dark themes)
 * Right: Total duration
 */
function MiniPlayerProgress({ activeVibe }) {
  const progress = useAudioStore((state) => state.progress);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration || 0);
  const seek = useAudioStore((state) => state.seek);

  const barRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const dragProgressRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Compute 0.0 - 1.0 progress ratio from pointer clientX
  const calcProgress = (clientX) => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handlePointerDown = (e) => {
    // Only respond to primary click / touch
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const newProgress = calcProgress(e.clientX);
    dragProgressRef.current = newProgress;
    isDraggingRef.current = true;
    setIsDragging(true);
    setDragProgress(newProgress);

    const onPointerMove = (ev) => {
      if (!isDraggingRef.current) return;
      const nextProgress = calcProgress(ev.clientX);
      dragProgressRef.current = nextProgress;
      setDragProgress(nextProgress);
    };

    const onPointerEnd = (ev) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      const finalProgress = calcProgress(ev.clientX);
      seek(finalProgress);
      setIsDragging(false);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerEnd);
      window.removeEventListener('pointercancel', onPointerEnd);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
  };

  // While dragging, use local dragProgress directly; otherwise use audio store progress
  const activeProgress = isDragging ? dragProgress : (progress || 0);
  const currentPercent = Math.max(0, Math.min(100, activeProgress * 100));

  // Elapsed time: while dragging, instantly calculate from dragProgress * duration
  const displayedTime = isDragging
    ? Math.round(activeProgress * duration)
    : currentTime;

  return (
    <div className="w-full h-5 flex items-center gap-2 sm:gap-2.5 select-none shrink-0">
      {/* 1. Current Elapsed Time (LEFT) */}
      <span
        className="text-[10px] sm:text-[11px] font-mono tabular-nums shrink-0 text-right min-w-[28px] sm:min-w-[32px] transition-colors leading-none"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        {formatDuration(displayedTime)}
      </span>

      {/* 2. Progress / Seek Bar (CENTER) */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        className="relative flex-1 h-5 cursor-pointer group flex items-center touch-none"
        role="slider"
        aria-label="Track progress"
        aria-valuenow={Math.round(currentPercent)}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        {/* Track background (unplayed portion) — strictly fixed height, zero hover layout shift */}
        <div
          className="w-full h-1 sm:h-1.5 rounded-full overflow-hidden relative"
          style={{
            backgroundColor: 'var(--theme-border, rgba(128, 128, 128, 0.28))',
          }}
        >
          {/* Played track portion — zero transition lag while dragging */}
          <div
            className="h-full rounded-full relative"
            style={{
              width: `${currentPercent}%`,
              backgroundColor: activeVibe.colors.primary,
              boxShadow: `0 0 10px ${activeVibe.colors.primary}`,
              transition: isDragging ? 'none' : 'width 100ms linear',
            }}
          />
        </div>

        {/* Clean, visible, non-oversized thumb — directly tracks pointer without lag */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-md pointer-events-none ${
            isDragging
              ? 'scale-125 ring-2 ring-white/40'
              : 'group-hover:scale-110'
          }`}
          style={{
            left: `${currentPercent}%`,
            border: `1.5px solid ${activeVibe.colors.primary}`,
            boxShadow: `0 1px 4px rgba(0,0,0,0.35), 0 0 6px ${activeVibe.colors.glow || activeVibe.colors.primary}`,
            transition: isDragging ? 'none' : 'left 100ms linear, transform 100ms ease',
          }}
        />
      </div>

      {/* 3. Total Duration (RIGHT) */}
      <span
        className="text-[10px] sm:text-[11px] font-mono tabular-nums shrink-0 text-left min-w-[28px] sm:min-w-[32px] transition-colors leading-none"
        style={{ color: 'var(--theme-text-muted)' }}
      >
        {formatDuration(duration)}
      </span>
    </div>
  );
}

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
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.muted);
  const shuffle = useAudioStore((state) => state.shuffle);
  const repeat = useAudioStore((state) => state.repeat);
  const currentVibeContext = useAudioStore((state) => state.currentVibeContext);
  const playbackContext = useAudioStore((state) => state.playbackContext);

  const togglePlay = useAudioStore((state) => state.togglePlay);
  const next = useAudioStore((state) => state.next);
  const previous = useAudioStore((state) => state.previous);
  const setVolume = useAudioStore((state) => state.setVolume);
  const toggleMute = useAudioStore((state) => state.toggleMute);
  const toggleShuffle = useAudioStore((state) => state.toggleShuffle);
  const toggleRepeat = useAudioStore((state) => state.toggleRepeat);
  const openFullPlayer = useAudioStore((state) => state.openFullPlayer);

  const activeVibe = useVibeStore((state) => state.activeVibe);

  if (!currentTrack) return null;

  const handleVibeBadgeClick = (e) => {
    e.stopPropagation();
    const targetPage = playbackContext?.page || currentVibeContext?.page;
    if (targetPage && onNavigate) {
      onNavigate(targetPage);
    }
  };

  return (
    <div
      className="fixed bottom-[4.8rem] sm:bottom-[5.5rem] md:bottom-4 inset-x-0 md:left-64 lg:left-72 md:right-4 z-50 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-300"
    >
      <div
        className="pointer-events-auto w-full max-w-5xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 relative overflow-hidden transition-all duration-300 shadow-2xl"
        style={{
          backgroundColor: 'var(--theme-player-background, var(--theme-dock-bg))',
          backdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 28px))',
          border: '1px solid var(--theme-glass-border, var(--theme-player-border, var(--theme-border)))',
          color: 'var(--theme-player-text, var(--theme-text-primary))',
          boxShadow: `0 16px 40px -4px var(--theme-shadow-strong), 0 0 24px -2px ${activeVibe.colors.glow || 'rgba(168, 85, 247, 0.3)'}, inset 0 1px 1px 0 var(--theme-glass-highlight, transparent)`,
        }}
      >
        {/* ─── DESKTOP & TABLET LAYOUT (>= md) ─── */}
        <div className="hidden md:flex items-center justify-between gap-3 lg:gap-6">
          {/* 1. Left Section: Album Artwork, Track Title, Artist, Current Vibe */}
          <div className="flex items-center gap-3 min-w-0 w-[28%] max-w-[260px]">
            {/* Album Artwork — Completely Static (No Rotation, No Spindle) */}
            <div
              onClick={openFullPlayer}
              className="w-12 h-12 lg:w-13 lg:h-13 rounded-xl shrink-0 aspect-square flex items-center justify-center relative overflow-hidden transition-transform duration-300 select-none shadow-md cursor-pointer group"
              style={{
                background: currentTrack.coverArtUrl,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid var(--theme-border, rgba(255,255,255,0.15))',
                transform: isPlaying ? 'scale(1.02)' : 'scale(1.0)',
              }}
              title="Open Full Player"
            >
              <Music className="w-5 h-5 text-white/60" />
            </div>

            {/* Track Info */}
            <div className="min-w-0 flex-1 text-left">
              <h4
                onClick={openFullPlayer}
                className="text-xs lg:text-sm font-semibold truncate leading-tight transition-colors cursor-pointer hover:opacity-85"
                style={{ color: 'var(--theme-text-primary)' }}
                title={currentTrack.title}
              >
                {currentTrack.title}
              </h4>

              <p
                className="text-[11px] lg:text-xs truncate font-normal leading-tight mt-0.5"
                style={{ color: 'var(--theme-text-muted)' }}
                title={currentTrack.artist}
              >
                {currentTrack.artist}
              </p>

              {/* Current Context Badge (Clickable) */}
              {(playbackContext || currentVibeContext) && (
                <button
                  onClick={handleVibeBadgeClick}
                  className="inline-flex items-center gap-1 text-[9px] lg:text-[10px] font-medium tracking-wide mt-1 px-1.5 py-0.5 rounded-md hover:opacity-100 transition-opacity opacity-85 shrink-0"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary)',
                    color: activeVibe.colors.primary,
                    border: '1px solid var(--theme-border, rgba(255,255,255,0.08))',
                  }}
                  title={`Go to ${(playbackContext || currentVibeContext).name}`}
                >
                  <span>{(playbackContext || currentVibeContext).emoji}</span>
                  <span className="truncate max-w-[90px] lg:max-w-[120px]">{(playbackContext || currentVibeContext).name}</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Center Section: Transport Controls (Top) + Progress Bar Row (Bottom) */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto px-1 lg:px-2 min-w-0 shrink-0">
            {/* Transport Controls: Shuffle, Previous, Play/Pause, Next, Repeat */}
            <div className="h-10 flex items-center justify-center gap-2 lg:gap-3.5 mb-0.5 shrink-0">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                style={{
                  color: shuffle ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={shuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={previous}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                onClick={togglePlay}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-lg hover:scale-105"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  color: '#ffffff',
                  boxShadow: `0 0 14px ${activeVibe.colors.glow || activeVibe.colors.primary}`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 lg:w-4.5 lg:h-4.5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={next}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors relative"
                style={{
                  color: repeat !== 'off' ? activeVibe.colors.primary : 'var(--theme-text-muted)',
                }}
                title={`Repeat: ${repeat}`}
              >
                {repeat === 'track' ? (
                  <Repeat1 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                ) : (
                  <Repeat className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                )}
                {repeat !== 'off' && (
                  <span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: activeVibe.colors.primary }}
                  />
                )}
              </button>
            </div>

            {/* Bottom Progress Row: [0:00] ──●── [3:34] */}
            <MiniPlayerProgress activeVibe={activeVibe} />
          </div>

          {/* 3. Right Section: Volume Slider & Fullscreen Expand Trigger */}
          <div className="flex items-center justify-end gap-2 lg:gap-3 w-[28%] max-w-[240px] shrink-0">
            {/* Volume Control */}
            <div className="flex items-center gap-1.5 lg:gap-2">
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
                className="w-16 lg:w-20 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  accentColor: activeVibe.colors.primary,
                  backgroundColor: 'var(--theme-border, rgba(128,128,128,0.28))',
                }}
                title="Volume"
              />
            </div>

            {/* Expand into Full Player Modal */}
            <button
              onClick={openFullPlayer}
              className="p-1.5 lg:px-2.5 lg:py-1.5 rounded-xl hover:bg-white/10 transition-all text-xs flex items-center gap-1.5 shrink-0"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
              title="Expand Full Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px] font-medium">Expand</span>
            </button>
          </div>
        </div>

        {/* ─── MOBILE LAYOUT (< md) ─── */}
        <div className="flex md:hidden flex-col gap-1.5">
          {/* Top Row: Artwork + Track Info on Left, Compact Controls on Right */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* Left: Artwork + Title/Artist */}
            <div
              onClick={openFullPlayer}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
            >
              {/* Static Album Artwork */}
              <div
                className="w-10 h-10 rounded-lg shrink-0 aspect-square flex items-center justify-center relative overflow-hidden shadow-sm"
                style={{
                  background: currentTrack.coverArtUrl,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '1px solid var(--theme-border, rgba(255,255,255,0.15))',
                  transform: isPlaying ? 'scale(1.02)' : 'scale(1.0)',
                }}
              >
                <Music className="w-4 h-4 text-white/60" />
              </div>

              {/* Title, Artist, and Vibe */}
              <div className="min-w-0 flex-1 text-left">
                <h4
                  className="text-xs font-semibold truncate leading-tight"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {currentTrack.title}
                </h4>
                <div
                  className="text-[10px] truncate font-normal leading-tight mt-0.5 flex items-center gap-1"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <span className="truncate">{currentTrack.artist}</span>
                  {(playbackContext || currentVibeContext) && (
                    <span className="shrink-0 opacity-80">· {(playbackContext || currentVibeContext).emoji}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Essential Playback Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={previous}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md"
                style={{
                  backgroundColor: activeVibe.colors.primary,
                  color: '#ffffff',
                  boxShadow: `0 0 10px ${activeVibe.colors.glow || activeVibe.colors.primary}`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors active:scale-95"
                style={{ color: 'var(--theme-text-primary)' }}
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={openFullPlayer}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  color: 'var(--theme-text-primary)',
                  border: '1px solid var(--theme-border)',
                }}
                title="Expand Full Player"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Full-width Progress Bar [0:00] ──●── [3:34] */}
          <MiniPlayerProgress activeVibe={activeVibe} />
        </div>
      </div>
    </div>
  );
}
