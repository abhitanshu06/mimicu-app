import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVibeStore } from '../../stores/vibeStore';
import { useThemeStore } from '../../stores/themeStore';
import { getEnvironmentTheme } from '../../config/environmentThemes';
import { getSoftParticleTexture } from '../../utils/particleTextures';
import { audioReactiveManager } from '../../utils/audioReactiveManager';

/**
 * Default fallback visual world parameters
 * Guarantees that even in edge cases where a property is loading,
 * the 3D pipeline never throws an undefined property exception.
 */
const DEFAULT_VISUAL_WORLD = {
  fog: { color: '#08090e', near: 5.0, far: 24.0 },
  lighting: {
    ambientIntensity: 0.55,
    ambientColor: '#cbd5e1',
    keyColor: '#c084fc',
    keyIntensity: 1.8,
    rimColor: '#38bdf8',
    rimIntensity: 1.2,
  },
  particles: {
    color: '#c4b5fd',
    count: 140,
    speed: 0.015,
    size: 0.14,
    opacity: 0.45,
  },
};

/**
 * DynamicAmbientParticles
 * 
 * Single draw-call stardust particle field with dynamic color, opacity, and speed
 * driven by the active vibe configuration under visualWorld.particles.
 * Uses soft circular gaussian alpha texture (ZERO square artifacts).
 */
function DynamicAmbientParticles({ count = 140 }) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const softTexture = useMemo(() => getSoftParticleTexture(), []);

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return [pos];
  }, [count]);

  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const targetVibe = useVibeStore.getState().targetVibe;
    const visualWorld = targetVibe?.visualWorld || DEFAULT_VISUAL_WORLD;
    const particles = visualWorld.particles || DEFAULT_VISUAL_WORLD.particles;
    const audio = audioReactiveManager.getValues();
    const particleMult = audio.profile?.particleResponse ?? 0.2;

    // Smooth speed rotation (modulated with mid audio frequencies)
    if (pointsRef.current) {
      const baseSpeed = particles.speed || 0.015;
      const audioSpeed = audio.mid * particleMult * 0.025;
      pointsRef.current.rotation.y += delta * (baseSpeed + audioSpeed);
      pointsRef.current.rotation.x += delta * ((baseSpeed + audioSpeed) * 0.5);
    }

    // Smooth color & opacity interpolation (subtle treble shimmer)
    if (materialRef.current) {
      tempColor.set(particles.color || '#c4b5fd');
      materialRef.current.color.lerp(tempColor, 0.08);
      const targetOpacity = Math.min(
        0.85,
        (particles.opacity ?? 0.5) + audio.treble * particleMult * 0.22
      );
      materialRef.current.opacity = THREE.MathUtils.lerp(
        materialRef.current.opacity,
        targetOpacity,
        0.08
      );
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.16}
        map={softTexture}
        color="#c4b5fd"
        transparent
        opacity={0.45}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Environment
 * 
 * Manages spatial lighting, depth fog, and ambient particles.
 * Reactively and smoothly lerps all values towards the active vibe's
 * `visualWorld` configuration (lighting, fog, particles).
 */
