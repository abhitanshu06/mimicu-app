import React from 'react';
import TopNav from './TopNav';
import DesktopSidebar from './DesktopSidebar';
import FloatingDock from './FloatingDock';
import BackgroundCanvasPlaceholder from './BackgroundCanvasPlaceholder';
import SceneCanvas from '../3d/SceneCanvas';
import MiniPlayer from '../player/MiniPlayer';
import FullPlayer from '../player/FullPlayer';

/**
 * AppShell
 * 
 * Master application shell combining:
 * 1. Persistent cosmic backdrop & WebGL 3D Canvas
 * 2. Compact Left-Side Vertical Glass Sidebar (Desktop/Tablet)
 * 3. Minimal sticky Top Bar
 * 4. Scrollable primary content viewport
 * 5. Persistent floating music player (Phase 4)
 * 6. Floating bottom frosted glass dock (Mobile only)
 */
export default function AppShell({ 
  children, 
  currentPath = '/', 
  onNavigate,
}) {
  return (
    <div 
      className="relative min-h-screen w-full flex flex-col selection:bg-purple-500/30 selection:text-white transition-colors duration-500"
      style={{
        backgroundColor: 'var(--theme-bg, #090b12)',
        color: 'var(--theme-text-primary, #f8fafc)',
      }}
    >
      {/* 1. Persistent Canvas & Spatial Backdrop (WebGL R3F Canvas) */}
      <BackgroundCanvasPlaceholder />
      <SceneCanvas />

      {/* 2. Left-Side Vertical Glass Sidebar (Desktop / Tablet) */}
      <DesktopSidebar 
        currentPath={currentPath}
        onNavigate={onNavigate}
      />

      {/* 3. Top Floating Navigation (Mobile Brand + Top-Right Floating Controls) */}
      <TopNav 
        currentPath={currentPath}
        onNavigate={onNavigate}
        onProfileClick={() => onNavigate('/profile')}
      />

      {/* 4. Main Content Container with responsive sidebar and player offsets */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 md:pl-64 lg:pl-72 pt-20 pb-48 sm:pb-52 md:pb-36 lg:pb-40 flex flex-col transition-all duration-300">
        {children}
      </main>

      {/* 5. Persistent Floating Mini-Player (Phase 4) */}
      <MiniPlayer onNavigate={onNavigate} />

      {/* 6. Expandable Immersive Full-Screen Player Modal (Phase 4) */}
      <FullPlayer onNavigate={onNavigate} />

      {/* 7. Floating Frosted Bottom Navigation Dock (Mobile Only) */}
      <FloatingDock 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
      />
    </div>
  );
}
