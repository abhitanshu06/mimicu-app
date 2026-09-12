import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * NatureWorld
 * 
 * Experiential 3D world for "Forest Escape", "Bonfire", "Beach Evening".
 * Features:
 * - Low-poly pine tree silhouettes & rolling terrain
 * - Central warm bonfire / bioluminescent core
 * - Drifting firefly or rising campfire ember particles (zero square artifacts)
 */
export default function NatureWorld({ vibe }) {
  const embersRef = useRef();
  const fireLightRef = useRef();
  const softTexture = useMemo(() => getSoftParticleTexture(), []);
  const emberCount = 90;

  // Tree positions
  const trees = useMemo(() => [
    { x: -3.5, z: -2, scale: 1.2 },
    { x: -5.0, z: -5, scale: 1.5 },
    { x: 3.8, z: -3, scale: 1.3 },
    { x: 5.2, z: -6, scale: 1.6 },
    { x: -2.0, z: -8, scale: 1.1 },
    { x: 2.2, z: -9, scale: 1.4 },
  ], []);

  // Embers rising positions
  const [emberPositions] = useMemo(() => {
    const pos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = Math.random() * 2 - 1.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5 - 1.0;
    }
    return [pos];
  }, [emberCount]);

  useFrame((state, delta) => {
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.30;

    // 1. Rising embers motion with subtle audio pacing
    if (embersRef.current) {
      const pos = embersRef.current.geometry.attributes.position.array;
      const audioSpeed = audio.mid * 0.18;
      for (let i = 0; i < emberCount; i++) {
        pos[i * 3 + 1] += delta * (0.45 + audioSpeed);
        pos[i * 3] += Math.sin(state.clock.elapsedTime * 2 + i) * 0.003;
        if (pos[i * 3 + 1] > 1.8) {
          pos[i * 3 + 1] = -1.2;
          pos[i * 3] = (Math.random() - 0.5) * 1.5;
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Campfire / nature core pulse with bass
    if (fireLightRef.current) {
      const audioPulse = audio.bass * lightMult * 1.1;
      fireLightRef.current.intensity = 2.0 + Math.sin(state.clock.elapsedTime * 8) * 0.35 + audioPulse;
    }
  });

  const primaryColor = vibe?.colors?.primary || '#ea580c';
  const secondaryColor = vibe?.colors?.secondary || '#84cc16';

  return (
    <group>
      {/* 1. Rolling Earth Ground Plane */}
      <mesh position={[0, -1.5, -6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 25]} />
        <meshStandardMaterial color="#08100a" roughness={0.9} />
      </mesh>

      {/* 2. Low-Poly Tree Silhouettes */}
      {trees.map((t, idx) => (
        <group key={idx} position={[t.x, -1.5, t.z]} scale={t.scale}>
          {/* Trunk */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
            <meshStandardMaterial color="#1a110a" roughness={0.9} />
          </mesh>
          {/* Foliage Cones */}
          <mesh position={[0, 1.6, 0]}>
            <coneGeometry args={[0.8, 1.4, 6]} />
            <meshStandardMaterial color="#062010" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <coneGeometry args={[0.6, 1.2, 6]} />
            <meshStandardMaterial color="#0b2e18" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 3. Central Campfire / Glowing Hearth */}
      <group position={[0, -1.3, -1.0]}>
        {/* Stone Ring */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}>
              <boxGeometry args={[0.15, 0.1, 0.15]} />
              <meshStandardMaterial color="#2d3748" roughness={0.9} />
            </mesh>
          );
        })}
        {/* Emissive Fire Glow Sphere */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial color={primaryColor} />
        </mesh>
        {/* Flickering Fire Point Light */}
        <pointLight
          ref={fireLightRef}
          position={[0, 0.4, 0]}
          color={primaryColor}
          intensity={2.2}
          distance={9}
          decay={2}
        />
      </group>

      {/* 4. Rising Embers Particles */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={emberCount}
            array={emberPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          map={softTexture}
          color={primaryColor}
          transparent
          opacity={0.88}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
