import React from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import GlassButton from '../components/common/GlassButton';
import { useEqualizerStore, EQUALIZER_PRESETS } from '../stores/equalizerStore';
import { useVibeStore } from '../stores/vibeStore';
import { Sliders, Volume2, Sparkles, RotateCcw, Headphones, Radio } from 'lucide-react';

/**
 * EqualizerPage
 * 
 * Master Acoustic Architecture Interface at route `/equalizer`.
 * Features:
 * - 7 Presets: Balanced, Deep Bass, Focus, Night Drive, Cinema, Studio, Chill
 * - Interactive Frequency Bands: Bass (-12 to +12 dB), Mid (-12 to +12 dB), Treble (-12 to +12 dB)
 * - Spatial Audio & Immersion Soundstage Controls
 * - Simulated Acoustic Waveform Response Curve
 * - Ready for Web Audio API DSP connection in Phase 4
 */
export default function EqualizerPage() {
  const activeVibe = useVibeStore((state) => state.activeVibe);

  const activePreset = useEqualizerStore((state) => state.activePreset);
  const bass = useEqualizerStore((state) => state.bass);
  const mid = useEqualizerStore((state) => state.mid);
  const treble = useEqualizerStore((state) => state.treble);
  const immersion = useEqualizerStore((state) => state.immersion);
  const spatialAudio = useEqualizerStore((state) => state.spatialAudio);

  const setPreset = useEqualizerStore((state) => state.setPreset);
  const setBand = useEqualizerStore((state) => state.setBand);
  const setImmersion = useEqualizerStore((state) => state.setImmersion);
  const toggleSpatialAudio = useEqualizerStore((state) => state.toggleSpatialAudio);
  const resetEqualizer = useEqualizerStore((state) => state.resetEqualizer);

  const presets = Object.keys(EQUALIZER_PRESETS);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full pt-6 sm:pt-10 animate-fadeIn">
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
          <Sliders className="w-3.5 h-3.5" style={{ color: activeVibe.colors.primary }} />
          <span>Acoustic Equalizer & Soundstage</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          Spatial Equalizer
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-xl mx-auto font-light">
          Sculpt your sonic profile with multi-band frequency controls and spatial soundstage immersion.
        </p>
      </div>

      {/* Preset Selector Chips */}
      <GlassCard className="mb-8 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-white/70 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            Acoustic Presets
          </span>
          <button
            onClick={resetEqualizer}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
            title="Reset to Flat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const isSelected = activePreset === preset;
            return (
              <button
                key={preset}
                onClick={() => setPreset(preset)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? 'var(--theme-surface-elevated)' : 'var(--theme-btn-secondary)',
                  border: isSelected
                    ? `1px solid ${activeVibe.colors.primary}`
                    : '1px solid var(--theme-border)',
                  color: isSelected ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
                  boxShadow: isSelected ? `0 0 14px ${activeVibe.colors.glow}` : undefined,
                  transform: isSelected ? 'scale(1.02)' : undefined,
                }}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Main Frequency Equalizer Faders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* BASS */}
        <GlassCard className="flex flex-col items-center justify-between p-6">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-primary)' }}>Bass</span>
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                border: '1px solid var(--theme-border)',
                color: activeVibe.colors.primary,
              }}
            >
              {bass > 0 ? `+${bass}` : bass} dB
            </span>
          </div>

          <div className="w-full flex flex-col items-center my-4">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={bass}
              onChange={(e) => setBand('bass', e.target.value)}
              className="w-full accent-purple-500 cursor-pointer h-2 rounded-lg"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
            <div className="w-full flex justify-between text-[10px] mt-2 font-mono" style={{ color: 'var(--theme-text-muted)' }}>
              <span>-12 dB</span>
              <span>0 dB</span>
              <span>+12 dB</span>
            </div>
          </div>

          <p className="text-[11px] text-center font-light" style={{ color: 'var(--theme-text-muted)' }}>
            Low frequency energy (20 Hz - 250 Hz)
          </p>
        </GlassCard>

        {/* MID */}
        <GlassCard className="flex flex-col items-center justify-between p-6">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-primary)' }}>Mid</span>
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)', color: activeVibe.colors.secondary }}
            >
              {mid > 0 ? `+${mid}` : mid} dB
            </span>
          </div>
          <div className="w-full flex flex-col items-center my-4">
            <input
              type="range" min="-12" max="12" step="1" value={mid}
              onChange={(e) => setBand('mid', e.target.value)}
              className="w-full accent-sky-400 cursor-pointer h-2 rounded-lg"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
            <div className="w-full flex justify-between text-[10px] mt-2 font-mono" style={{ color: 'var(--theme-text-muted)' }}>
              <span>-12 dB</span><span>0 dB</span><span>+12 dB</span>
            </div>
          </div>
          <p className="text-[11px] text-center font-light" style={{ color: 'var(--theme-text-muted)' }}>Vocal &amp; instrumental core (250 Hz - 4 kHz)</p>
        </GlassCard>

        {/* TREBLE */}
        <GlassCard className="flex flex-col items-center justify-between p-6">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-primary)' }}>Treble</span>
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)', color: activeVibe.colors.accent }}
            >
              {treble > 0 ? `+${treble}` : treble} dB
            </span>
          </div>
          <div className="w-full flex flex-col items-center my-4">
            <input
              type="range" min="-12" max="12" step="1" value={treble}
              onChange={(e) => setBand('treble', e.target.value)}
              className="w-full accent-amber-400 cursor-pointer h-2 rounded-lg"
              style={{ backgroundColor: 'var(--theme-border)' }}
            />
            <div className="w-full flex justify-between text-[10px] mt-2 font-mono" style={{ color: 'var(--theme-text-muted)' }}>
              <span>-12 dB</span><span>0 dB</span><span>+12 dB</span>
            </div>
          </div>
          <p className="text-[11px] text-center font-light" style={{ color: 'var(--theme-text-muted)' }}>High presence &amp; shimmer (4 kHz - 20 kHz)</p>
        </GlassCard>
      </div>

      {/* Spatial Soundstage & Immersion Module */}
      <GlassCard className="p-6 sm:p-8 mb-12">
        <div
          className="flex items-center justify-between mb-6 pb-4"
          style={{ borderBottom: '1px solid var(--theme-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--theme-btn-secondary)', border: '1px solid var(--theme-border)' }}
            >
              <Headphones className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-wide" style={{ color: 'var(--theme-text-primary)' }}>
                Spatial Audio &amp; Soundstage
              </h3>
              <p className="text-xs font-light" style={{ color: 'var(--theme-text-muted)' }}>
                Expands stereo perception into a 3D binaural listening field.
              </p>
            </div>
          </div>

          {/* Spatial Toggle Button */}
          <button
            onClick={toggleSpatialAudio}
            className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300"
            style={{
              background: spatialAudio
                ? 'linear-gradient(to right, rgb(147,51,234), rgb(56,189,248))'
                : 'var(--theme-btn-secondary)',
              border: spatialAudio ? '1px solid rgba(255,255,255,0.4)' : '1px solid var(--theme-border)',
              color: spatialAudio ? '#ffffff' : 'var(--theme-text-secondary)',
              transform: spatialAudio ? 'scale(1.05)' : undefined,
            }}
          >
            {spatialAudio ? 'Spatial On' : 'Spatial Off'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Atmosphere Immersion</span>
            <span className="text-xs font-mono font-bold text-sky-400">{immersion}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={immersion}
            onChange={(e) => setImmersion(e.target.value)}
            className="w-full accent-sky-400 cursor-pointer h-2 rounded-lg"
            style={{ backgroundColor: 'var(--theme-border)' }}
          />

          <div className="flex justify-between text-[11px] font-light" style={{ color: 'var(--theme-text-muted)' }}>
            <span>Intimate Studio</span>
            <span>Natural Room</span>
            <span>Cosmic Arena</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
