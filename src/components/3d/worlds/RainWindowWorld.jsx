import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture, getSoftSmokeTexture, getBokehTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * RainWindowWorld
 * 
 * Experiential 3D atmosphere for "Rainy Window", "Monsoon", "Bathing".
 * Creates the immersive perspective of looking through a rain-streaked window into a blurred nocturnal city.
 * 
 * Recognizable Elements:
 * 1. Realistic Window Frame & Sash:
 *    - Deep indoor window sill in the lower foreground
 *    - Vertical mullion bar and horizontal sash frame dividing glass panes
 * 2. Foreground Window Sill Elements:
 *    - Steaming ceramic coffee/tea mug with gentle curling steam
 *    - Small potted indoor succulent plant silhouette
 * 3. Water Droplets on Glass:
 *    - Soft, organic water droplets trickling slowly down the glass pane (zero square edges)
 * 4. Outside Weather:
 *    - Angled falling rain streaks outside in the dark
 *    - Beautiful out-of-focus city bokeh light orbs shimmering through the wet glass
 */
export default function RainWindowWorld({ vibe }) {
  const rainRef = useRef();
  const dropletsRef = useRef();
  const bokehRef = useRef();
  const mugSteamRef = useRef();
  const sillLightRef = useRef();

  const softParticleTexture = useMemo(() => getSoftParticleTexture(), []);
  const softSteamTexture = useMemo(() => getSoftSmokeTexture(), []);
  const bokehTexture = useMemo(() => getBokehTexture(), []);

  const rainCount = 190;
  const dropletCount = 65;
  const steamCount = 16;

  // 1. Falling rain particle streaks outside
  const [rainPositions] = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 10 - 3.5;
      pos[i * 3 + 2] = -Math.random() * 8 - 1;
    }
    return [pos];
  }, [rainCount]);

  // 2. Water droplets on window glass
  const [dropletPositions, dropletSpeeds, dropletScales] = useMemo(() => {
    const pos = new Float32Array(dropletCount * 3);
    const spd = new Float32Array(dropletCount);
    const sca = new Float32Array(dropletCount);
    for (let i = 0; i < dropletCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6.2;
      pos[i * 3 + 1] = Math.random() * 4.8 - 1.8;
      pos[i * 3 + 2] = 2.85; // on the glass plane
      spd[i] = Math.random() * 0.35 + 0.15;
      sca[i] = 0.08 + Math.random() * 0.08;
    }
    return [pos, spd, sca];
  }, [dropletCount]);

  // 3. Mug steam particles
  const [steamPositions, steamMeta] = useMemo(() => {
    const pos = new Float32Array(steamCount * 3);
    const meta = [];
    const mugX = 1.35;
    const mugY = -1.25;
    const mugZ = 2.92;

    for (let i = 0; i < steamCount; i++) {
      const life = Math.random();
      pos[i * 3] = mugX + (Math.random() - 0.5) * 0.03;
      pos[i * 3 + 1] = mugY + life * 0.45;
      pos[i * 3 + 2] = mugZ + (Math.random() - 0.5) * 0.03;
      meta.push({
        life,
        speed: 0.16 + Math.random() * 0.1,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }
    return [pos, meta];
  }, [steamCount]);

  // 4. Out of focus Bokeh light orbs outside
  const bokehLights = useMemo(() => {
    const lights = [];
    const colors = ['#f59e0b', '#38bdf8', '#ef4444', '#a855f7', '#10b981', '#fef08a'];
    for (let i = 0; i < 28; i++) {
      lights.push({
        x: (Math.random() - 0.5) * 16,
        y: Math.random() * 6 - 1.5,
        z: -Math.random() * 10 - 5,
        size: Math.random() * 0.5 + 0.35,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.45 + 0.25,
      });
    }
    return lights;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.28;
    const midMult = audio.profile?.midStrength ?? 0.3;

    // A. Falling rain streaks outside (subtle uniform pace modulation, physically believable)
    if (rainRef.current) {
      const pos = rainRef.current.geometry.attributes.position.array;
      const audioRainSpeed = audio.mid * midMult * 2.2;
      for (let i = 0; i < rainCount; i++) {
        pos[i * 3 + 1] -= delta * (13.5 + audioRainSpeed);
        pos[i * 3] -= delta * 1.8; // diagonal wind
        if (pos[i * 3 + 1] < -4) {
          pos[i * 3 + 1] = 6.5;
          pos[i * 3] = (Math.random() - 0.5) * 14;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // B. Water droplets trickling down glass
    if (dropletsRef.current) {
      const pos = dropletsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < dropletCount; i++) {
        pos[i * 3 + 1] -= delta * dropletSpeeds[i];
        if (pos[i * 3 + 1] < -2.1) {
          pos[i * 3 + 1] = 2.4;
          pos[i * 3] = (Math.random() - 0.5) * 6.2;
        }
      }
      dropletsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // C. Mug steam
    if (mugSteamRef.current) {
      const pos = mugSteamRef.current.geometry.attributes.position.array;
      const mugX = 1.35;
      const mugY = -1.25;
      for (let i = 0; i < steamCount; i++) {
        steamMeta[i].life += delta * steamMeta[i].speed;
        if (steamMeta[i].life > 1.0) {
          steamMeta[i].life = 0;
          pos[i * 3] = mugX + (Math.random() - 0.5) * 0.03;
          pos[i * 3 + 1] = mugY;
        } else {
          pos[i * 3 + 1] = mugY + steamMeta[i].life * 0.45;
          pos[i * 3] = mugX + Math.sin(time * 2.2 + steamMeta[i].wobblePhase) * 0.015 * steamMeta[i].life;
        }
      }
      mugSteamRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // D. Bokeh gentle pulsation with treble shimmer
    if (bokehRef.current) {
      bokehRef.current.rotation.y = Math.sin(time * 0.15) * 0.04 + audio.treble * 0.018;
    }

    // E. Subtle Warm Interior Room Bounce onto Sill with bass pulse
    if (sillLightRef.current) {
      const audioPulse = audio.bass * lightMult * 0.85;
      sillLightRef.current.intensity = 0.8 + audioPulse;
    }
  });

  const primaryColor = vibe?.colors?.primary || '#0284c7';
  const secondaryColor = vibe?.colors?.secondary || '#38bdf8';

  return (
    <group>
      {/* ========================================================
          1. REALISTIC WINDOW ARCHITECTURE & SILL
      ======================================================== */}
      <group position={[0, 0, 2.9]}>
        {/* Main Glass Pane (Physical material with soft transmission) */}
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[9, 5.8]} />
          <meshPhysicalMaterial
            roughness={0.12}
            transmission={0.88}
            thickness={0.08}
            transparent
            opacity={0.2}
            color="#0f1d30"
          />
        </mesh>

        {/* Deep Indoor Window Sill (Lower foreground ledge) */}
        <mesh position={[0, -1.55, 0.15]}>
          <boxGeometry args={[9.4, 0.24, 0.65]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Sill Front Beveled Edge catching soft interior reflection */}
        <mesh position={[0, -1.55, 0.48]}>
          <boxGeometry args={[9.4, 0.04, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
        </mesh>

        {/* Outer Perimeter Window Frame (Kept at peripheral edges away from UI) */}
        <mesh position={[-5.2, 0.2, 0.04]}>
          <boxGeometry args={[0.2, 5.8, 0.08]} />
          <meshStandardMaterial color="#161f30" roughness={0.6} />
        </mesh>
        <mesh position={[5.2, 0.2, 0.04]}>
          <boxGeometry args={[0.2, 5.8, 0.08]} />
          <meshStandardMaterial color="#161f30" roughness={0.6} />
        </mesh>
        <mesh position={[0, 2.9, 0.04]}>
          <boxGeometry args={[10.6, 0.16, 0.08]} />
          <meshStandardMaterial color="#161f30" roughness={0.6} />
        </mesh>
      </group>

      {/* ========================================================
          2. FOREGROUND WINDOW SILL: STEAMING MUG & SUCCULENT
      ======================================================== */}
      {/* Steaming Ceramic Mug on Right Window Sill */}
      <group position={[1.35, -1.35, 3.1]}>
        {/* Mug Body */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.09, 0.075, 0.2, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[-0.1, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.05, 0.014, 10, 20, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Dark Tea/Coffee Liquid */}
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.2} />
        </mesh>
      </group>

      {/* Soft Wispy Mug Steam Particles (ZERO square artifacts) */}
      <points ref={mugSteamRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={steamCount}
            array={steamPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          map={softSteamTexture}
          color="#f8fafc"
          transparent
          opacity={0.3}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Small Potted Plant Silhouette on Left Window Sill */}
      <group position={[-1.6, -1.35, 3.1]}>
        {/* Terracotta / Ceramic Pot */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.1, 0.07, 0.16, 18]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Succulent Leaves */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.04, 0.18, Math.sin(angle) * 0.04]}
              rotation={[0.3, angle, 0]}
            >
              <coneGeometry args={[0.04, 0.12, 8]} />
              <meshStandardMaterial color="#065f46" roughness={0.6} />
            </mesh>
          );
        })}
      </group>

      {/* ========================================================
          3. WATER DROPLETS & CONDENSATION TRAILS ON GLASS
      ======================================================== */}
      {/* Sliding Water Trails / Rivulets */}
      {[-2.2, -1.5, -0.8, -0.2, 0.5, 1.1, 1.8, 2.5].map((tx, idx) => (
        <mesh key={`trail-${idx}`} position={[tx, 0.4 - (idx % 3) * 0.5, 2.86]}>
          <planeGeometry args={[0.012, 0.75 + (idx % 2) * 0.4]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* Dynamic Water Droplets Trickling down glass */}
      <points ref={dropletsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dropletCount}
            array={dropletPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          map={softParticleTexture}
          color="#bae6fd"
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ========================================================
          4. FALLING RAIN STREAKS OUTSIDE
      ======================================================== */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={rainCount}
            array={rainPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          map={softParticleTexture}
          color="#38bdf8"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ========================================================
          5. DISTANT CITY SKYLINE SILHOUETTES (z = -20)
      ======================================================== */}
      <group position={[0, 0, -20]}>
        {[-16, -11, -6, -1, 4, 9, 14].map((bx, idx) => {
          const h = 7 + (idx % 4) * 3;
          const w = 3.5 + (idx % 2) * 1.5;
          return (
            <group key={`skyline-${idx}`} position={[bx, h / 2 - 2, 0]}>
              <mesh>
                <boxGeometry args={[w, h, 1.5]} />
                <meshStandardMaterial color="#0b1220" roughness={0.85} />
              </mesh>
              {/* Blurred Window Pinpoints */}
              {[-1.0, 0.5, 2.0].map((wy, wi) => (
                <mesh key={wi} position={[0, wy, 0.78]}>
                  <planeGeometry args={[w * 0.7, 0.14]} />
                  <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>

      {/* ========================================================
          6. BLURRED NOCTURNAL CITY BOKEH ORBS OUTSIDE
      ======================================================== */}
      <group ref={bokehRef}>
        {bokehLights.map((b, idx) => (
          <mesh key={idx} position={[b.x, b.y, b.z]}>
            <sphereGeometry args={[b.size, 16, 16]} />
            <meshBasicMaterial
              color={b.color}
              transparent
              opacity={b.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Subtle Warm Interior Room Bounce onto Sill with Audio-Reactive Bass Pulse */}
      <pointLight ref={sillLightRef} position={[0, -1.0, 3.2]} color="#fed7aa" intensity={0.8} distance={4.2} />
    </group>
  );
}
