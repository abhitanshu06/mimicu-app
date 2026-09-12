import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import { useThemeStore } from '../stores/themeStore';
import { useVibeStore } from '../stores/vibeStore';
import { audioReactiveManager } from '../utils/audioReactiveManager';
import { 
  Settings, 
  Palette, 
  Sliders, 
  Volume2, 
  Radio, 
  Bell, 
  ShieldCheck, 
  Info, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import mascotLogo from '../../mimicu.png';

/**
 * SettingsPage
 * 
 * Accessible at `/settings`.
 * Manages preferences across:
 * - Appearance (Seamlessly integrates with the existing Theme system)
 * - Playback (Streaming fidelity, auto-advance, crossfade)
 * - Audio (Spatial acoustic engine & shortcut to Equalizer)
 * - Notifications (Vibe transition notifications)
 * - Privacy (Local preferences storage)
 * - About Mimicu
 */
export default function SettingsPage({ onNavigate }) {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const toggleThemeModal = useThemeStore((state) => state.toggleThemeModal);

  // Playback local preferences
  const [reactiveMode, setReactiveMode] = useState(audioReactiveManager.mode);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [crossfade, setCrossfade] = useState('2s');
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSetReactiveMode = (mode) => {
    audioReactiveManager.setMode(mode);
    setReactiveMode(mode);
  };

  const handleResetDefaults = () => {
    setAutoAdvance(true);
    setCrossfade('2s');
    setSpatialAudio(true);
    setDesktopNotifications(false);
    handleSetReactiveMode('responsive');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-4 sm:pt-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="mb-8">
        <GlassBadge 
          variant="glow" 
          pulse 
          className="mb-3"
          style={{
            borderColor: `${activeVibe.colors.primary}60`,
            boxShadow: `0 0 16px ${activeVibe.colors.glow}`,
          }}
        >
          <Settings className="w-3.5 h-3.5" style={{ color: activeVibe.colors.primary }} />
          <span>System & Audio Preferences</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
          Settings
        </h1>
        <p className="text-sm font-light leading-relaxed max-w-xl" style={{ color: 'var(--theme-text-muted)' }}>
          Configure playback temperament, spatial acoustic rendering, appearance styles, and environment settings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* 1. Appearance & Theme Settings */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
              >
                <Palette className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Appearance</h2>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Custom UI palettes and glass luminosity</p>
              </div>
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={Palette}
              onClick={toggleThemeModal}
            >
              Change Theme
            </GlassButton>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-5 h-5 rounded-full shadow-sm"
                style={{ backgroundColor: activeTheme?.tokens?.accent || 'var(--theme-accent)', border: '2px solid rgba(255,255,255,0.2)' }}
              />
              <div>
                <span className="text-sm font-semibold block" style={{ color: 'var(--theme-text-primary)' }}>
                  {activeTheme?.name || 'Active Theme'}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  {activeTheme?.family} • {activeTheme?.mode?.toUpperCase()} • {activeTheme?.style?.toUpperCase()} — {activeTheme?.tagline}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text-secondary)', border: '1px solid var(--theme-border)' }}>
              Active
            </span>
          </div>
        </GlassCard>

        {/* 2. Playback Settings */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
            >
              <Radio className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Playback</h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Audio engine streaming behavior</p>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* Auto-Advance */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
              <div>
                <span className="text-sm font-medium block" style={{ color: 'var(--theme-text-primary)' }}>
                  Continuous Queue Playback
                </span>
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Automatically advance to next track in the vibe playlist
                </span>
              </div>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${autoAdvance ? 'bg-purple-600' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoAdvance ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Crossfade */}
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
              <div>
                <span className="text-sm font-medium block" style={{ color: 'var(--theme-text-primary)' }}>
                  Crossfade Duration
                </span>
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Smooth transition between consecutive songs
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {['Off', '2s', '5s'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCrossfade(val)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: crossfade === val ? 'var(--theme-surface-elevated)' : 'transparent',
                      border: crossfade === val ? `1px solid ${activeVibe.colors.primary}` : '1px solid transparent',
                      color: crossfade === val ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 3. Audio & Acoustic Architecture */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
              >
                <Volume2 className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Audio & Acoustics</h2>
                <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Hardware DSP and spatial soundstage</p>
              </div>
            </div>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={Sliders}
              onClick={() => onNavigate && onNavigate('/equalizer')}
            >
              Open Equalizer
            </GlassButton>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--theme-text-primary)' }}>
                Web Audio Spatial DSP Pipeline
              </span>
              <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                Multi-band BiquadFilter (120Hz Bass, 1000Hz Mid, 7000Hz Treble) active
              </span>
            </div>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Connected
            </span>
          </div>

          {/* Audio-Reactive 3D Environments */}
          <div className="flex flex-col gap-2 mt-3.5 pt-3.5 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-semibold block" style={{ color: 'var(--theme-text-primary)' }}>
                  Audio-Reactive 3D Environments
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  Cinematic lighting, atmospheric fog, and particle breathing synchronized with music
                  {audioReactiveManager.prefersReducedMotion && (
                    <span className="text-amber-400 font-medium ml-1.5">• OS Reduced Motion Active</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {[
                  { id: 'responsive', label: 'Responsive' },
                  { id: 'subtle', label: 'Subtle' },
                  { id: 'off', label: 'Off' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleSetReactiveMode(mode.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: reactiveMode === mode.id ? 'var(--theme-surface-elevated)' : 'transparent',
                      border: reactiveMode === mode.id ? `1px solid ${activeVibe.colors.primary}` : '1px solid transparent',
                      color: reactiveMode === mode.id ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 4. Notifications & Privacy */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4 border-b pb-3" style={{ borderColor: 'var(--theme-border)' }}>
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: activeVibe.colors.primary }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Privacy & Storage</h2>
              <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>Local state and preferences security</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}>
              <div>
                <span className="text-sm font-medium block" style={{ color: 'var(--theme-text-primary)' }}>
                  Local Device Storage
                </span>
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                  Preferences, equalizer profiles, and active themes stored safely in local browser storage
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400">100% Client-Side</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory Defaults</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-medium animate-fadeIn">
                  Settings restored to defaults
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* 5. About Mimicu */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center p-1 shrink-0"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
            >
              <img src={mascotLogo} alt="Mimicu Mascot" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold font-display tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                  MIMICU
                </h3>
                <GlassBadge variant="default" className="text-[10px] py-0 px-2">
                  v0.4.2 Spatial
                </GlassBadge>
              </div>
              <p className="text-xs leading-relaxed font-light mb-1" style={{ color: 'var(--theme-text-muted)' }}>
                Experiential atmosphere music engine and 3D ambient worlds designed for deep focus, solitude, and vibe coding.
              </p>
              <span className="text-[10px] font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                Powered by Three.js, React Three Fiber & Web Audio API
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
