import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * GamingWorld
 * 
 * Aesthetic 3D Battlestation / Late-Night Gaming Room.
 * Recognizable Elements:
 * 1. Ergonomic Gaming Desk (matte beveled chamfer, cable pass-through, large desk mat)
 * 2. Dual Monitors:
 *    - Main 32" ultrawide display centered with illuminated display content
 *    - Secondary 24" vertical display angled on the left
 *    - Slim bezels, dual desk-mounted monitor arm
 *    - Monitor Light Bar on top casting a soft warm wash downward onto the desk
 * 3. Mechanical Keyboard (TKL layout with subtle underglow keycap lighting)
 * 4. Gaming Mouse with scroll wheel accent light resting on the stitched desk mat
 * 5. Headphone Stand with over-ear gaming headset
 * 6. High-Back Gaming Chair Silhouette behind the desk (headrest, lumbar pillow, bolsters)
 * 7. Gaming PC Tower (tempered glass side panel, GPU silhouette, soft spinning circular cooler LED)
 * 8. Ambient Wall Bias Lighting & floating soft dust particles (ZERO square artifacts)
 */
export default function GamingWorld({ vibe }) {
  const fanRef = useRef();
  const screenGlowLightRef = useRef();
  const dustRef = useRef();
  const ambientPulseRef = useRef();

  const primaryColor = vibe?.colors?.primary || '#10b981';
  const secondaryColor = vibe?.colors?.secondary || '#06b6d4';
  const accentColor = vibe?.colors?.accent || '#34d399';

  // Ambient dust motes floating in the room caught by monitor beam
  const dustCount = 40;
  const [dustPositions] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 4.5;
      pos[i * 3 + 1] = Math.random() * 2.8 - 1.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.5 + 0.5;
    }
    return [pos];
  }, [dustCount]);

  const softDustTexture = useMemo(() => getSoftParticleTexture(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.52;

    // 1. Subtle GPU / CPU cooler ring rotation
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * (2.2 + audio.mid * 0.8);
    }

    // 2. Controlled breathing of monitor screen glow with treble shimmer
    if (screenGlowLightRef.current) {
      const audioTreble = audio.treble * lightMult * 0.7;
      screenGlowLightRef.current.intensity = 1.4 + Math.sin(time * 1.2) * 0.25 + audioTreble;
    }

    // 3. Floating dust drift
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array;
      const audioSpeed = audio.mid * 0.015;
      for (let i = 0; i < dustCount; i++) {
        pos[i * 3 + 1] += delta * (0.025 + audioSpeed);
        pos[i * 3] += Math.sin(time * 0.5 + i) * 0.0006;
        if (pos[i * 3 + 1] > 2.0) {
          pos[i * 3 + 1] = -1.1;
        }
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Subtle wall bias backlight breath with bass pulse
    if (ambientPulseRef.current) {
      const audioBass = audio.bass * lightMult * 0.95;
      ambientPulseRef.current.intensity = 1.6 + Math.sin(time * 0.8) * 0.3 + audioBass;
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      {/* ========================================================
          ROOM BACK WALL & ACOUSTIC PANELS
      ======================================================== */}
      {/* Back Wall (Wide panorama to avoid boundaries) */}
      <mesh position={[0, 0.8, -2.2]}>
        <planeGeometry args={[36, 16]} />
        <meshStandardMaterial color="#0c121d" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* Decorative Wall Slat Acoustic Panels (Left & Right) */}
      {[-2.8, -2.5, -2.2, 2.2, 2.5, 2.8].map((x, i) => (
        <mesh key={i} position={[x, 1.2, -2.15]}>
          <boxGeometry args={[0.16, 3.2, 0.04]} />
          <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}

      {/* Monitor Wall Bias Backlight (Subtle atmospheric glow against back wall) */}
      <pointLight
        ref={ambientPulseRef}
        position={[0, 0.8, -1.8]}
        color={secondaryColor}
        intensity={1.8}
        distance={6}
        decay={2}
      />

      {/* ========================================================
          1. GAMING DESK
      ======================================================== */}
      {/* Desktop Main Surface */}
      <mesh position={[0, -0.9, 0.2]}>
        <boxGeometry args={[5.2, 0.08, 2.2]} />
        <meshStandardMaterial color="#0d111b" roughness={0.4} metalness={0.45} />
      </mesh>

      {/* Desk Chamfer Front Edge Highlight (catches ambient light) */}
      <mesh position={[0, -0.9, 1.3]}>
        <boxGeometry args={[5.2, 0.04, 0.03]} />
        <meshStandardMaterial color="#1f293d" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Heavy-Duty Metal Desk Legs (Left & Right T-frame) */}
      <mesh position={[-2.3, -1.5, 0.2]}>
        <boxGeometry args={[0.08, 1.15, 1.6]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[2.3, -1.5, 0.2]}>
        <boxGeometry args={[0.08, 1.15, 1.6]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Extended Stitched Desk Mat / Mousepad */}
      <mesh position={[0, -0.855, 0.35]}>
        <boxGeometry args={[2.8, 0.01, 1.1]} />
        <meshStandardMaterial color="#161e2e" roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Desk Mat Edge Stitch Line (Subtle accent glow) */}
      <mesh position={[0, -0.854, 0.35]}>
        <boxGeometry args={[2.82, 0.005, 1.12]} />
        <meshBasicMaterial color={primaryColor} transparent opacity={0.25} />
      </mesh>

      {/* ========================================================
          2. DUAL MONITORS & MOUNT
      ======================================================== */}
      {/* Heavy Duty Dual Monitor Desk Mount Arm */}
      <group position={[0, -0.85, -0.6]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.9, 16]} />
          <meshStandardMaterial color="#1f293d" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.75, 0.15]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.8, 0.04, 0.15]} />
          <meshStandardMaterial color="#1f293d" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* --- A. MAIN 32" CURVED MONITOR (Center) --- */}
      <group position={[0.2, 0.15, -0.3]}>
        {/* Monitor Bezel Frame */}
        <mesh>
          <boxGeometry args={[2.4, 1.35, 0.06]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Display Panel Face */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[2.32, 1.28]} />
          <meshStandardMaterial
            color="#09101d"
            roughness={0.2}
            metalness={0.3}
            emissive="#041824"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Stylized On-Screen UI / Code Lines / Game Radar */}
        {/* Top Header Bar on screen */}
        <mesh position={[0, 0.52, 0.034]}>
          <planeGeometry args={[2.1, 0.06]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
        </mesh>
        {/* Main Interface Content Bars */}
        <mesh position={[-0.45, 0.1, 0.034]}>
          <planeGeometry args={[1.1, 0.65]} />
          <meshBasicMaterial color="#0e2a3b" transparent opacity={0.85} />
        </mesh>
        {/* Side Code Lines */}
        {[-0.15, -0.05, 0.05, 0.15, 0.25].map((y, i) => (
          <mesh key={i} position={[-0.45, y, 0.036]}>
            <planeGeometry args={[0.9 - (i % 3) * 0.2, 0.025]} />
            <meshBasicMaterial color={i === 2 ? accentColor : '#38bdf8'} transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Radar / Scope Circle on Right of screen */}
        <mesh position={[0.55, 0.1, 0.034]}>
          <ringGeometry args={[0.24, 0.26, 32]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.75} />
        </mesh>
        <mesh position={[0.55, 0.1, 0.034]}>
          <ringGeometry args={[0.12, 0.13, 24]} />
          <meshBasicMaterial color={secondaryColor} transparent opacity={0.6} />
        </mesh>

        {/* Monitor Screen Wash Light (illuminates keyboard and desk) */}
        <spotLight
          ref={screenGlowLightRef}
          position={[0, 0, 0.4]}
          target-position={[0, -0.9, 0.5]}
          color={secondaryColor}
          intensity={1.5}
          distance={4.5}
          angle={Math.PI / 3}
          penumbra={0.7}
        />

        {/* Screenbar Light Bar Mounted to Top of Monitor */}
        <group position={[0, 0.72, 0.05]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.015, 0.02]}>
            <boxGeometry args={[1.35, 0.01, 0.02]} />
            <meshBasicMaterial color="#fef3c7" transparent opacity={0.6} />
          </mesh>
          <pointLight position={[0, -0.05, 0.1]} color="#fef3c7" intensity={0.8} distance={1.8} />
        </group>
      </group>

      {/* --- B. SECONDARY 24" VERTICAL MONITOR (Left, Angled 28 deg inward) --- */}
      <group position={[-1.45, 0.2, -0.1]} rotation={[0, 0.48, 0]}>
        {/* Bezel */}
        <mesh>
          <boxGeometry args={[0.9, 1.55, 0.05]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Display */}
        <mesh position={[0, 0, 0.028]}>
          <planeGeometry args={[0.84, 1.48]} />
          <meshStandardMaterial
            color="#080e18"
            roughness={0.2}
            metalness={0.2}
            emissive="#02151f"
            emissiveIntensity={0.5}
          />
        </mesh>
        {/* Stream of Terminal Logs / Discord UI */}
        {[-0.5, -0.35, -0.2, -0.05, 0.1, 0.25, 0.4, 0.55].map((y, i) => (
          <mesh key={i} position={[-0.05, y, 0.03]}>
            <planeGeometry args={[0.68 - (i % 4) * 0.1, 0.03]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? primaryColor : '#64748b'}
              transparent
              opacity={0.65}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          3. MECHANICAL KEYBOARD
      ======================================================== */}
      <group position={[0.1, -0.84, 0.45]}>
        {/* Keyboard Base Case */}
        <mesh>
          <boxGeometry args={[1.1, 0.03, 0.38]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.7} />
        </mesh>

        {/* Keycap Island Plate */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[1.04, 0.015, 0.34]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>

        {/* Keycap Rows (Individual tactile rows) */}
        {[-0.12, -0.06, 0.0, 0.06, 0.12].map((z, rowIdx) => (
          <mesh key={rowIdx} position={[0, 0.032, z]}>
            <boxGeometry args={[1.0, 0.012, 0.045]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.2} />
          </mesh>
        ))}

        {/* Soft Keyboard Underglow Diffuser (Breathing in primary accent) */}
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[1.12, 0.01, 0.4]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.35} />
        </mesh>
      </group>

      {/* ========================================================
          4. GAMING MOUSE & CORD/DONGLE
      ======================================================== */}
      <group position={[0.92, -0.84, 0.48]} rotation={[0, -0.1, 0]}>
        {/* Ergonomic Curved Mouse Body */}
        <mesh position={[0, 0.02, 0]}>
          <capsuleGeometry args={[0.045, 0.1, 8, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
        </mesh>
        {/* Mouse Scroll Wheel */}
        <mesh position={[0, 0.045, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>

      {/* ========================================================
          5. HEADPHONE STAND & GAMING HEADSET
      ======================================================== */}
      <group position={[-1.75, -0.85, 0.6]}>
        {/* Circular Base */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.03, 20]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Vertical Stand Mast */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.62, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Top Cradle */}
        <mesh position={[0, 0.64, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.08]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Headset Headband */}
        <mesh position={[0, 0.63, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.12, 0.02, 12, 28, Math.PI]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Left Ear Cup */}
        <mesh position={[-0.12, 0.48, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Right Ear Cup */}
        <mesh position={[0.12, 0.48, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.05, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Headset RGB Ring Accent */}
        <mesh position={[0.145, 0.48, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.035, 0.045, 16]} />
          <meshBasicMaterial color={primaryColor} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ========================================================
          6. HIGH-PERFORMANCE GAMING PC TOWER
      ======================================================== */}
      <group position={[1.8, -0.2, 0.2]} rotation={[0, -0.25, 0]}>
        {/* Main Metal Chassis */}
        <mesh>
          <boxGeometry args={[0.62, 1.25, 1.2]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Tempered Glass Left Side Panel */}
        <mesh position={[-0.315, 0, 0]}>
          <planeGeometry args={[1.14, 1.18]} />
          <meshPhysicalMaterial
            roughness={0.1}
            transmission={0.85}
            thickness={0.06}
            transparent
            opacity={0.3}
            color="#0f172a"
          />
        </mesh>

        {/* Front Mesh Bezel Intake */}
        <mesh position={[0, 0, 0.605]}>
          <planeGeometry args={[0.58, 1.2]} />
          <meshStandardMaterial color="#161e2e" roughness={0.9} />
        </mesh>

        {/* Internal Components: Graphics Card (GPU) with subtle edge line */}
        <group position={[0.05, -0.15, 0.05]}>
          <mesh>
            <boxGeometry args={[0.22, 0.16, 0.65]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* GPU Light Accent Bar */}
          <mesh position={[-0.115, 0.04, 0]}>
            <boxGeometry args={[0.01, 0.02, 0.55]} />
            <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
          </mesh>
        </group>

        {/* Internal Liquid AIO CPU Cooler (Rotating subtle LED fan ring) */}
        <group position={[0.05, 0.22, 0]}>
          {/* Pump Block */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.06, 20]} />
            <meshStandardMaterial color="#111827" metalness={0.6} />
          </mesh>
          {/* Spinning Ring */}
          <group ref={fanRef}>
            <mesh position={[-0.035, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.065, 0.08, 24]} />
              <meshBasicMaterial color={secondaryColor} />
            </mesh>
          </group>
        </group>

        {/* RAM Sticks with Soft Accent Top Bars */}
        {[0.12, 0.16].map((z, idx) => (
          <mesh key={idx} position={[0.08, 0.24, z]}>
            <boxGeometry args={[0.02, 0.14, 0.025]} />
            <meshBasicMaterial color={primaryColor} transparent opacity={0.8} />
          </mesh>
        ))}

        {/* Internal Soft Illumination Light */}
        <pointLight position={[-0.1, 0.1, 0]} color={primaryColor} intensity={0.9} distance={2.2} />
      </group>

      {/* ========================================================
          7. RACER GAMING CHAIR SILHOUETTE (Framing side of desk)
      ======================================================== */}
      <group position={[-0.95, -0.78, 1.1]} rotation={[0, Math.PI - 0.2, 0]}>
        {/* Chair Seat Cushion */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.85, 0.12, 0.8]} />
          <meshStandardMaterial color="#1a2233" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Side Thigh Bolsters */}
        <mesh position={[-0.42, -0.02, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.1, 0.14, 0.75]} />
          <meshStandardMaterial color="#232d42" roughness={0.6} />
        </mesh>
        <mesh position={[0.42, -0.02, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.1, 0.14, 0.75]} />
          <meshStandardMaterial color="#232d42" roughness={0.6} />
        </mesh>

        {/* High-Back Ergonomic Backrest (Lower profile so it never obscures UI) */}
        <mesh position={[0, 0.45, -0.35]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.78, 0.95, 0.12]} />
          <meshStandardMaterial color="#1a2233" roughness={0.7} metalness={0.2} />
        </mesh>

        {/* Integrated Headrest Pillow */}
        <mesh position={[0, 0.96, -0.32]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.42, 0.18, 0.09]} />
          <meshStandardMaterial color="#232d42" roughness={0.5} />
        </mesh>

        {/* Headrest Harness Holes (Iconic dual cutouts) */}
        {[-0.14, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 1.05, -0.34]}>
            <boxGeometry args={[0.08, 0.05, 0.12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}

        {/* Lumbar Pillow Support */}
        <mesh position={[0, 0.25, -0.32]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.55, 0.26, 0.09]} />
          <meshStandardMaterial color="#1f293d" roughness={0.6} />
        </mesh>

        {/* 3D Armrests (Left & Right) */}
        <group position={[-0.52, 0.15, -0.05]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>
        <group position={[0.52, 0.15, -0.05]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.1, 0.04, 0.45]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} />
          </mesh>
        </group>

        {/* Swivel Gas Lift Cylinder & 5-Star Base */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.32, -0.65, Math.sin(angle) * 0.32]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.65, 0.05, 0.06]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* ========================================================
          8. SOFT FLOATING ROOM DUST PARTICLES (ZERO SQUARE ARTIFACTS)
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
          size={0.15}
          map={softDustTexture}
          color={secondaryColor}
          transparent
          opacity={0.35}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
