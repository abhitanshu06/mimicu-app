import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useVibeStore } from '../../stores/vibeStore';
import { audioReactiveManager } from '../../utils/audioReactiveManager';

/**
 * CameraRig
 * 
 * Experiential Camera Controller that adapts to each vibe:
 * - Walking head-bobbing simulation for street/terrace walks
 * - Smooth mouse parallax tracking
 * - Page scroll depth penetration
 * - Subtle audio-reactive depth breathing (clamped, disabled under reduced-motion)
 */
export default function CameraRig({
  parallaxFactor = 0.35,
  scrollFactor = 1.2,
}) {
  const { camera } = useThree();
  const scrollProgressRef = useRef(0);

  // Lightweight scroll listener to compute normalized scroll progress [0, 1]
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      scrollProgressRef.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame((state, delta) => {
    const targetVibe = useVibeStore.getState().targetVibe;
    const cameraConfig = targetVibe?.visualWorld?.camera || { baseZ: 5.0, walkingBob: false };

    const pointer = state.pointer; // Normalized [-1, 1]
    const scroll = scrollProgressRef.current; // [0, 1]
    const time = state.clock.elapsedTime;

    // Audio-Reactive Telemetry
    const audio = audioReactiveManager.getValues();
    const canReactCamera = !audioReactiveManager.prefersReducedMotion && audioReactiveManager.mode !== 'off';
    const camFactor = canReactCamera ? (audio.profile?.cameraResponse ?? 0.12) : 0;

    // 1. Walking Head-Bob Simulation (if enabled for the vibe)
    let bobX = 0;
    let bobY = 0;
    if (cameraConfig.walkingBob) {
      bobY = Math.sin(time * 3.2) * 0.035;
      bobX = Math.cos(time * 1.6) * 0.02;
    }

    // 2. Subtle Audio-Reactive Depth Breathing (Organic micro-drift, zero aggressive shaking)
    const audioBreathZ = (Math.sin(audio.pulse) * 0.016 * audio.bass + audio.overallEnergy * 0.012) * camFactor;
    const audioBreathTiltY = Math.cos(audio.pulse * 0.5) * 0.006 * audio.mid * camFactor;

    // 3. Target Camera Position Calculation (Clamped for UI safe area)
    const baseZ = cameraConfig.baseZ || 5.0;
    const targetX = pointer.x * parallaxFactor + bobX;
    const targetY = pointer.y * (parallaxFactor * 0.5) - scroll * 0.35 + bobY;
    const targetZ = Math.max(baseZ - scroll * 0.7 + audioBreathZ, 4.25);

    // 4. Smoothly damp camera coordinates
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.5, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.5, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, delta);

    // 5. Subtle camera tilt
    const targetRotX = pointer.y * 0.04 - scroll * 0.08;
    const targetRotY = -pointer.x * 0.06 + audioBreathTiltY;

    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, targetRotX, 2.5, delta);
    camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, targetRotY, 2.5, delta);
  });

  return null;
}
