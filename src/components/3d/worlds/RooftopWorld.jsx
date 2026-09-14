import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture, getBokehTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * RooftopWorld
 * 
 * Experiential 3D atmosphere for "Terrace Walking", "Terrace Evening".
 * Evokes the feeling of pacing an open city rooftop terrace at dusk/night.
 * 
 * Recognizable Elements:
 * 1. Tiled Terrace Floor with expansion joints
 * 2. Sturdy Parapet Wall & Metal Safety Railing with balusters
 * 3. Warm String Fairy Lights draped along the railing (twinkling warm amber glow)
 * 4. Rooftop Access Door Bulkhead & Water Tank silhouette in background
 * 5. Modern Concrete Planter Box with swaying ornamental grass silhouettes
 * 6. Sprawling Distant City Skyline with illuminated skyscraper windows
 * 7. Soft Evening Breeze Particles drifting across the open air (zero square edges)
 */
export default function RooftopWorld({ vibe }) {
  const breezeRef = useRef();
  const bokehRef = useRef();
  const stringLightsRef = useRef();
  const terraceLightRef = useRef();
  // Pre-cached material refs for fairy lights — avoids per-frame scene graph traversal
  const fairyMaterialRefs = useRef(Array.from({ length: 18 }, () => ({ current: null })));

  const primaryColor = vibe?.colors?.primary || '#ec4899';
  const secondaryColor = vibe?.colors?.secondary || '#38bdf8';
  const accentColor = vibe?.colors?.accent || '#f59e0b';

  // 1. Distant City Skyline Towers
  const skyline = useMemo(() => {
    const towers = [];
    for (let i = -14; i <= 14; i += 1.6) {
      const h = (Math.abs(Math.sin(i * 1.3)) * 4.8) + 3.4;
      const w = 1.1 + (Math.abs(Math.cos(i)) * 0.85);
      const z = -(14 + (Math.abs(Math.sin(i * 0.7)) * 6));
      towers.push({ x: i * 1.5, y: h / 2 - 2.0, z, h, w, idx: i });
    }
    return towers;
  }, []);

  // 2. String Fairy Lights along the Railing
  const fairyLights = useMemo(() => {
    const lights = [];
    for (let i = 0; i < 18; i++) {
      const x = -5.0 + i * 0.6;
      // Slight catenary sag curve
      const sag = Math.sin((i / 17) * Math.PI) * 0.12;
      const y = -0.55 - sag;
      const z = -0.05;
      lights.push({ x, y, z });
    }
    return lights;
  }, []);

  // 3. Evening Breeze Drift Particles
  const breezeCount = 50;
  const [breezePositions] = useMemo(() => {
    const pos = new Float32Array(breezeCount * 3);
    for (let i = 0; i < breezeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 3.5 - 1.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return [pos];
  }, [breezeCount]);

  const softBreezeTexture = useMemo(() => getSoftParticleTexture(), []);

  // 4. Distant Bokeh Lights
  const bokehCount = 36;
  const [bokehPositions, bokehColors] = useMemo(() => {
    const pos = new Float32Array(bokehCount * 3);
    const cols = new Float32Array(bokehCount * 3);
    const palette = [
      new THREE.Color('#f59e0b'),
      new THREE.Color('#f472b6'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#fef08a'),
    ];

    for (let i = 0; i < bokehCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = Math.random() * 5.5 - 0.5;
      pos[i * 3 + 2] = -(11 + Math.random() * 12);

      const c = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, [bokehCount]);

  const bokehTexture = useMemo(() => getBokehTexture(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.28;

    // A. Drift breeze particles horizontally with subtle audio breeze modulation
    if (breezeRef.current) {
      const pos = breezeRef.current.geometry.attributes.position.array;
      const audioBreeze = audio.mid * 0.15;
      for (let i = 0; i < breezeCount; i++) {
        pos[i * 3] += delta * (0.45 + audioBreeze);
        pos[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.001;
        if (pos[i * 3] > 7) pos[i * 3] = -7;
      }
      breezeRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // B. Fairy lights subtle breathing twinkle with audio treble shimmer
    // Direct for-loop over pre-cached material refs — no closure, no scene graph traversal
    const fairyMats = fairyMaterialRefs.current;
    for (let i = 0; i < fairyMats.length; i++) {
      if (fairyMats[i].current) {
        fairyMats[i].current.opacity = Math.min(1, 0.75 + Math.sin(time * 1.8 + i) * 0.2 + audio.treble * 0.15);
      }
    }

    // C. Distant bokeh slight drift
    if (bokehRef.current) {
      bokehRef.current.rotation.y = Math.sin(time * 0.08) * 0.02 + audio.mid * 0.012;
    }

    // D. Terrace warm light pulse with bass
    if (terraceLightRef.current) {
      const audioPulse = audio.bass * lightMult * 0.85;
      terraceLightRef.current.intensity = 2.2 + audioPulse;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. TILED ROOFTOP TERRACE FLOOR
      ======================================================== */}
      {/* Floor Plane (Wide to prevent side voids) */}
      <mesh position={[0, -1.6, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 32]} />
        <meshStandardMaterial
          color="#151b28"
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* Expansion Joint Tile Lines */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={i} position={[x, -1.595, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 12]} />
          <meshBasicMaterial color="#0b0e17" />
        </mesh>
      ))}

      {/* ========================================================
          2. ROOFTOP PARAPET WALL & METAL SAFETY RAILING
      ======================================================== */}
      {/* Parapet Low Concrete Wall (Wide panorama) */}
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[28, 0.75, 0.45]} />
        <meshStandardMaterial color="#212838" roughness={0.65} metalness={0.2} />
      </mesh>
      {/* Wall Coping Stone / Ledge Top */}
      <mesh position={[0, -0.71, 0]}>
        <boxGeometry args={[28.2, 0.05, 0.52]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Modern Metal Railing on top of Parapet Wall */}
      <group position={[0, -0.7, 0]}>
        {/* Top Handrail */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 28, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Middle Safety Cable */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 28, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        {/* Vertical Railing Posts */}
        {[-12, -9, -6, -3, 0, 3, 6, 9, 12].map((x, idx) => (
          <mesh key={idx} position={[x, 0.27, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.56, 12]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          3. STRING FAIRY LIGHTS DRAPED ALONG RAILING
      ======================================================== */}
      <group ref={stringLightsRef}>
        {fairyLights.map((light, idx) => (
          <group key={idx} position={[light.x, light.y, light.z]}>
            {/* Glowing Bulb — material ref cached for zero-GC per-frame opacity updates */}
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial ref={fairyMaterialRefs.current[idx]} color="#fef08a" transparent opacity={0.85} />
            </mesh>
            {/* Socket Cap */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>
        ))}
        {/* Ambient Warm Golden Terrace Illumination with Audio-Reactive Pulse */}
        <pointLight ref={terraceLightRef} position={[0, -0.4, 0.6]} color="#f59e0b" intensity={2.2} distance={8} decay={2} />
      </group>

      {/* ========================================================
          4. ROOFTOP ACCESS BULKHEAD DOOR & WATER TANK (Mid-ground)
      ======================================================== */}
      {/* Staircase Enclosure Bulkhead (Positioned safely at mid-ground z=-4.0) */}
      <group position={[6.2, -0.4, -4.0]}>
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2.2, 2.2, 2.8]} />
          <meshStandardMaterial color="#182030" roughness={0.7} />
        </mesh>
        {/* Metal Access Door */}
        <mesh position={[-1.11, 0.6, 0]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Bulkhead Overhead Light */}
        <mesh position={[-1.12, 1.65, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-1.2, 1.6, 0]} color="#38bdf8" intensity={1.1} distance={5} />
      </group>

      {/* Rooftop Water Tank (Positioned safely at mid-ground z=-4.5) */}
      <group position={[-6.2, -0.2, -4.5]}>
        {/* Concrete Pedestal */}
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[1.6, 0.6, 1.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Cylindrical Water Tank */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1.5, 20]} />
          <meshStandardMaterial color="#161f30" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* ========================================================
          5. CONCRETE PLANTER BOX WITH ORNAMENTAL GRASS
      ======================================================== */}
      <group position={[-2.8, -1.3, 1.2]}>
        {/* Planter Body */}
        <mesh>
          <boxGeometry args={[1.8, 0.45, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0.23, 0]}>
          <planeGeometry args={[1.7, 0.42]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#1c140d" roughness={0.9} />
        </mesh>
        {/* Ornamental Grass Fronds */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((x, idx) => (
          <mesh key={idx} position={[x, 0.5, 0]} rotation={[0, 0, (idx - 2) * 0.12]}>
            <coneGeometry args={[0.08, 0.55, 6]} />
            <meshStandardMaterial color="#064e3b" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          6. DISTANT CITY SKYLINE TOWERS WITH WINDOWS
      ======================================================== */}
      {skyline.map((t) => (
        <group key={t.idx} position={[t.x, t.y, t.z]}>
          <mesh>
            <boxGeometry args={[t.w, t.h, 2.2]} />
            <meshStandardMaterial color="#0c101c" roughness={0.75} metalness={0.2} />
          </mesh>
          {/* Lit Tower Window */}
          <mesh position={[0, (t.idx % 4) * 0.9 - 1.0, 1.11]}>
            <planeGeometry args={[0.3, 0.4]} />
            <meshBasicMaterial
              color={t.idx % 2 === 0 ? accentColor : '#fef08a'}
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          7. EVENING BREEZE DRIFT PARTICLES (ZERO SQUARE EDGES)
      ======================================================== */}
      <points ref={breezeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={breezeCount}
            array={breezePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          map={softBreezeTexture}
          color="#f8fafc"
          transparent
          opacity={0.35}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Distant City Bokeh Lights */}
      <group ref={bokehRef}>
        {bokehPositions && (
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={bokehCount}
                array={bokehPositions}
                itemSize={3}
              />
              <bufferAttribute
                attach="attributes-color"
                count={bokehCount}
                array={bokehColors}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.4}
              map={bokehTexture}
              vertexColors
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>
        )}
      </group>
    </group>
  );
}
