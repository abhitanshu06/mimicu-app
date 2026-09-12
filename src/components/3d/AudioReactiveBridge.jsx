import React from 'react';
import { useFrame } from '@react-three/fiber';
import { audioReactiveManager } from '../../utils/audioReactiveManager';

/**
 * AudioReactiveBridge
 * 
 * Headless R3F synchronization bridge that drives `audioReactiveManager`
 * on every animation frame within the WebGL render loop.
 * 
 * Architectural Highlights:
 * 1. Zero DOM footprint: Returns null.
 * 2. Zero React re-renders: Never modifies React state or triggers reconciliation.
 * 3. Frame-rate independent: Passes delta time to maintain identical visual damping across 60Hz/120Hz/144Hz displays.
 */
export default function AudioReactiveBridge() {
  useFrame((_, delta) => {
    audioReactiveManager.update(delta);
  });

  return null;
}
