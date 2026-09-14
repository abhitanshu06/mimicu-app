import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * HighwayWorld
 * 
 * Experiential 3D atmosphere for "Long Drive", "Late Night Cruise".
 * Gives the immediate, cinematic feeling: "I am inside a car on a late-night highway drive".
 * 
 * Recognizable Elements:
 * 1. Interior Car Cockpit Foreground:
 *    - Curved dark leather dashboard rim
 *    - Steering wheel silhouette (rim and spokes) with subtle road motion
 *    - Instrument cluster with softly glowing speedometer & tachometer dials
 *    - Center dashboard display with faint GPS / navigation route line
 *    - Rearview mirror silhouette mounted to top windshield frame
 *    - Windshield A-pillar silhouettes framing the exterior view
 * 2. Highway Exterior:
 *    - Receding asphalt highway surface with animated dashed yellow lane markers
 *    - Guardrails on both sides with reflector studs
 *    - Left Lane: Red taillight light streaks streaming forward into the night
 *    - Right Lane: Bright white/cyan oncoming headlights rushing past
 *    - Overhead highway sign gantries
 *    - Distant horizon vanishing glow
 */
export default function HighwayWorld({ vibe }) {
  const roadMarkingsRef = useRef();
  const forwardCarRefs = useRef([]);
  const oncomingCarRefs = useRef([]);
  const wheelRef = useRef();
  const cockpitRef = useRef();
  const dashLightRef = useRef();

  // Forward vehicles (Left Lane - red taillights moving away into distance)
  const forwardVehicles = useMemo(() => [
    { x: -1.4, initialZ: -10, speed: 13, scale: 1.0 },
    { x: -1.75, initialZ: -19, speed: 11, scale: 0.9 },
    { x: -1.35, initialZ: -29, speed: 14, scale: 0.78 },
  ], []);

  // Oncoming vehicles (Right Lane - bright white headlights rushing towards camera)
  const oncomingVehicles = useMemo(() => [
    { x: 1.45, initialZ: -14, speed: 25, scale: 0.95 },
    { x: 1.82, initialZ: -24, speed: 28, scale: 0.85 },
    { x: 1.5, initialZ: -34, speed: 24, scale: 0.75 },
  ], []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.36;

    // 1. Animate road center dashed lines rushing toward car (steady speed with subtle forward-motion enhancement)
    if (roadMarkingsRef.current) {
      const audioSpeedBonus = audio.overallEnergy * 0.45;
      roadMarkingsRef.current.position.z = (roadMarkingsRef.current.position.z + delta * (9.5 + audioSpeedBonus)) % 4;
    }

    // 2. Animate forward traffic (moving away into distance)
    for (let i = 0; i < forwardCarRefs.current.length; i++) {
      const car = forwardCarRefs.current[i];
      if (car) {
        car.position.z -= delta * forwardVehicles[i].speed;
        if (car.position.z < -36) car.position.z = -7;
      }
    }

    // 3. Animate oncoming traffic (rushing towards camera)
    for (let i = 0; i < oncomingCarRefs.current.length; i++) {
      const car = oncomingCarRefs.current[i];
      if (car) {
        car.position.z += delta * oncomingVehicles[i].speed;
        if (car.position.z > 5) car.position.z = -36;
      }
    }

    // 4. Subtle vehicle vibration & gentle steering sway
    if (cockpitRef.current) {
      cockpitRef.current.position.y = -0.05 + Math.sin(time * 12) * 0.002;
    }
    if (wheelRef.current) {
      wheelRef.current.rotation.z = Math.sin(time * 0.6) * 0.025;
    }

    // 5. Subtle dashboard backlight pulse with audio bass
    if (dashLightRef.current) {
      const audioPulse = audio.bass * lightMult * 0.85;
      dashLightRef.current.intensity = 1.2 + audioPulse;
    }
  });

  const primaryColor = vibe?.colors?.primary || '#f43f5e';
  const secondaryColor = vibe?.colors?.secondary || '#38bdf8';

  return (
    <group>
      {/* ========================================================
          1. HIGHWAY EXTERIOR: ROAD & GUARDRAILS
      ======================================================== */}
      {/* Receding Asphalt Highway Surface (Wide to avoid side voids) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, -12]}>
        <planeGeometry args={[32, 48]} />
        <meshStandardMaterial color="#111624" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* Driver Cockpit Forward Headlight Pool on Asphalt */}
      <mesh position={[0, -1.49, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 6.5]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.13} />
      </mesh>
      {/* Driver Dual Forward Headlight Illuminators */}
      <pointLight position={[-0.9, -1.1, 1.0]} color="#fef08a" intensity={1.4} distance={9} decay={1.4} />
      <pointLight position={[0.9, -1.1, 1.0]} color="#fef08a" intensity={1.4} distance={9} decay={1.4} />

      {/* Road Guardrails (Left & Right) */}
      <mesh position={[-3.8, -1.15, -12]}>
        <boxGeometry args={[0.2, 0.45, 40]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[3.8, -1.15, -12]}>
        <boxGeometry args={[0.2, 0.45, 40]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Guardrail Reflector Studs */}
      {[-24, -18, -12, -6, 0].map((z, idx) => (
        <group key={idx}>
          <mesh position={[-3.68, -1.15, z]}>
            <boxGeometry args={[0.04, 0.08, 0.1]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[3.68, -1.15, z]}>
            <boxGeometry args={[0.04, 0.08, 0.1]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* Dashed Road Center Line (Animated rushing toward car) */}
      <group ref={roadMarkingsRef} position={[0, -1.48, 0]}>
        {[-28, -24, -20, -16, -12, -8, -4, 0, 4].map((z) => (
          <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, z]}>
            <planeGeometry args={[0.18, 2.2]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.65} />
          </mesh>
        ))}
      </group>

      {/* Overhead Highway Gantry Arches */}
      {[-10, -22].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {/* Top Beam */}
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[8.2, 0.16, 0.16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Signboard */}
          <mesh position={[0.8, 1.85, 0.05]}>
            <planeGeometry args={[2.4, 0.6]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} />
          </mesh>
          {/* Support Columns */}
          <mesh position={[-4.0, 0.5, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 3.4, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[4.0, 0.5, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 3.4, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. REALISTIC VEHICLE LIGHT PAIRS & CAR SILHOUETTES
             (Zero random floating spheres; authentic highway depth)
      ======================================================== */}
      {/* A. Left Lane: Forward Traffic (Moving Away - Paired Red Taillights) */}
      {forwardVehicles.map((v, i) => (
        <group
          key={`fwd-${i}`}
          ref={(el) => (forwardCarRefs.current[i] = el)}
          position={[v.x, -1.25, v.initialZ]}
          scale={[v.scale, v.scale, v.scale]}
        >
          {/* Aerodynamic Low-Poly Dark Car Body Silhouette */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.35, 0.42, 2.6]} />
            <meshStandardMaterial color="#090e18" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Cabin Greenhouse */}
          <mesh position={[0, 0.44, -0.15]}>
            <boxGeometry args={[1.1, 0.32, 1.3]} />
            <meshStandardMaterial color="#050810" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Symmetrical Twin Red Taillights on Rear */}
          {/* Left Taillight */}
          <mesh position={[-0.44, 0.14, 1.31]}>
            <boxGeometry args={[0.22, 0.065, 0.02]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          {/* Right Taillight */}
          <mesh position={[0.44, 0.14, 1.31]}>
            <boxGeometry args={[0.22, 0.065, 0.02]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>

          {/* Taillight Asphalt Reflection / Motion Trail */}
          <mesh position={[0, -0.24, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.2, 1.4]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.2} />
          </mesh>

          {/* Local Red Ambient Light on Nearest Forward Vehicle */}
          {i === 0 && (
            <pointLight position={[0, 0.15, 1.35]} color="#ef4444" intensity={0.9} distance={4.5} />
          )}
        </group>
      ))}

      {/* B. Right Lane: Oncoming Traffic (Rushing Towards Us - Paired White Headlights) */}
      {oncomingVehicles.map((v, i) => (
        <group
          key={`onc-${i}`}
          ref={(el) => (oncomingCarRefs.current[i] = el)}
          position={[v.x, -1.25, v.initialZ]}
          scale={[v.scale, v.scale, v.scale]}
        >
          {/* Aerodynamic Low-Poly Dark Car Body Silhouette */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.35, 0.42, 2.6]} />
            <meshStandardMaterial color="#090e18" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Cabin Greenhouse */}
          <mesh position={[0, 0.44, 0.15]}>
            <boxGeometry args={[1.1, 0.32, 1.3]} />
            <meshStandardMaterial color="#050810" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Symmetrical Twin White/Warm Headlights on Front */}
          {/* Left Headlight */}
          <mesh position={[-0.44, 0.14, -1.31]}>
            <boxGeometry args={[0.22, 0.075, 0.02]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Right Headlight */}
          <mesh position={[0.44, 0.14, -1.31]}>
            <boxGeometry args={[0.22, 0.075, 0.02]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>

          {/* Headlight Forward Beam Pool on Asphalt Ahead */}
          <mesh position={[0, -0.24, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.6, 2.8]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.18} />
          </mesh>

          {/* Local Headlight Illuminator on Nearest Oncoming Vehicle */}
          {i === 0 && (
            <pointLight position={[0, 0.15, -1.35]} color="#fef08a" intensity={1.3} distance={6} />
          )}
        </group>
      ))}

      {/* C. Distant Vanishing Light Pairs at Horizon (Tiny perspective dots) */}
      {[-1.5, -1.8, 1.5, 1.9].map((hx, idx) => {
        const isTaillight = hx < 0;
        return (
          <group key={`horizon-${idx}`} position={[hx, -1.34, -36]}>
            <mesh position={[-0.08, 0, 0]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshBasicMaterial color={isTaillight ? '#ef4444' : '#fef08a'} />
            </mesh>
            <mesh position={[0.08, 0, 0]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshBasicMaterial color={isTaillight ? '#ef4444' : '#fef08a'} />
            </mesh>
          </group>
        );
      })}

      {/* Distant Horizon City Vanishing Glow */}
      <pointLight position={[0, -0.6, -32]} color={secondaryColor} intensity={1.6} distance={22} />

      {/* ========================================================
          3. CAR COCKPIT INTERIOR FOREGROUND (Inside Car Perspective)
      ======================================================== */}
      <group ref={cockpitRef} position={[0, -0.32, 3.0]}>
        {/* Curved Matte Dashboard Cowl */}
        <mesh position={[0, -1.2, -0.5]}>
          <boxGeometry args={[4.8, 0.42, 1.2]} />
          <meshStandardMaterial color="#131926" roughness={0.75} metalness={0.2} />
        </mesh>
        {/* Dashboard Top Ridge Highlight Catch */}
        <mesh position={[0, -0.98, -0.8]}>
          <boxGeometry args={[4.4, 0.02, 0.06]} />
          <meshStandardMaterial color="#1f293d" roughness={0.4} metalness={0.4} />
        </mesh>

        {/* Instrument Gauge Cluster (Behind steering wheel on left) */}
        <group position={[-0.75, -0.82, -0.72]}>
          {/* Cluster Visor Arch */}
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.72, 0.04, 0.18]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          {/* Gauge Cluster Face (Soft illuminated speedometer) */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.66, 0.18]} />
            <meshStandardMaterial
              color="#070c14"
              emissive="#0284c7"
              emissiveIntensity={0.35}
              roughness={0.2}
            />
          </mesh>
          {/* Speedometer Arc Needle */}
          <mesh position={[-0.14, 0, 0.025]}>
            <ringGeometry args={[0.045, 0.055, 16, 1, 0, Math.PI * 1.3]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Tachometer Arc */}
          <mesh position={[0.14, 0, 0.025]}>
            <ringGeometry args={[0.045, 0.055, 16, 1, 0, Math.PI * 1.1]} />
            <meshBasicMaterial color={primaryColor} />
          </mesh>
        </group>

        {/* Center Infotainment / GPS Screen */}
        <group position={[0.45, -0.85, -0.7]}>
          <mesh>
            <planeGeometry args={[0.55, 0.32]} />
            <meshStandardMaterial
              color="#080e18"
              emissive={secondaryColor}
              emissiveIntensity={0.2}
              roughness={0.1}
            />
          </mesh>
          {/* Faint GPS Navigation Route Line */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.02, 0.22]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Subtle Dashboard Ambient Instrument Light */}
        <pointLight
          ref={dashLightRef}
          position={[-0.1, -0.8, -0.6]}
          color={primaryColor}
          intensity={1.2}
          distance={3.2}
          decay={2}
        />

        {/* Steering Wheel Silhouette */}
        <group ref={wheelRef} position={[-0.75, -0.86, -0.45]}>
          {/* Wheel Outer Rim */}
          <mesh>
            <torusGeometry args={[0.34, 0.028, 16, 36]} />
            <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.2} />
          </mesh>
          {/* Center Wheel Hub */}
          <mesh position={[0, 0, -0.02]}>
            <cylinderGeometry args={[0.09, 0.09, 0.04, 20]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Center Brand Badge Accent */}
          <mesh position={[0, 0, 0.005]}>
            <circleGeometry args={[0.035, 16]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
          {/* Horizontal Spokes */}
          <mesh position={[0, -0.01, -0.01]}>
            <boxGeometry args={[0.62, 0.04, 0.025]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Bottom Spoke */}
          <mesh position={[0, -0.16, -0.01]}>
            <boxGeometry args={[0.045, 0.3, 0.025]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
        </group>

        {/* Rearview Mirror Silhouette (Mounted at top center of windshield) */}
        <group position={[0, 1.35, -0.6]}>
          {/* Mirror Stem */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Mirror Housing */}
          <mesh>
            <boxGeometry args={[0.7, 0.16, 0.05]} />
            <meshStandardMaterial color="#111827" roughness={0.5} />
          </mesh>
          {/* Mirror Glass with Night-Tint Dimming */}
          <mesh position={[0, 0, 0.028]}>
            <planeGeometry args={[0.66, 0.13]} />
            <meshStandardMaterial
              color="#0d1b2a"
              roughness={0.08}
              metalness={0.9}
              emissive="#1e3a8a"
              emissiveIntensity={0.15}
            />
          </mesh>
        </group>

        {/* A-pillars removed to prevent dark diagonal bars cutting through UI cards */}
      </group>
    </group>
  );
}