export default function Environment() {
  const fogRef = useRef();
  const ambientRef = useRef();
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const leftFillRef = useRef();
  const rightFillRef = useRef();
  const depthLightRef = useRef();

  // Color instances for zero-allocation useFrame interpolation
  const tempFogColor = useMemo(() => new THREE.Color(), []);
  const tempAmbientColor = useMemo(() => new THREE.Color(), []);
  const tempKeyColor = useMemo(() => new THREE.Color(), []);
  const tempRimColor = useMemo(() => new THREE.Color(), []);
  const tempLeftFillColor = useMemo(() => new THREE.Color(), []);
  const tempRightFillColor = useMemo(() => new THREE.Color(), []);
  const tempLiftColor = useMemo(() => new THREE.Color('#94a3b8'), []);

  // Cache envTheme in a ref — theme only changes on explicit user action, not per-frame.
  // Avoids calling getEnvironmentTheme() (object lookup + creation) at 60fps.
  const envThemeRef = useRef(getEnvironmentTheme(useThemeStore.getState().currentTheme));

  useEffect(() => {
    // Initialize from current state
    envThemeRef.current = getEnvironmentTheme(useThemeStore.getState().currentTheme);
    // Subscribe to future theme changes
    const unsubscribe = useThemeStore.subscribe((state) => {
      envThemeRef.current = getEnvironmentTheme(state.currentTheme);
    });
    return unsubscribe;
  }, []);

  useFrame(() => {
    const targetVibe = useVibeStore.getState().targetVibe;
    const visualWorld = targetVibe?.visualWorld || DEFAULT_VISUAL_WORLD;
    const fog = visualWorld.fog || DEFAULT_VISUAL_WORLD.fog;
    const lighting = visualWorld.lighting || DEFAULT_VISUAL_WORLD.lighting;

    // Read cached envTheme — zero function call overhead per frame
    const envTheme = envThemeRef.current;

    // Audio-Reactive Telemetry & Profile
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.3;
    const midMult = audio.profile?.midStrength ?? 0.2;

    // 1. Fog Color & Distance Interpolation (Theme-aware with subtle audio depth breathing)
    if (fogRef.current) {
      tempFogColor.set(fog.color || '#0c1424');
      if (envTheme.fogColorLift > 0) {
        tempFogColor.lerp(tempLiftColor, envTheme.fogColorLift);
      }
      fogRef.current.color.lerp(tempFogColor, 0.08);

      // Subtle atmospheric breath with mid frequencies
      const fogNearBreath = audio.mid * midMult * 0.8;
      fogRef.current.near = THREE.MathUtils.lerp(
        fogRef.current.near,
        Math.max(5.2, (fog.near ?? 6.0) - fogNearBreath),
        0.08
      );
      const targetFar = Math.max(30.0, (fog.far ?? 28.0) * envTheme.fogFarMultiplier);
      fogRef.current.far = THREE.MathUtils.lerp(fogRef.current.far, targetFar, 0.08);
    }

    // 2. Ambient Light Interpolation (Audio overallEnergy breathing)
    if (ambientRef.current) {
      tempAmbientColor.set(lighting.ambientColor || '#cbd5e1');
      if (envTheme.id === 'light') {
        tempAmbientColor.lerp(tempLiftColor, 0.25);
      }
      ambientRef.current.color.lerp(tempAmbientColor, 0.08);

      const baseAmbient = Math.max(0.62, (lighting.ambientIntensity ?? 0.5) * 1.25);
      const targetAmbient = Math.max(envTheme.minAmbient, baseAmbient * envTheme.ambientMultiplier);
      const audioAmbientLift = audio.overallEnergy * lightMult * 0.24;

      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetAmbient + audioAmbientLift,
        0.08
      );
    }

    // 3. Key Light (Primary Vibe Light with theme balance and bass/mid pulse)
    if (keyLightRef.current) {
      tempKeyColor.set(lighting.keyColor || '#c084fc');
      keyLightRef.current.color.lerp(tempKeyColor, 0.08);

      const targetKey = Math.max(1.8, (lighting.keyIntensity ?? 1.5) * 1.2 * envTheme.keyMultiplier);
      const audioKeyPulse = (audio.bass * 0.7 + audio.mid * 0.3) * lightMult * 0.75;

      keyLightRef.current.intensity = THREE.MathUtils.lerp(
        keyLightRef.current.intensity,
        targetKey + audioKeyPulse,
        0.08
      );
    }

    // 4. Rim Light (Secondary Accent Light with treble shimmer)
    if (rimLightRef.current) {
      tempRimColor.set(lighting.rimColor || '#38bdf8');
      rimLightRef.current.color.lerp(tempRimColor, 0.08);

      const targetRim = Math.max(1.4, (lighting.rimIntensity ?? 1.1) * 1.2 * envTheme.rimMultiplier);
      const audioRimPulse = audio.treble * lightMult * 0.55;

      rimLightRef.current.intensity = THREE.MathUtils.lerp(
        rimLightRef.current.intensity,
        targetRim + audioRimPulse,
        0.08
      );
    }

    // 5. Left Lateral Fill (Theme-aware illumination with subtle audio breath)
    if (leftFillRef.current) {
      tempLeftFillColor.set(lighting.rimColor || '#38bdf8');
      leftFillRef.current.color.lerp(tempLeftFillColor, 0.08);
      const targetLeft = 0.95 * envTheme.lateralFillMultiplier + audio.bass * lightMult * 0.2;
      leftFillRef.current.intensity = THREE.MathUtils.lerp(
        leftFillRef.current.intensity,
        targetLeft,
        0.08
      );
    }

    // 6. Right Lateral Fill (Theme-aware illumination with subtle audio breath)
    if (rightFillRef.current) {
      tempRightFillColor.set(lighting.keyColor || '#f59e0b');
      rightFillRef.current.color.lerp(tempRightFillColor, 0.08);
      const targetRight = 0.95 * envTheme.lateralFillMultiplier + audio.treble * lightMult * 0.2;
      rightFillRef.current.intensity = THREE.MathUtils.lerp(
        rightFillRef.current.intensity,
        targetRight,
        0.08
      );
    }
  });

  // Resolve initial properties from activeVibe's visualWorld schema
  const initialVibe = useVibeStore.getState().activeVibe;
  const initialVisualWorld = initialVibe?.visualWorld || DEFAULT_VISUAL_WORLD;
  const initialFog = initialVisualWorld.fog || DEFAULT_VISUAL_WORLD.fog;
  const initialLighting = initialVisualWorld.lighting || DEFAULT_VISUAL_WORLD.lighting;

  return (
    <>
      {/* Dynamic Atmospheric Depth Fog with Extended Distance */}
      <fog 
        ref={fogRef} 
        attach="fog" 
        args={[initialFog.color || '#0c1424', Math.max(6.0, initialFog.near || 6.0), Math.max(30.0, initialFog.far || 28.0)]} 
      />

      {/* 1. Base Ambient Fill Light (Retains subtle visual detail in shadows) */}
      <ambientLight 
        ref={ambientRef} 
        intensity={Math.max(0.62, (initialLighting.ambientIntensity || 0.5) * 1.25)} 
        color={initialLighting.ambientColor} 
      />

      {/* 2. Natural Hemisphere Light for Upward & Downward Ambient Bounce */}
      <hemisphereLight 
        args={[initialLighting.rimColor || '#38bdf8', '#141d30', 0.65]} 
      />

      {/* 3. Dynamic Key Vibe Light (Natural falloff) */}
      <pointLight 
        ref={keyLightRef} 
        position={[4.5, 3.5, 2.5]} 
        intensity={Math.max(2.0, (initialLighting.keyIntensity || 1.5) * 1.2)} 
        color={initialLighting.keyColor} 
        distance={30}
        decay={1.35}
      />

      {/* 4. Dynamic Rim Accent Light */}
      <pointLight 
        ref={rimLightRef} 
        position={[-4.5, -1.8, 2.0]} 
        intensity={Math.max(1.5, (initialLighting.rimIntensity || 1.1) * 1.2)} 
        color={initialLighting.rimColor} 
        distance={28}
        decay={1.35}
      />

      {/* 5. Left Lateral Fill Light - Guarantees left side geometry is illuminated */}
      <pointLight
        ref={leftFillRef}
        position={[-6.5, 2.0, 1.0]}
        intensity={0.95}
        color={initialLighting.rimColor || '#38bdf8'}
        distance={32}
        decay={1.3}
      />

      {/* 6. Right Lateral Fill Light - Guarantees right side geometry is illuminated */}
      <pointLight
        ref={rightFillRef}
        position={[6.5, 2.0, 1.0]}
        intensity={0.95}
        color={initialLighting.keyColor || '#f59e0b'}
        distance={32}
        decay={1.3}
      />

      {/* 7. Subtle Distant Horizon Depth Fill */}
      <pointLight
        ref={depthLightRef}
        position={[0, 1.0, -14.0]}
        intensity={0.65}
        color={initialLighting.rimColor || '#38bdf8'}
        distance={35}
        decay={1.4}
      />

      {/* 8. Directional overhead soft key fill */}
      <directionalLight position={[0, 8, 3]} intensity={0.5} color="#ffffff" />

      {/* Dynamic Ambient Particles (ZERO square artifacts) */}
      <DynamicAmbientParticles count={140} />
    </>
  );
}
