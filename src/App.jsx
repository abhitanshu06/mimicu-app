import React, { useState, useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VibesPage from './pages/VibesPage';
import LibraryPage from './pages/LibraryPage';
import EqualizerPage from './pages/EqualizerPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ThemeSelector from './components/theme/ThemeSelector';
import AudioReactiveDebug from './components/dev/AudioReactiveDebug';

import VibePage from './pages/VibePage';

/**
 * Master Application Component
 * 
 * Implements a lightweight, zero-dependency HTML5 History routing system
 * supporting:
 * - '/' (Home)
 * - '/search' (Search & Discovery)
 * - '/vibes' & '/themes' (Atmospheric Worlds Library)
 * - '/vibes/:vibeId' (Personalized Vibe Music Experience Page)
 * - '/equalizer' (Acoustic Equalizer)
 * - '/library' (Saved Worlds & Playlists)
 * - '/profile' (User Profile & Preferences)
 * - '/settings' (System & Audio Preferences)
 */
export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  // Keep state synchronized with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation handler
  const handleNavigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Render appropriate view based on route
  const renderCurrentPage = () => {
    // Dynamic Personalized Vibe Route: /vibes/:vibeId
    if (currentPath.startsWith('/vibes/')) {
      const vibeId = currentPath.replace('/vibes/', '').split('/')[0].split('?')[0];
      return <VibePage vibeId={vibeId} onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case '/search':
        return <SearchPage onNavigate={handleNavigate} />;
      case '/vibes':
      case '/themes':
        return <VibesPage onNavigate={handleNavigate} />;
      case '/equalizer':
        return <EqualizerPage onNavigate={handleNavigate} />;
      case '/library':
        return <LibraryPage onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case '/settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case '/':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell 
      currentPath={currentPath} 
      onNavigate={handleNavigate}
    >
      {renderCurrentPage()}
      {/* Global Application Theme Selector Modal */}
      <ThemeSelector />
      {/* Dev-only Audio-Reactive Debug HUD */}
      <AudioReactiveDebug />
    </AppShell>
  );
}
