import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import Environment from './Environment';
import SceneManager from './SceneManager';
import AudioReactiveBridge from './AudioReactiveBridge';
import ErrorBoundary from '../common/ErrorBoundary';

// Detect mobile once at module init — used to scale GPU workload appropriately.
// Mobile screens are high-DPR so MSAA adds cost without visible benefit.
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * SceneCanvas
 *
 * Master WebGL 3D Canvas wrapper for Mimicu.
 *
 * Key Architectural Decisions:
 * 1. Persistent: Stays mounted at the AppShell root level across all route changes.
 * 2. Non-blocking: Positioned at z-0 with pointer-events-none so glass UI clicks pass through.
 * 3. Performance-first:
 *    - Desktop: DPR clamped to [1, 1.5] with MSAA antialiasing.
 *    - Mobile: DPR clamped to [1, 1.2] with antialiasing disabled to reduce GPU load.
 *    - Adaptive: R3F performance monitor can regress DPR to 1 on slow devices.
 * 4. Resilient: Protected by ErrorBoundary & WebGL context-loss recovery.
 * 5. Tab Visibility: Canvas frameloop paused to 'never' when the tab is hidden,
 *    saving 100% GPU/CPU in background. Resumed when the tab is visible again.
 */
export default function SceneCanvas() {
  // Track page visibility to pause rendering when the tab is hidden.
  const [frameloop, setFrameloop] = useState('always');
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Mimicu 3D] WebGL Canvas mounted and persistent across route transitions.');
    }

    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible';
      isVisibleRef.current = visible;
      // Pause rendering entirely when the tab is hidden — saves 100% GPU in background.
      setFrameloop(visible ? 'always' : 'never');
    };

    document.addEventListener('visibilitychange', handleVisibility, { passive: true });
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      id="mimicu-webgl-root"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <ErrorBoundary fallback={<div className="fixed inset-0 pointer-events-none" />}>
        <Canvas
          frameloop={frameloop}
          camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
          dpr={isMobile ? [1, 1.2] : [1, 1.5]}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            const dom = gl?.domElement;
            if (dom) {
              dom.addEventListener(
                'webglcontextlost',
                (e) => {
                  e.preventDefault();
                  console.warn('[Mimicu 3D] WebGL context lost. Attempting recovery...');
                },
                false
              );
              dom.addEventListener(
                'webglcontextrestored',
                () => {
                  console.log('[Mimicu 3D] WebGL context successfully restored.');
                },
                false
              );
            }
          }}
          className="w-full h-full pointer-events-none"
        >
          <Suspense fallback={null}>
            <AudioReactiveBridge />
            <CameraRig basePosition={[0, 0, 5]} />
            <Environment />
            <SceneManager />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
