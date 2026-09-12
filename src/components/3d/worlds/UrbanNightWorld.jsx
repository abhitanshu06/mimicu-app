import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftSmokeTexture } from '../../../utils/particleTextures';
import TreeSilhouette from '../hybrid/TreeSilhouette';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * UrbanNightWorld
 * 
 * Experiential 3D atmosphere for "3 AM Night Walk".
 * Realistic nocturnal city street aesthetic:
 * - Center: Wet reflective asphalt roadway with dashed yellow center markings and puddles.
 * - Left & Right Sides: Illuminated sidewalks, arched streetlamps, closed boutique storefronts
 *   with security shutters, canvas canopies, illuminated signs, and residential apartment windows.
 * - Distant 2.5D Layer: Nocturnal skyscraper skyline with blinking antenna beacons and window grids.
 * - Street Elements: Paver curbs, fire hydrants, bollards, tree silhouettes in cast-iron grates.
 * - ZERO primitive monolithic cubes or random floating boxes.
 */
/**
 * ReactiveStreetlamp
 * Amber streetlamp with audio-reactive bass pulse.
 */
function ReactiveStreetlamp({ lamp, primaryColor }) {
  const lightRef = useRef();
  const armOffset = lamp.side === -1 ? 0.35 : -0.35;
  const bulbOffset = lamp.side === -1 ? 0.65 : -0.65;

  useFrame(() => {
    if (lightRef.current) {
      const audio = audioReactiveManager.getValues();
      const pulse = audio.bass * (audio.profile?.lightResponse ?? 0.32) * 1.1;
      lightRef.current.intensity = 2.5 + pulse;
    }
  });

  return (
    <group position={[lamp.x, -1.5, lamp.z]}>
      {/* Arched Cast-Iron Lamppost */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 3.6, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Gooseneck Curved Arm extending towards road */}
      <mesh position={[armOffset, 3.6, 0]} rotation={[0, 0, lamp.side === -1 ? -0.15 : 0.15]}>
        <boxGeometry args={[0.7, 0.06, 0.08]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>

      {/* Lantern Enclosure */}
      <mesh position={[bulbOffset, 3.52, 0]}>
        <coneGeometry args={[0.2, 0.16, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Luminous Bulb */}
      <mesh position={[bulbOffset, 3.44, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Warm Radial Streetlight Pool on Asphalt */}
      <pointLight
        ref={lightRef}
        position={[bulbOffset, 3.2, 0]}
        color={primaryColor}
        intensity={2.5}
        distance={13}
        decay={1.35}
      />
    </group>
  );
}

export default function UrbanNightWorld({ vibe }) {
  const mistPointsRef = useRef();
  const beaconRef = useRef();

  const primaryColor = vibe?.colors?.primary || '#f59e0b';
  const secondaryColor = vibe?.colors?.secondary || '#38bdf8';

  // 1. Realistic Layered Storefront Buildings along Left & Right Streetwalls
  const buildings = useMemo(() => {
    const items = [];
    const shops = [
      { name: 'CAFE', awningColor: '#1e3a8a', shutterColor: '#1e293b' },
      { name: 'BOOKS', awningColor: '#065f46', shutterColor: '#243248' },
      { name: 'VINYL', awningColor: '#78350f', shutterColor: '#1e293b' },
      { name: 'BAKERY', awningColor: '#3b0764', shutterColor: '#243248' },
      { name: 'GALLERY', awningColor: '#1e293b', shutterColor: '#1a2234' },
    ];

    // Left Streetwall (z from -4.5 to -25.5) - Set back cleanly at x <= -5.6
    const leftZ = [-4.5, -9.8, -15.2, -20.6, -26.0];
    leftZ.forEach((z, idx) => {
      const height = 6.8 + (idx % 3) * 1.6;
      const streetWidth = 4.4 + (idx % 2) * 0.8; // Z-axis width along street
      const depth = 3.6; // X-axis depth away from street
      const x = -(depth / 2 + 5.6);
      const shop = shops[idx % shops.length];
      items.push({
        x,
        y: height / 2 - 1.6,
        z,
        depth,
        height,
        streetWidth,
        side: 'left',
        idx,
        shop,
      });
    });

    // Right Streetwall (z from -5.5 to -26.5) - Set back cleanly at x >= +5.6
    const rightZ = [-5.5, -10.8, -16.2, -21.6, -27.0];
    rightZ.forEach((z, idx) => {
      const height = 7.0 + ((idx + 1) % 3) * 1.5;
      const streetWidth = 4.4 + (idx % 2) * 0.8;
      const depth = 3.6;
      const x = depth / 2 + 5.6;
      const shop = shops[(idx + 2) % shops.length];
      items.push({
        x,
        y: height / 2 - 1.6,
        z,
        depth,
        height,
        streetWidth,
        side: 'right',
        idx: idx + 10,
        shop,
      });
    });

    return items;
  }, []);

  // 2. Symmetrical Amber Streetlamp Posts on Left and Right (Balanced illumination)
  const streetlamps = useMemo(() => [
    { x: -2.7, z: 1.5, side: -1 },
    { x: -2.7, z: -5.2, side: -1 },
    { x: -2.7, z: -12.0, side: -1 },
    { x: -2.7, z: -18.8, side: -1 },
    { x: 2.7, z: -1.5, side: 1 },
    { x: 2.7, z: -8.2, side: 1 },
    { x: 2.7, z: -15.0, side: 1 },
    { x: 2.7, z: -21.8, side: 1 },
  ], []);

  // 3. Road Dash Markings
  const roadDashes = useMemo(() => {
    const dashes = [];
    for (let z = 4.0; z >= -28; z -= 3.2) {
      dashes.push(z);
    }
    return dashes;
  }, []);

  // 4. Wet Road Reflective Puddles
  const puddles = useMemo(() => [
    { x: -0.6, z: 1.2, rx: 0.65, rz: 0.35 },
    { x: 0.8, z: -2.0, rx: 0.75, rz: 0.4 },
    { x: -0.9, z: -5.5, rx: 0.85, rz: 0.45 },
    { x: 0.5, z: -9.5, rx: 0.9, rz: 0.45 },
    { x: -0.4, z: -14.0, rx: 0.7, rz: 0.4 },
    { x: 0.7, z: -18.5, rx: 0.8, rz: 0.42 },
  ], []);

  // 5. Distant Skyline Layer (2.5D Silhouette at z = -32)
  const distantSkyline = useMemo(() => {
    const towers = [];
    const positions = [-20, -15, -10, -5, 0, 5, 10, 15, 20];
    positions.forEach((x, i) => {
      towers.push({
        x,
        y: 4.5 + (i % 4) * 2.2,
        width: 3.8 + (i % 3) * 1.4,
        height: 11 + (i % 4) * 3.5,
        hasBeacon: i % 2 === 0,
      });
    });
    return towers;
  }, []);

  // 6. Soft Drifting Street Mist Particles (Zero square edges)
  const mistCount = 45;
  const [mistPositions] = useMemo(() => {
    const pos = new Float32Array(mistCount * 3);
    for (let i = 0; i < mistCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = -1.2 + Math.random() * 1.2;
      pos[i * 3 + 2] = -(Math.random() * 26);
    }
    return [pos];
  }, [mistCount]);

  const mistTexture = useMemo(() => getSoftSmokeTexture(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();
    const mistMult = audio.profile?.particleResponse ?? 0.2;

    // Animate mist drift with subtle audio pacing
    if (mistPointsRef.current) {
      const pos = mistPointsRef.current.geometry.attributes.position.array;
      const audioSpeed = audio.mid * mistMult * 0.22;
      for (let i = 0; i < mistCount; i++) {
        pos[i * 3 + 2] += delta * (0.38 + audioSpeed);
        pos[i * 3] += Math.sin(time * 0.4 + i) * 0.002;
        if (pos[i * 3 + 2] > 4.5) {
          pos[i * 3 + 2] = -26;
        }
      }
      mistPointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Blinking red aviation warning beacons on distant towers
    if (beaconRef.current) {
      beaconRef.current.visible = Math.floor(time * 1.5) % 2 === 0;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. DISTANT 2.5D SKYLINE & HORIZON (z = -32)
      ======================================================== */}
      <group position={[0, 0, -32]}>
        {distantSkyline.map((tower, idx) => (
          <group key={idx} position={[tower.x, tower.y, 0]}>
            {/* Tower Silhouette */}
            <mesh>
              <boxGeometry args={[tower.width, tower.height, 1.0]} />
              <meshStandardMaterial color="#080e1a" roughness={0.9} metalness={0.1} />
            </mesh>
            {/* Spire Antenna */}
            <mesh position={[0, tower.height / 2 + 1.2, 0]}>
              <cylinderGeometry args={[0.04, 0.08, 2.4, 6]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Window Grid Lights (Faint distant shimmer) */}
            {[-1.5, 0, 1.5].map((wy, wi) => (
              <mesh key={wi} position={[0, wy, 0.52]}>
                <planeGeometry args={[tower.width * 0.72, 0.12]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Blinking Red Aviation Warning Beacons */}
        <group ref={beaconRef}>
          {distantSkyline.filter((t) => t.hasBeacon).map((t, idx) => (
            <mesh key={idx} position={[t.x, t.y + t.height / 2 + 2.4, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================
          2. UNIFIED GROUND: ASPHALT ROAD & FLUSH SIDEWALKS
             (One clear perspective direction; zero intersecting slabs)
      ======================================================== */}
      {/* Full Base Ground Surface (Deep nocturnal foundation) */}
      <mesh position={[0, -1.6, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 48]} />
        <meshStandardMaterial color="#0a0f1a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Main Perspective Asphalt Roadway (Width: 4.8m, x from -2.4 to +2.4) */}
      <mesh position={[0, -1.595, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 48]} />
        <meshStandardMaterial
          color="#0f1522"
          roughness={0.16}
          metalness={0.82}
        />
      </mesh>

      {/* Dashed Amber Center Lane Line */}
      {roadDashes.map((z, idx) => (
        <mesh key={idx} position={[0, -1.59, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 1.6]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Reflective Rain Puddles on Wet Asphalt */}
      {puddles.map((p, idx) => (
        <mesh key={idx} position={[p.x, -1.588, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.rx, 24]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.04}
            metalness={0.96}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Left Sidewalk (Width: 3.2m, x from -5.6 to -2.4, height: -1.55) */}
      <mesh position={[-4.0, -1.55, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#1a2232" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Left Beveled Granite Curb */}
      <mesh position={[-2.4, -1.52, -12]}>
        <boxGeometry args={[0.12, 0.08, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Right Sidewalk (Width: 3.2m, x from +2.4 to +5.6, height: -1.55) */}
      <mesh position={[4.0, -1.55, -12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#1a2232" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Right Beveled Granite Curb */}
      <mesh position={[2.4, -1.52, -12]}>
        <boxGeometry args={[0.12, 0.08, 48]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* Cast-Iron Street Bollards along crosswalk curbs */}
      {[-1.5, -8.0, -15.0].map((bz, idx) => (
        <group key={idx}>
          <mesh position={[-2.52, -1.32, bz]}>
            <cylinderGeometry args={[0.05, 0.06, 0.42, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[2.52, -1.32, bz]}>
            <cylinderGeometry args={[0.05, 0.06, 0.42, 10]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Fire Hydrant on Right Sidewalk */}
      <group position={[3.1, -1.35, -2.0]}>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.36, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.032, 0.032, 0.22, 10]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} />
        </mesh>
      </group>

      {/* ========================================================
          3. AMBER GOOSENECK STREETLAMPS (Both sides)
      ======================================================== */}
      {streetlamps.map((lamp, idx) => (
        <ReactiveStreetlamp key={idx} lamp={lamp} primaryColor={primaryColor} />
      ))}

      {/* ========================================================
          4. STOREFRONT BUILDINGS (Set cleanly behind sidewalk at x = ±5.6)
             (Zero giant black rectangles; proportional streetwall)
      ======================================================== */}
      {buildings.map((b) => {
        const isLeft = b.side === 'left';
        // Front wall facing the street
        const frontFaceX = isLeft ? b.depth / 2 + 0.02 : -(b.depth / 2 + 0.02);

        return (
          <group key={b.idx} position={[b.x, b.y, b.z]}>
            {/* Main Masonry Structure */}
            <mesh>
              <boxGeometry args={[b.depth, b.height, b.streetWidth]} />
              <meshStandardMaterial
                color="#121a28"
                roughness={0.75}
                metalness={0.2}
              />
            </mesh>

            {/* Ground Floor Cornice Belt-Course */}
            <mesh position={[0, -b.height / 2 + 2.4, 0]}>
              <boxGeometry args={[b.depth + 0.12, 0.1, b.streetWidth + 0.12]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>

            {/* Roof Parapet Cornice Line */}
            <mesh position={[0, b.height / 2 + 0.04, 0]}>
              <boxGeometry args={[b.depth + 0.14, 0.08, b.streetWidth + 0.14]} />
              <meshStandardMaterial color="#2d3748" roughness={0.5} />
            </mesh>

            {/* Ground Floor Storefront Façade facing the street */}
            <group position={[frontFaceX, -b.height / 2 + 1.2, 0]}>
              {/* Rollup Metal Security Shutter */}
              <mesh position={[0, 0, -0.6]} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
                <planeGeometry args={[1.4, 2.0]} />
                <meshStandardMaterial color={b.shop.shutterColor} roughness={0.65} metalness={0.5} />
              </mesh>

              {/* Recessed Shop Entryway */}
              <mesh position={[0, 0, 0.6]} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
                <planeGeometry args={[0.9, 2.0]} />
                <meshStandardMaterial color="#080e18" roughness={0.8} />
              </mesh>

              {/* Canvas Awning Canopy over storefront edge */}
              <mesh
                position={[isLeft ? 0.3 : -0.3, 1.05, 0]}
                rotation={[0, 0, isLeft ? -0.25 : 0.25]}
              >
                <boxGeometry args={[0.6, 0.04, b.streetWidth * 0.78]} />
                <meshStandardMaterial color={b.shop.awningColor} roughness={0.6} />
              </mesh>

              {/* Overhead Illuminated Shop Signboard */}
              <mesh
                position={[isLeft ? 0.04 : -0.04, 1.25, 0]}
                rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
              >
                <boxGeometry args={[1.6, 0.26, 0.05]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              {/* Shop Sign Glow Text Bar */}
              <mesh
                position={[isLeft ? 0.07 : -0.07, 1.25, 0]}
                rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
              >
                <planeGeometry args={[1.4, 0.15]} />
                <meshBasicMaterial color="#fef08a" transparent opacity={0.65} />
              </mesh>
            </group>

            {/* Upper Residential Windows with Sills */}
            {[-0.2, 1.3, 2.6].map((yOffset, wIdx) => {
              if (yOffset > b.height / 2 - 0.7) return null;
              const isWarm = (b.idx + wIdx) % 2 === 0;
              const winColor = isWarm ? primaryColor : secondaryColor;

              return (
                <group key={wIdx} position={[frontFaceX, yOffset, 0]}>
                  {/* Window 1 */}
                  <mesh position={[0, 0, -0.7]} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
                    <planeGeometry args={[0.4, 0.55]} />
                    <meshBasicMaterial 
                      color={winColor} 
                      transparent 
                      opacity={isWarm ? 0.75 : 0.45} 
                    />
                  </mesh>
                  {/* Window 2 */}
                  <mesh position={[0, 0, 0.7]} rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}>
                    <planeGeometry args={[0.4, 0.55]} />
                    <meshBasicMaterial 
                      color={winColor} 
                      transparent 
                      opacity={isWarm ? 0.7 : 0.4} 
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* ========================================================
          5. SIDEWALK VERGE TREES (Centered on sidewalk at x = ±4.0)
      ======================================================== */}
      {/* Right Sidewalk Trees */}
      {[-2.5, -9.0, -15.5, -22.0].map((tz, i) => (
        <group key={i} position={[4.0, -1.48, tz]}>
          {/* Cast-Iron Tree Pit Grate on Sidewalk */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.48, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <TreeSilhouette scale={0.92 + i * 0.06} foliageColor="#081418" trunkColor="#15141c" />
        </group>
      ))}

      {/* Left Sidewalk Trees */}
      {[-6.0, -18.0].map((tz, i) => (
        <group key={i} position={[-4.0, -1.48, tz]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.15, 0.48, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <TreeSilhouette scale={0.96} foliageColor="#07131a" trunkColor="#15141c" />
        </group>
      ))}

      {/* ========================================================
          6. SOFT DRIFTING STREET MIST (ZERO SQUARE EDGES)
      ======================================================== */}
      <points ref={mistPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={mistCount}
            array={mistPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2.8}
          map={mistTexture}
          color={secondaryColor}
          transparent
          opacity={0.08}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
