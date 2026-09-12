import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVibeStore } from '../../stores/vibeStore';

// Modular Experiential 3D Worlds
import UrbanNightWorld from './worlds/UrbanNightWorld';
import RooftopWorld from './worlds/RooftopWorld';
import HighwayWorld from './worlds/HighwayWorld';
import RainWindowWorld from './worlds/RainWindowWorld';
import MinimalSanctuaryWorld from './worlds/MinimalSanctuaryWorld';
import NatureWorld from './worlds/NatureWorld';
import CelestialWorld from './worlds/CelestialWorld';
import KineticCyberWorld from './worlds/KineticCyberWorld';
import ChaiTapriWorld from './worlds/ChaiTapriWorld';
import GamingWorld from './worlds/GamingWorld';
import CodingLateNightWorld from './worlds/CodingLateNightWorld';

/**
 * SceneManager
 * 
 * Central coordinator mapping the active vibe's `visualWorld.environmentType`
 * to the appropriate modular 3D world archetype.
 * Handles smooth cinematic crossfades between worlds.
 */
export default function SceneManager() {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const targetVibe = useVibeStore((state) => state.targetVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const transitionProgress = useVibeStore((state) => state.transitionProgress);

  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // During transition, create subtle camera/world breath effect
    if (isTransitioning) {
      // Gentle depth scale dip during transition
      const targetScale = 0.96 + transitionProgress * 0.04;
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 4, delta)
      );
    } else {
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, 1.0, 4, delta)
      );
    }
  });

  // Pick display vibe (target if mid-transition or active)
  const currentVibe = isTransitioning && transitionProgress > 0.5 ? targetVibe : activeVibe;
  const envType = currentVibe?.visualWorld?.environmentType || 'celestial';

  const renderWorld = () => {
    switch (envType) {
      case 'chai-tapri':
        return <ChaiTapriWorld vibe={currentVibe} />;
      case 'gaming':
        return <GamingWorld vibe={currentVibe} />;
      case 'urban-night':
        return <UrbanNightWorld vibe={currentVibe} />;
      case 'rooftop':
        return <RooftopWorld vibe={currentVibe} />;
      case 'highway':
        return <HighwayWorld vibe={currentVibe} />;
      case 'rain-window':
        return <RainWindowWorld vibe={currentVibe} />;
      case 'minimal-focus':
        return <MinimalSanctuaryWorld vibe={currentVibe} />;
      case 'coding':
        return <CodingLateNightWorld vibe={currentVibe} />;
      case 'nature':
        return <NatureWorld vibe={currentVibe} />;
      case 'celestial':
        return <CelestialWorld vibe={currentVibe} />;
      case 'kinetic-cyber':
      default:
        return <KineticCyberWorld vibe={currentVibe} />;
    }
  };

  return (
    <group ref={groupRef}>
      {renderWorld()}
    </group>
  );
}
