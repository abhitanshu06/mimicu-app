import React, { useState } from 'react';
import GlassCard from '../components/common/GlassCard';
import GlassBadge from '../components/common/GlassBadge';
import { User, Cpu, Shield, Sparkles, Palette, LogIn, LogOut, Check, Edit2, Loader2 } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useVibeStore } from '../stores/vibeStore';
import { useAuthStore } from '../stores/authStore';

/**
 * ProfilePage
 * User account management, cloud sync status, active vibe telemetry, and theme styling.
 */
export default function ProfilePage() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const openThemeModal = useThemeStore((state) => state.openThemeModal);
  const activeVibe = useVibeStore((state) => state.activeVibe);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleStartEdit = () => {
    setNameInput(user?.name || '');
    setIsEditing(true);
    setUpdateSuccess(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) return;
    setIsUpdating(true);
    try {
      await updateProfile({ name: nameInput.trim() });
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (_) {}
    setIsUpdating(false);
  };

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
          Manage your account identity, audio-visual preferences, and active theme styling.
        </p>
      </div>

      {/* Profile Card */}
      <GlassCard className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg"
              style={{
                background: user?.avatar || 'linear-gradient(to bottom-right, rgba(168,85,247,0.40), rgba(56,189,248,0.30))',
                border: '1px solid var(--theme-border)',
                color: '#ffffff',
              }}
            >
              {isAuthenticated && user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                      {user?.name}
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={handleStartEdit}
                        className="p-1 rounded-lg transition-opacity hover:opacity-100 opacity-60"
                        title="Edit name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs font-light" style={{ color: 'var(--theme-text-muted)' }}>
                    {user?.email} • Cloud Synchronized
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    Mimicu Explorer
                  </h2>
                  <p className="text-xs font-light" style={{ color: 'var(--theme-text-muted)' }}>
                    Guest Session • Local Storage Mode
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Auth Action Buttons */}
          <div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                style={{
                  backgroundColor: 'var(--theme-accent, #a855f7)',
                  color: '#ffffff',
                }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Name Inline Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mb-6 p-3 rounded-xl flex items-center gap-2" style={{ backgroundColor: 'var(--theme-btn-secondary)' }}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Name"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg outline-none"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={isUpdating}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white flex items-center gap-1.5"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1.5 text-xs rounded-lg opacity-70 hover:opacity-100"
            >
              Cancel
            </button>
          </form>
        )}

        {updateSuccess && (
          <div className="mb-4 text-xs text-emerald-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Profile name updated successfully.</span>
          </div>
        )}

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
            <span className="font-medium text-xs flex items-center gap-1.5" style={{ color: isAuthenticated ? '#34d399' : '#fbbf24' }}>
              {isAuthenticated ? 'Authenticated (HTTP-only JWT)' : 'Local Sandbox (Guest Mode)'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Account / Cloud Sync Card */}
      <GlassCard className="text-center py-6">
        {isAuthenticated ? (
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm font-light text-emerald-300 flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Phase 9 Authentication Active • Cloud Syncing Enabled</span>
            </p>
            <p className="text-[11px] text-vibe-textMuted font-light max-w-md">
              Your liked tracks, playlists, and saved atmospheric vibes are securely synchronized with MongoDB.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-xs sm:text-sm text-vibe-textMuted font-light mb-3">
              Sign in to sync your custom playlists, liked tracks, and listening history to the cloud.
            </p>
            <button
              onClick={() => openAuthModal('register')}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'var(--theme-btn-secondary)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            >
              Create Free Account
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
