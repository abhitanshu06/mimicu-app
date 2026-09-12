import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import Environment from './Environment';
import SceneManager from './SceneManager';
import AudioReactiveBridge from './AudioReactiveBridge';

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
 */
export default function SceneCanvas() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Mimicu 3D] WebGL Canvas mounted and persistent across route transitions.');
    }
  }, []);

  return (
    <div
      id="mimicu-webgl-root"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 50 }}
        dpr={isMobile ? [1, 1.2] : [1, 1.5]}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: 'high-performance',
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
    </div>
  );
}
