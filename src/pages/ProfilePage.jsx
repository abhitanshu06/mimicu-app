import React from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import { User, Cpu, Shield, Sparkles, Palette } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useVibeStore } from '../stores/vibeStore';

/**
 * ProfilePage
 * User preferences, active vibe telemetry, graphics tier, and theme selector trigger.
 */
export default function ProfilePage() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const openThemeModal = useThemeStore((state) => state.openThemeModal);
  const activeVibe = useVibeStore((state) => state.activeVibe);

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-8 sm:pt-14 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-10">
        <GlassBadge variant="default" className="mb-4">
          <User className="w-3.5 h-3.5 text-purple-400" />
          <span>Spatial Profile</span>
        </GlassBadge>
        <h1 className="text-3xl sm:text-5xl font-display font-bold mb-3 tracking-tight">
          User Settings
        </h1>
        <p className="text-sm sm:text-base text-vibe-textMuted max-w-lg mx-auto font-light">
          Manage your audio-visual preferences, active theme styling, and session telemetry.
        </p>
      </div>

      {/* Profile Card */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{
              background: 'linear-gradient(to bottom-right, rgba(168,85,247,0.40), rgba(56,189,248,0.30))',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            M
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Mimicu Explorer</h2>
            <p className="text-xs font-light" style={{ color: 'var(--theme-text-muted)' }}>Guest Session • Local Storage Mode</p>
          </div>
        </div>

        <div
          className="space-y-3 pt-4 text-sm"
          style={{ borderTop: '1px solid var(--theme-border)' }}
        >
          {/* Active Vibe */}
          <div className="flex justify-between items-center py-2">
            <span className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} /> Active 3D Vibe
            </span>
            <span
              className="font-semibold text-xs px-2.5 py-1 rounded-lg"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                border: '1px solid var(--theme-border)',
                color: activeVibe.colors.primary,
              }}
            >
              {activeVibe.name}
            </span>
          </div>

          {/* Active Application Theme */}
          <div className="flex justify-between items-center py-2">
            <span className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
              <Palette className="w-4 h-4 text-sky-400" /> Application Theme
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                {currentTheme.name}
              </span>
              <button
                onClick={openThemeModal}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* 3D Graphics Tier */}
          <div className="flex justify-between items-center py-2">
            <span className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
              <Cpu className="w-4 h-4 text-emerald-400" /> 3D Graphics Tier
            </span>
            <span className="text-emerald-400 font-medium text-xs">Adaptive Balanced (60 FPS)</span>
          </div>

          {/* Security */}
          <div className="flex justify-between items-center py-2">
            <span className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
              <Shield className="w-4 h-4 text-amber-400" /> Session Security
            </span>
            <span className="text-amber-400 font-medium text-xs">Local Sandbox (Persistent)</span>
          </div>
        </div>
      </GlassCard>

      {/* Phase Info */}
      <GlassCard className="text-center py-6">
        <p className="text-xs sm:text-sm text-vibe-textMuted font-light">
          Account authentication, cloud syncing, and custom soundstage presets will be enabled in Phase 9.
        </p>
      </GlassCard>
    </div>
  );
}
