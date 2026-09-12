import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import Environment from './Environment';
import SceneManager from './SceneManager';
import AudioReactiveBridge from './AudioReactiveBridge';

/**
 * SceneCanvas
 * 
 * Master WebGL 3D Canvas wrapper for Mimicu.
 * 
 * Key Architectural Decisions:
 * 1. Persistent: Stays mounted at the AppShell root level across all route changes.
 * 2. Non-blocking: Positioned at z-0 with pointer-events-none so glass UI clicks pass through.
 * 3. Performance-first: Clamped adaptive DPR [1, 1.5] to preserve mobile and low-power frame rates.
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
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
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
