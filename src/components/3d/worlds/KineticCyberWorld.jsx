import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * KineticCyberWorld
 * 
 * Experiential 3D world for "Gaming", "Gym Mode", "Headphones On", and Default Home.
 * Features:
 * - Digital glowing grid floor
 * - Kinetic wireframe icosahedron with glowing nucleus
 * - Concentric planetary orbital rings
 */
export default function KineticCyberWorld({ vibe }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const gridRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const speed = vibe?.visualWorld?.camera?.speed || 0.5;
    const audio = audioReactiveManager.getValues();

    // 1. Kinetic floating & dynamic spin with audio response
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(time * 0.9) * 0.15;
      coreRef.current.rotation.x += delta * (0.2 * speed);
      coreRef.current.rotation.y += delta * (0.35 * speed);
      coreRef.current.scale.setScalar(1.0 + audio.bass * 0.06);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * ((0.3 + audio.mid * 0.12) * speed);
      ring1Ref.current.rotation.x = Math.sin(time * 0.4) * 0.3 + 0.6;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * ((0.25 + audio.treble * 0.12) * speed);
      ring2Ref.current.rotation.y = Math.cos(time * 0.4) * 0.3 - 0.5;
    }

    // 2. Animated grid floor drift
    if (gridRef.current) {
      gridRef.current.position.z = (gridRef.current.position.z + delta * 2 * speed) % 2;
    }
  });

  const primaryColor = vibe?.colors?.primary || '#10b981';
  const secondaryColor = vibe?.colors?.secondary || '#06b6d4';

  return (
    <group>
      {/* 1. Perspective Cyber Grid Floor */}
      <group ref={gridRef} position={[0, -1.6, -6]}>
        <gridHelper 
          args={[20, 20, primaryColor, '#1e293b']} 
          rotation={[0, 0, 0]} 
        />
      </group>

      {/* 2. Central Translucent Kinetic Core */}
      <group position={[0, 0, 0]}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshPhysicalMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.4}
            roughness={0.25}
            metalness={0.8}
            clearcoat={0.6}
            wireframe={true}
            transparent
            opacity={0.75}
          />
        </mesh>

        {/* Luminous Core Nucleus */}
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>

        {/* Orbital Accent Ring 1 */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.85, 0.018, 16, 80]} />
          <meshBasicMaterial color={secondaryColor} transparent opacity={0.6} />
        </mesh>

        {/* Orbital Accent Ring 2 */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.25, 0.014, 16, 90]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.5} />
        </mesh>
      </group>
    </group>
  );
}
