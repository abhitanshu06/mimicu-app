import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * ErrorBoundary
 * 
 * Production resilience boundary for Mimicu.
 * Prevents runtime render exceptions in route pages or 3D canvas
 * from unmounting the React root and crashing audio playback.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary caught error]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            resetError: this.handleReset,
          });
        }
        return this.props.fallback;
      }

      // Default non-destructive Glass UI fallback
      return (
        <div className="flex-1 flex items-center justify-center min-h-[50vh] p-6 text-center animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
              border: '1px solid var(--theme-glass-border, rgba(255, 255, 255, 0.12))',
              boxShadow: '0 20px 40px -10px var(--theme-shadow-strong, rgba(0, 0, 0, 0.6))',
              color: 'var(--theme-text-primary, #ffffff)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-semibold mb-2">
              {this.props.title || 'Something went wrong in this view'}
            </h3>

            <p className="text-sm opacity-70 mb-6 font-light">
              Audio playback is still active in the background. You can retry loading this section or return to Home.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-purple-600/80 hover:bg-purple-600 border border-purple-500/30 text-white transition-all duration-200 cursor-pointer shadow-lg shadow-purple-900/30"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
