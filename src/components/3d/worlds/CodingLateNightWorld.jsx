import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProceduralScreen from '../hybrid/ProceduralScreen';
import { getSoftSmokeTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * CodingLateNightWorld
 * 
 * Experiential 3D environment for "Coding Late Night".
 * Evokes the focused flow state of deep nighttime programming:
 * - Desktop setup with dual monitors running syntax-highlighted procedural code & logs
 * - Blinking terminal cursor & back wall bias lighting
 * - Mechanical keyboard with underglow & ceramic coffee mug with soft steam
 * - Midnight room wall with a side window looking onto distant quiet city bokeh
 * - Full-width desk surface with ZERO side voids or pitch-black dead zones
 */
export default function CodingLateNightWorld({ vibe }) {
  const steamRef = useRef();
  const dustRef = useRef();
  const deskLampRef = useRef();

  const primaryColor = vibe?.colors?.primary || '#06b6d4';
  const secondaryColor = vibe?.colors?.secondary || '#8b5cf6';
  const accentColor = vibe?.colors?.accent || '#f59e0b';

  // 1. Soft Coffee Steam Particles (Zero hard square edges)
  const steamCount = 18;
  const [steamPositions, steamSpeeds] = useMemo(() => {
    const pos = new Float32Array(steamCount * 3);
    const spd = new Float32Array(steamCount);
    for (let i = 0; i < steamCount; i++) {
      pos[i * 3] = -1.05 + (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = -0.72 + Math.random() * 0.45;
      pos[i * 3 + 2] = 1.35 + (Math.random() - 0.5) * 0.08;
      spd[i] = 0.08 + Math.random() * 0.07;
    }
    return [pos, spd];
  }, [steamCount]);

  const softSmokeTexture = useMemo(() => getSoftSmokeTexture(), []);

  // 2. Ambient Floating Dust Motes in Lamp Beam
  const dustCount = 35;
  const [dustPositions] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = -0.5 + (Math.random() - 0.5) * 2.5;
      pos[i * 3 + 1] = -0.8 + Math.random() * 1.6;
      pos[i * 3 + 2] = 0.2 + (Math.random() - 0.5) * 1.8;
    }
    return [pos];
  }, [dustCount]);

  // 3. Distant City Bokeh Lights visible through the side window
  const bokehLights = useMemo(() => {
    const lights = [];
    const colors = ['#38bdf8', '#f59e0b', '#ec4899', '#a855f7', '#10b981', '#ffffff'];
    for (let i = 0; i < 24; i++) {
      lights.push({
        x: -4.2 + (Math.random() - 0.5) * 1.6,
        y: 0.2 + (Math.random() - 0.5) * 1.8,
        z: -3.8 - Math.random() * 2.0,
        size: 0.06 + Math.random() * 0.12,
        color: colors[i % colors.length],
        opacity: 0.35 + Math.random() * 0.45,
      });
    }
    return lights;
  }, []);

  useFrame((state, delta) => {
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.30;

    // Animate coffee steam
    if (steamRef.current) {
      const pos = steamRef.current.geometry.attributes.position.array;
      for (let i = 0; i < steamCount; i++) {
        pos[i * 3 + 1] += delta * steamSpeeds[i];
        pos[i * 3] += Math.sin(state.clock.elapsedTime * 2.0 + i) * 0.0006;
        if (pos[i * 3 + 1] > -0.15) {
          pos[i * 3 + 1] = -0.72;
          pos[i * 3] = -1.05 + (Math.random() - 0.5) * 0.08;
        }
      }
      steamRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate subtle dust motes
    if (dustRef.current) {
      const dPos = dustRef.current.geometry.attributes.position.array;
      const audioSpeed = audio.mid * 0.001;
      for (let i = 0; i < dustCount; i++) {
        dPos[i * 3 + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i) * (0.0008 + audioSpeed);
        dPos[i * 3] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.0006;
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Desk task lamp subtle bass breathing
    if (deskLampRef.current) {
      const audioPulse = audio.bass * lightMult * 0.75;
      deskLampRef.current.intensity = 1.8 + audioPulse;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. WIDE ROOM WALL & AMBIENT DEPTH (No dark side voids)
      ======================================================== */}
      {/* Back Wall */}
      <mesh position={[0, 1.8, -4.2]}>
        <planeGeometry args={[36, 16]} />
        <meshStandardMaterial
          color="#0b111e"
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* Subtle floor under desk */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial color="#070c14" roughness={0.8} />
      </mesh>

      {/* ========================================================
          2. SIDE WINDOW & DISTANT CITY BOKEH (Left mid-ground)
      ======================================================== */}
      <group position={[-3.8, 1.1, -3.4]}>
        {/* Window Aperture Glass Pane */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.8, 2.4]} />
          <meshBasicMaterial color="#051020" transparent opacity={0.75} />
        </mesh>

        {/* Minimalist Window Outer Frame */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.88, 2.48, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.76, 2.36, 0.06]} />
          <meshBasicMaterial color="#030712" />
        </mesh>

        {/* Window Cross Mullions */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.03, 2.36, 0.04]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 0.2, 0.04]}>
          <boxGeometry args={[1.76, 0.03, 0.04]} />
          <meshStandardMaterial color="#334155" />
        </mesh>

        {/* Window Sill */}
        <mesh position={[0, -1.24, 0.08]}>
          <boxGeometry args={[2.0, 0.08, 0.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Distant City Bokeh Spheres/Circles */}
        {bokehLights.map((b, idx) => (
          <mesh key={idx} position={[b.x + 3.8, b.y - 1.1, -0.4]}>
            <circleGeometry args={[b.size, 14]} />
            <meshBasicMaterial
              color={b.color}
              transparent
              opacity={b.opacity}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}

        {/* Subtle nocturnal sky glow through window */}
        <pointLight position={[0, 0.4, 0.3]} color="#38bdf8" intensity={0.65} distance={3.8} />
      </group>

      {/* ========================================================
          3. FULL-WIDTH STUDIO DESK SURFACE (No side voids)
      ======================================================== */}
      <group position={[0, -1.15, 0.8]}>
        {/* Main Desktop Surface (Expansive width) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 0.12, 4.2]} />
          <meshStandardMaterial
            color="#131b2e"
            roughness={0.4}
            metalness={0.25}
          />
        </mesh>

        {/* Front Edge Bevel Trim */}
        <mesh position={[0, -0.06, 2.11]}>
          <boxGeometry args={[32, 0.04, 0.04]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Desk Under-Glow Accent Strip */}
        <pointLight position={[0, -0.2, 1.8]} color={secondaryColor} intensity={0.8} distance={3.5} />

        {/* Oversized Felt Desk Mat */}
        <mesh position={[0.1, 0.065, 0.15]}>
          <boxGeometry args={[2.8, 0.01, 1.2]} />
          <meshStandardMaterial color="#090d16" roughness={0.9} />
        </mesh>
      </group>

      {/* ========================================================
          4. MAIN CODING WORKSTATION MONITORS
      ======================================================== */}
      {/* Primary Ultrawide Coding Monitor (Center-Left) */}
      <group position={[-0.25, -0.25, 0.45]} rotation={[0, 0.08, 0]}>
        <ProceduralScreen
          width={2.2}
          height={1.35}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          accentColor={accentColor}
          biasGlow={true}
        />
      </group>

      {/* Secondary Vertical Code / Server Log Monitor (Right Side) */}
      <group position={[1.45, -0.18, 0.32]} rotation={[0, -0.28, 0]}>
        <ProceduralScreen
          width={0.95}
          height={1.48}
          primaryColor={secondaryColor}
          secondaryColor={accentColor}
          accentColor="#10b981"
          biasGlow={false}
        />
      </group>

      {/* Studio Audio Monitor Speakers (Flanking screen) */}
      {/* Left Speaker */}
      <group position={[-1.75, -0.62, 0.55]} rotation={[0, 0.26, 0]}>
        <mesh>
          <boxGeometry args={[0.26, 0.44, 0.28]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Tweeter & Woofer */}
        <mesh position={[0, 0.1, 0.145]}>
          <circleGeometry args={[0.042, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.09, 0.145]}>
          <circleGeometry args={[0.085, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Right Speaker */}
      <group position={[2.25, -0.62, 0.45]} rotation={[0, -0.32, 0]}>
        <mesh>
          <boxGeometry args={[0.26, 0.44, 0.28]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0.145]}>
          <circleGeometry args={[0.042, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.09, 0.145]}>
          <circleGeometry args={[0.085, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================
          5. MECHANICAL KEYBOARD & MOUSE
      ======================================================== */}
      {/* Mechanical 75% Keyboard */}
      <group position={[-0.1, -1.06, 1.12]} rotation={[-0.04, 0, 0]}>
        {/* Keyboard Body Case */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.82, 0.035, 0.29]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* RGB Underglow Strip Base */}
        <mesh position={[0, -0.015, 0]}>
          <boxGeometry args={[0.84, 0.008, 0.30]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.65} />
        </mesh>
        {/* Keycaps Grid Surface */}
        <mesh position={[0, 0.024, 0]}>
          <boxGeometry args={[0.77, 0.015, 0.24]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.3}
            metalness={0.5}
            emissive={primaryColor}
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Ergonomic Mouse */}
      <group position={[0.55, -1.06, 1.15]}>
        <mesh position={[0, 0, 0]} scale={[1, 0.45, 1.6]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Mouse Scroll Wheel Glow */}
        <mesh position={[0, 0.024, -0.02]}>
          <boxGeometry args={[0.01, 0.015, 0.03]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
      </group>

      {/* Developer Notebook with Fine-Point Pen */}
      <group position={[0.98, -1.06, 1.1]} rotation={[0, -0.15, 0]}>
        {/* Notebook Cover */}
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.38, 0.016, 0.52]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {/* Open Pages */}
        <mesh position={[0, 0.017, 0]}>
          <boxGeometry args={[0.35, 0.005, 0.48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Abstract notes lines */}
        {[-0.14, -0.06, 0.02, 0.1, 0.18].map((ly, idx) => (
          <mesh key={idx} position={[0, 0.021, ly]}>
            <planeGeometry args={[0.26, 0.008]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.4} />
          </mesh>
        ))}
        {/* Pen alongside */}
        <mesh position={[0.22, 0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.38, 8]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Studio Over-Ear Headphones resting on desk */}
      <group position={[-1.5, -1.04, 1.05]} rotation={[0, 0.35, 0]}>
        {/* Headband Arc */}
        <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.12, 0.014, 8, 20, Math.PI]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Left Earcup */}
        <mesh position={[-0.12, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Right Earcup */}
        <mesh position={[0.12, 0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================
          6. CERAMIC COFFEE MUG & STEAM PARTICLES
      ======================================================== */}
      <group position={[-1.05, -0.98, 1.28]}>
        {/* Mug Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.058, 0.15, 18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Dark Liquid Coffee Surface */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.058, 16]} />
          <meshStandardMaterial color="#1c120c" roughness={0.1} metalness={0.8} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.042, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>

      {/* Soft Rising Coffee Steam (Zero square edges) */}
      <points ref={steamRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={steamCount}
            array={steamPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          map={softSmokeTexture}
          color="#f8fafc"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* ========================================================
          7. MINIMALIST DESK TASK LAMP
      ======================================================== */}
      <group position={[-1.35, -0.6, 0.7]}>
        {/* Lamp Base on desk */}
        <mesh position={[0, -0.48, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Angled Arm */}
        <mesh position={[0.12, -0.15, 0]} rotation={[0, 0, -0.32]}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Shade / Light Head */}
        <group position={[0.26, 0.18, 0]} rotation={[0, 0, -0.8]}>
          <mesh>
            <coneGeometry args={[0.11, 0.16, 16, 1, true]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Light Emitter inside shade */}
          <mesh position={[0, -0.06, 0]}>
            <circleGeometry args={[0.075, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Pool of light casting onto desk with Audio-Reactive Bass Pulse */}
          <pointLight
            ref={deskLampRef}
            position={[0, -0.15, 0]}
            color="#fef08a"
            intensity={1.8}
            distance={2.8}
            decay={2.0}
          />
        </group>
      </group>

      {/* ========================================================
          8. AMBIENT DUST MOTES FLOATING IN LIGHT
      ======================================================== */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={dustPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          map={softSmokeTexture}
          color="#fef08a"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}