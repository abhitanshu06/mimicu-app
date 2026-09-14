import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useThemeStore } from '../../stores/themeStore.js';

export default function AuthModal() {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const authModalMode = useAuthStore((state) => state.authModalMode);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const setAuthModalMode = useAuthStore((state) => state.setAuthModalMode);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const activeTheme = useThemeStore((state) => state.currentTheme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const isRegister = authModalMode === 'register';

  useEffect(() => {
    if (isAuthModalOpen) {
      setLocalError('');
      // Prevent background scrolling while modal is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setName('');
      setEmail('');
      setPassword('');
      setLocalError('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isRegister && (!name.trim() || name.trim().length < 2)) {
      setLocalError('Name must be at least 2 characters');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const displayError = localError || storeError;

  return createPortal(
    <div
      className="fixed inset-0 z-[995] flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative animate-scaleIn transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-card-bg, rgba(15, 23, 42, 0.88))',
          backdropFilter: 'blur(var(--theme-glass-blur, 32px))',
          WebkitBackdropFilter: 'blur(var(--theme-glass-blur, 32px))',
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
          boxShadow: '0 25px 50px -12px var(--theme-shadow-strong, rgba(0, 0, 0, 0.5))',
          color: 'var(--theme-text-primary, #ffffff)',
        }}
      >
        {/* Modal Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 z-10"
          style={{
            backgroundColor: 'var(--theme-btn-secondary, rgba(255, 255, 255, 0.08))',
            color: 'var(--theme-text-muted, #94a3b8)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
          }}
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 text-center">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(56,189,248,0.3) 100%)',
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.15))',
            }}
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-2">
            {isRegister ? 'Join Mimicu' : 'Welcome Back'}
          </h2>
          <p
            className="text-xs sm:text-sm font-light max-w-xs mx-auto"
            style={{ color: 'var(--theme-text-muted, #94a3b8)' }}
          >
            {isRegister
              ? 'Create your account to sync your playlists, likes, and spatial vibes across devices.'
              : 'Sign in to access your cloud playlists, favorites, and spatial worlds.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 sm:px-8 mb-4">
          <div
            className="flex p-1 rounded-xl"
            style={{
              backgroundColor: 'var(--theme-btn-secondary, rgba(255, 255, 255, 0.06))',
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
            }}
          >
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                !isRegister
                  ? 'shadow-md scale-[1.02]'
                  : 'hover:text-white opacity-70 hover:opacity-100'
              }`}
              style={
                !isRegister
                  ? {
                      backgroundColor: 'var(--theme-card-bg, #1e293b)',
                      color: 'var(--theme-text-primary, #ffffff)',
                      border: '1px solid var(--theme-border, rgba(255,255,255,0.12))',
                    }
                  : {}
              }
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                isRegister
                  ? 'shadow-md scale-[1.02]'
                  : 'hover:text-white opacity-70 hover:opacity-100'
              }`}
              style={
                isRegister
                  ? {
                      backgroundColor: 'var(--theme-card-bg, #1e293b)',
                      color: 'var(--theme-text-primary, #ffffff)',
                      border: '1px solid var(--theme-border, rgba(255,255,255,0.12))',
                    }
                  : {}
              }
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-8 space-y-4">
          {displayError && (
            <div
              className="px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-shake"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
              }}
            >
              <span>{displayError}</span>
            </div>
          )}

          {isRegister && (
            <div>
              <label
                className="block text-[11px] font-medium uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--theme-text-secondary, #cbd5e1)' }}
              >
                Your Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/80" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--theme-btn-secondary, rgba(255, 255, 255, 0.05))',
                    border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                    color: 'var(--theme-text-primary, #ffffff)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--theme-accent, #a855f7)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.1))';
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-[11px] font-medium uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--theme-text-secondary, #cbd5e1)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/80" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                  color: 'var(--theme-text-primary, #ffffff)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent, #a855f7)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.1))';
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[11px] font-medium uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--theme-text-secondary, #cbd5e1)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/80" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--theme-btn-secondary, rgba(255, 255, 255, 0.05))',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                  color: 'var(--theme-text-primary, #ffffff)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent, #a855f7)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.1))';
                }}
              />
            </div>
            {isRegister && (
              <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted, #94a3b8)' }}>
                Minimum 6 characters. Passwords are securely hashed.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50"
            style={{
              backgroundColor: 'var(--theme-accent, #a855f7)',
              color: '#ffffff',
              boxShadow: '0 8px 20px -4px rgba(168, 85, 247, 0.4)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span style={{ color: 'var(--theme-text-muted, #94a3b8)' }}>
              Protected by HTTP-only secure cookie sessions
            </span>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
