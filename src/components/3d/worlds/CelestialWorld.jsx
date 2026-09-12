import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture, getSoftSmokeTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * CelestialWorld
 * 
 * Experiential 3D atmosphere for "Stargazing", "Night Sky", "Astronomy".
 * 
 * Recognizable Elements:
 * 1. Observation Lookout Deck & Ridge in lower foreground
 * 2. Astronomical Refractor Telescope on Tripod aimed up toward the stars
 * 3. Deep Starfield with multi-depth stars (shimmering softly, zero square edges)
 * 4. Subtle Constellation Geometry lines connecting star clusters
 * 5. Luminous Celestial Moon / Orb with soft volumetric atmospheric halo
 * 6. Distant Mountain Ridge Silhouettes along the horizon
 */
export default function CelestialWorld({ vibe }) {
  const starsRef = useRef();
  const moonRef = useRef();
  const scopeRef = useRef();
  const shootingStarRef = useRef();
  const cloudsRef = useRef();
  const moonLightRef = useRef();
  const softTexture = useMemo(() => getSoftParticleTexture(), []);
  const softSmokeTexture = useMemo(() => getSoftSmokeTexture(), []);

  const starCount = 280;

  // 1. Starfield Positions
  const [starPositions] = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * 15 - 1.5;
      pos[i * 3 + 2] = -Math.random() * 16 - 3;
    }
    return [pos];
  }, [starCount]);

  // 2. Constellation Lines (Connecting major visible stars)
  const constellationPoints = useMemo(() => {
    // 5-point Orion / Cassiopeia-inspired constellation geometry
    return [
      new THREE.Vector3(-2.8, 3.2, -7),
      new THREE.Vector3(-1.9, 2.7, -7),
      new THREE.Vector3(-1.1, 3.1, -7),
      new THREE.Vector3(-0.4, 2.4, -7),
      new THREE.Vector3(0.5, 2.9, -7),
    ];
  }, []);

  const constellationGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(constellationPoints);
  }, [constellationPoints]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.26;

    // A. Slow cosmic celestial rotation with subtle audio pace
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * (0.005 + audio.mid * 0.003);
    }

    // B. Subtle lunar floating breath
    if (moonRef.current) {
      moonRef.current.position.y = 2.0 + Math.sin(time * 0.3) * 0.06;
    }

    // C. Very gentle telescope ambient sway
    if (scopeRef.current) {
      scopeRef.current.rotation.y = -0.2 + Math.sin(time * 0.15) * 0.015;
    }

    // D. Rare Shooting Star (sweeps across sky every 10 seconds)
    if (shootingStarRef.current) {
      const cycle = time % 10.5;
      if (cycle < 1.1) {
        const progress = cycle / 1.1;
        shootingStarRef.current.visible = true;
        shootingStarRef.current.position.x = -7.0 + progress * 15.0;
        shootingStarRef.current.position.y = 6.0 - progress * 4.5;
        shootingStarRef.current.position.z = -14.0;
        shootingStarRef.current.scale.set(1.0 + progress * 0.5, 0.4, 1.0);
      } else {
        shootingStarRef.current.visible = false;
      }
    }

    // E. Drifting celestial nebula clouds with subtle audio breath
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = Math.sin(time * 0.03) * 0.02 + audio.mid * 0.006;
    }

    // F. Moonlight and horizon breathing pulse
    if (moonLightRef.current) {
      const audioPulse = audio.bass * lightMult * 0.75;
      moonLightRef.current.intensity = 2.0 + audioPulse;
    }
  });

  const primaryColor = vibe?.colors?.primary || '#818cf8';
  const secondaryColor = vibe?.colors?.secondary || '#c084fc';

  return (
    <group>
      {/* ========================================================
          1. OBSERVATION LOOKOUT DECK & HORIZON RIDGE
      ======================================================== */}
      {/* Deck Platform Floor (Wide to eliminate side voids) */}
      <mesh position={[0, -1.65, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 24]} />
        <meshStandardMaterial color="#121825" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Lookout Deck Front Rim */}
      <mesh position={[0, -1.6, -0.6]}>
        <boxGeometry args={[26, 0.1, 0.4]} />
        <meshStandardMaterial color="#232d40" roughness={0.55} metalness={0.3} />
      </mesh>

      {/* Lookout Deck Front Railing */}
      <mesh position={[0, -1.0, -0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 26, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Railing Support Posts */}
      {[-8, -4, 0, 4, 8].map((px, i) => (
        <mesh key={i} position={[px, -1.3, -0.6]}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}

      {/* Low-Voltage Recessed Deck Step Lights */}
      <pointLight position={[-2.5, -1.45, 0.2]} color="#fde68a" intensity={0.6} distance={4.5} />
      <pointLight position={[2.5, -1.45, 0.2]} color="#fde68a" intensity={0.6} distance={4.5} />

      {/* Smooth Distant Mountain Horizon Ridge Silhouettes (Midnight Navy/Slate) */}
      <mesh position={[0, -1.1, -16]}>
        <coneGeometry args={[16, 3.4, 32]} />
        <meshStandardMaterial color="#141d30" roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[-7, -1.2, -18]}>
        <coneGeometry args={[14, 3.0, 32]} />
        <meshStandardMaterial color="#101726" roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[8, -1.0, -20]}>
        <coneGeometry args={[15, 3.6, 32]} />
        <meshStandardMaterial color="#121929" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* Soft Drifting Cosmic Cloud Wisps across horizon */}
      <group ref={cloudsRef} position={[0, 1.2, -12]}>
        {[-6, 0, 7].map((cx, i) => (
          <mesh key={i} position={[cx, (i % 2) * 0.8, 0]}>
            <planeGeometry args={[10, 4]} />
            <meshBasicMaterial
              map={softSmokeTexture}
              color={secondaryColor}
              transparent
              opacity={0.07}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* Rare Procedural Shooting Star Meteor Streak */}
      <group ref={shootingStarRef} visible={false}>
        <mesh rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.015, 0.002, 2.2, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ========================================================
          2. ASTRONOMICAL REFRACTOR TELESCOPE ON TRIPOD
             (Mathematically anchored, sturdy, and recognizable)
      ======================================================== */}
      <group ref={scopeRef} position={[-1.3, -1.6, 1.2]} rotation={[0, -0.22, 0]}>
        {/* Tripod Legs: 3 sturdy tubular legs meeting precisely at the central collar hub */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => {
          // Angle from vertical: 0.36 rad (~20.6 deg). Length: 1.16m
          // Top of leg reaches hub at [0, 1.08, 0]. Foot rests on deck at [0.41, 0, 0]
          return (
            <group key={idx} rotation={[0, angle, 0]}>
              {/* Main Tripod Leg */}
              <mesh position={[0.205, 0.54, 0]} rotation={[0, 0, 0.36]}>
                <cylinderGeometry args={[0.022, 0.026, 1.16, 12]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
              </mesh>
              {/* Rubber Foot Cap resting flush on deck floor */}
              <mesh position={[0.41, 0.025, 0]}>
                <cylinderGeometry args={[0.032, 0.036, 0.05, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
              {/* Triangular Spreader Tray Strut connecting leg to center hub */}
              <mesh position={[0.11, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            </group>
          );
        })}

        {/* Central Tripod Accessory Tray (Holds eyepieces & filters) */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Central Tripod Collar Ring Hub */}
        <mesh position={[0, 1.08, 0]}>
          <cylinderGeometry args={[0.065, 0.075, 0.08, 18]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Vertical Mount Column Pillar */}
        <mesh position={[0, 1.17, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.14, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Altitude-Azimuth Mount Head Pivot */}
        <mesh position={[0, 1.27, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {/* Brass Altitude Locking Clamp Knob */}
        <mesh position={[0.065, 1.27, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Telescope Optical Tube Assembly (Tilted upward at 38° towards the stars) */}
        <group position={[0, 1.28, 0]} rotation={[0.66, 0, 0]}>
          {/* Main Refractor Optical Tube */}
          <mesh position={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.056, 0.05, 1.1, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.22} />
          </mesh>

          {/* Tube Mounting Cradle Ring & Dovetail Plate */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.062, 0.062, 0.12, 20]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Front Dew Shield / Lens Hood (Wider protective front collar) */}
          <mesh position={[0, 0, -0.68]}>
            <cylinderGeometry args={[0.068, 0.068, 0.22, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Gold Decorative Trim Ring at front */}
          <mesh position={[0, 0, -0.79]}>
            <torusGeometry args={[0.068, 0.005, 8, 24]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
          </mesh>

          {/* Coated Objective Lens Glass Face */}
          <mesh position={[0, 0, -0.76]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.062, 24]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={0.45}
              roughness={0.08}
              metalness={0.95}
            />
          </mesh>

          {/* Finder Scope (Cleanly mounted on dual bracket rings) */}
          <group position={[0, 0.09, -0.22]}>
            {/* Finder Body Tube */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.014, 0.34, 14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Finder Objective Lens */}
            <mesh position={[0, 0, -0.17]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.015, 12]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Dual Mounting Stalks */}
            <mesh position={[0, -0.028, -0.08]}>
              <boxGeometry args={[0.012, 0.045, 0.02]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            <mesh position={[0, -0.028, 0.08]}>
              <boxGeometry args={[0.012, 0.045, 0.02]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>

          {/* Rear Focuser Drawtube */}
          <mesh position={[0, 0, 0.49]}>
            <cylinderGeometry args={[0.038, 0.038, 0.16, 18]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.18} />
          </mesh>
          {/* Dual Knurled Focuser Adjustment Knobs */}
          <mesh position={[0.052, -0.02, 0.46]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.052, -0.02, 0.46]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 12]} />
            <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* 90-Degree Star Diagonal Prism Block & Eyepiece */}
          <group position={[0, 0, 0.6]}>
            {/* Diagonal Housing */}
            <mesh>
              <boxGeometry args={[0.065, 0.065, 0.065]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Eyepiece Holder angled upward for comfortable viewing */}
            <mesh position={[0, 0.055, 0]}>
              <cylinderGeometry args={[0.02, 0.022, 0.07, 14]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Rubber Eyecup */}
            <mesh position={[0, 0.095, 0]}>
              <cylinderGeometry args={[0.026, 0.02, 0.02, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================
          3. LUMINOUS CELESTIAL MOON / VOLUMETRIC ORB
      ======================================================== */}
      <group ref={moonRef} position={[2.6, 2.0, -9]}>
        {/* Core Moon Sphere */}
        <mesh>
          <sphereGeometry args={[1.3, 32, 32]} />
          <meshBasicMaterial color="#fef3c7" />
        </mesh>

        {/* Soft Volumetric Halo (Layer 1) */}
        <mesh>
          <sphereGeometry args={[1.65, 24, 24]} />
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Outer Lunar Corona Halo (Layer 2) */}
        <mesh>
          <sphereGeometry args={[2.2, 24, 24]} />
          <meshBasicMaterial
            color={secondaryColor}
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Moonlight Casting Soft Radiance with Audio-Reactive Breath */}
        <pointLight ref={moonLightRef} color="#fef3c7" intensity={2.0} distance={22} decay={2} />
      </group>

      {/* ========================================================
          4. CONSTELLATION GEOMETRY LINES
      ======================================================== */}
      <line geometry={constellationGeometry}>
        <lineBasicMaterial color={secondaryColor} transparent opacity={0.45} linewidth={1} />
      </line>

      {/* Constellation Star Node Highlights */}
      {constellationPoints.map((pt, idx) => (
        <mesh key={idx} position={pt}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* ========================================================
          5. DEEP LAYERED STARFIELD (ZERO SQUARE PARTICLES)
      ======================================================== */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.17}
          map={softTexture}
          color="#f8fafc"
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
