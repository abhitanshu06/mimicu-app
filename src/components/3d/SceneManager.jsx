import React, { useRef, useState, useEffect, startTransition, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVibeStore } from '../../stores/vibeStore';

// KineticCyberWorld is the default/fallback world — always bundled to guarantee instant first render
import KineticCyberWorld from './worlds/KineticCyberWorld';

// All other worlds are lazy-loaded — their chunks only download when first selected.
// This removes ~160KB of unused JS from the initial bundle for users on a single Vibe.
const UrbanNightWorld = React.lazy(() => import('./worlds/UrbanNightWorld'));
const RooftopWorld = React.lazy(() => import('./worlds/RooftopWorld'));
const HighwayWorld = React.lazy(() => import('./worlds/HighwayWorld'));
const RainWindowWorld = React.lazy(() => import('./worlds/RainWindowWorld'));
const MinimalSanctuaryWorld = React.lazy(() => import('./worlds/MinimalSanctuaryWorld'));
const NatureWorld = React.lazy(() => import('./worlds/NatureWorld'));
const CelestialWorld = React.lazy(() => import('./worlds/CelestialWorld'));
const ChaiTapriWorld = React.lazy(() => import('./worlds/ChaiTapriWorld'));
const GamingWorld = React.lazy(() => import('./worlds/GamingWorld'));
const CodingLateNightWorld = React.lazy(() => import('./worlds/CodingLateNightWorld'));

/**
 * SceneManager
 *
 * Central coordinator mapping the active vibe's `visualWorld.environmentType`
 * to the appropriate modular 3D world archetype.
 * Handles smooth cinematic crossfades between worlds.
 *
 * Performance architecture:
 * - KineticCyberWorld is statically imported → instant first render.
 * - All other 10 worlds are React.lazy() → JS chunks download on first selection only.
 * - startTransition defers the envType state update so the old world stays visible
 *   while the new world's chunk is fetching — no dark flash on Vibe switches.
 */
export default function SceneManager() {
  const activeVibe = useVibeStore((state) => state.activeVibe);
  const targetVibe = useVibeStore((state) => state.targetVibe);
  const isTransitioning = useVibeStore((state) => state.isTransitioning);
  const transitionProgress = useVibeStore((state) => state.transitionProgress);

  const groupRef = useRef();

  // Compute desired vibe/envType from store state
  const currentVibe = isTransitioning && transitionProgress > 0.5 ? targetVibe : activeVibe;
  const desiredEnvType = currentVibe?.visualWorld?.environmentType || 'kinetic-cyber';

  // displayEnvType/displayVibe are deferred via startTransition.
  // React keeps rendering the old displayEnvType until the new lazy chunk loads,
  // then atomically swaps — preventing any dark flash between Vibe switches.
  const [displayEnvType, setDisplayEnvType] = useState(desiredEnvType);
  const [displayVibe, setDisplayVibe] = useState(currentVibe);

  useEffect(() => {
    startTransition(() => {
      setDisplayEnvType(desiredEnvType);
      setDisplayVibe(currentVibe);
    });
  // currentVibe identity changes with every transition tick; gate on envType string only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desiredEnvType]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // During transition, create subtle camera/world breath effect
    if (isTransitioning) {
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

  const renderWorld = () => {
    switch (displayEnvType) {
      case 'chai-tapri':
        return <ChaiTapriWorld vibe={displayVibe} />;
      case 'gaming':
        return <GamingWorld vibe={displayVibe} />;
      case 'urban-night':
        return <UrbanNightWorld vibe={displayVibe} />;
      case 'rooftop':
        return <RooftopWorld vibe={displayVibe} />;
      case 'highway':
        return <HighwayWorld vibe={displayVibe} />;
      case 'rain-window':
        return <RainWindowWorld vibe={displayVibe} />;
      case 'minimal-focus':
        return <MinimalSanctuaryWorld vibe={displayVibe} />;
      case 'coding':
        return <CodingLateNightWorld vibe={displayVibe} />;
      case 'nature':
        return <NatureWorld vibe={displayVibe} />;
      case 'celestial':
        return <CelestialWorld vibe={displayVibe} />;
      case 'kinetic-cyber':
      default:
        return <KineticCyberWorld vibe={displayVibe} />;
    }
  };

  return (
    <group ref={groupRef}>
      {/* Inner Suspense scoped only to the world component.
          startTransition keeps the old world visible while the new chunk fetches.
          fallback=null is shown only on the very first mount before KineticCyberWorld renders. */}
      <Suspense fallback={null}>
        {renderWorld()}
      </Suspense>
    </group>
  );
}
