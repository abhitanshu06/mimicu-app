import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * TreeSilhouette
 * 
 * Stylized low-poly organic tree silhouette for night street & horizon scenes.
 * Features a slender trunk, tiered foliage canopies, and subtle wind sway.
 * Used in 3 AM Night Walk, Stargazing, and outdoor environments.
 */
export default function TreeSilhouette({
  position = [0, 0, 0],
  scale = 1.0,
  foliageColor = '#0d1d1a',
  trunkColor = '#1a181e',
  swaySpeed = 0.8,
  swayAmount = 0.02,
}) {
  const treeRef = useRef();

  useFrame((state) => {
    if (treeRef.current) {
      const time = state.clock.elapsedTime;
      // Gentle ambient nocturnal breeze sway
      treeRef.current.rotation.z = Math.sin(time * swaySpeed + position[0]) * swayAmount;
      treeRef.current.rotation.x = Math.cos(time * (swaySpeed * 0.7) + position[2]) * (swayAmount * 0.5);
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={treeRef}>
        {/* Slender Wood Trunk */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 1.8, 8]} />
          <meshStandardMaterial color={trunkColor} roughness={0.85} metalness={0.15} />
        </mesh>

        {/* Lower Tier Foliage Canopy */}
        <mesh position={[0, 2.0, 0]}>
          <coneGeometry args={[0.85, 1.4, 8]} />
          <meshStandardMaterial color={foliageColor} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Middle Tier Foliage Canopy */}
        <mesh position={[0, 2.8, 0]}>
          <coneGeometry args={[0.65, 1.2, 8]} />
          <meshStandardMaterial color={foliageColor} roughness={0.8} metalness={0.1} />
        </mesh>

        {/* Top Tier Foliage Crown */}
        <mesh position={[0, 3.5, 0]}>
          <coneGeometry args={[0.42, 0.9, 8]} />
          <meshStandardMaterial color={foliageColor} roughness={0.8} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}