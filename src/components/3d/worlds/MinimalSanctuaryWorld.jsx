import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftParticleTexture, getSoftSmokeTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * MinimalSanctuaryWorld
 * 
 * Experiential 3D environment for "Deep Focus", "Study Room", "Coding Late Night".
 * Recognizable Elements:
 * 1. Minimalist Clean Slate/Oak Desk with beveled edge definition
 * 2. Architectural Articulated Task Lamp casting a warm, concentrated pool of light
 * 3. Sleek Open Laptop with illuminated display and soft screen glow
 * 4. Open Hardbound Notebook with fine-point pen resting beside it
 * 5. Minimalist Ceramic Coffee/Tea Mug on cork coaster with soft gentle rising steam
 * 6. Neatly Stacked Hardcover Books on desk corner
 * 7. Minimalist Cylindrical Pomodoro / Desk Clock
 * 8. Microscopic Soft Dust Motes floating gently in the light beam (ZERO square artifacts)
 */
export default function MinimalSanctuaryWorld({ vibe }) {
  const dustRef = useRef();
  const coffeeSteamRef = useRef();
  const taskLightRef = useRef();
  const dustCount = 42;
  const steamCount = 18;

  const primaryColor = vibe?.colors?.primary || '#94a3b8';
  const secondaryColor = vibe?.colors?.secondary || '#38bdf8';
  const keyColor = vibe?.visualWorld?.lighting?.keyColor || '#f8fafc';

  // 1. Soft Dust Motes in the air
  const [dustPositions] = useMemo(() => {
    const pos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3.8;
      pos[i * 3 + 1] = Math.random() * 2.6 - 0.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
    }
    return [pos];
  }, [dustCount]);

  const softDustTexture = useMemo(() => getSoftParticleTexture(), []);

  // 2. Gentle Steam from Coffee Mug
  const [steamPositions, steamMeta] = useMemo(() => {
    const pos = new Float32Array(steamCount * 3);
    const meta = [];
    const cupX = -1.55;
    const cupY = -0.85;
    const cupZ = 0.85;

    for (let i = 0; i < steamCount; i++) {
      const life = Math.random();
      pos[i * 3] = cupX + (Math.random() - 0.5) * 0.04;
      pos[i * 3 + 1] = cupY + life * 0.45;
      pos[i * 3 + 2] = cupZ + (Math.random() - 0.5) * 0.04;
      meta.push({
        life,
        speed: 0.18 + Math.random() * 0.12,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }
    return [pos, meta];
  }, [steamCount]);

  const softSteamTexture = useMemo(() => getSoftSmokeTexture(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.14;

    // A. Animate soft floating dust motes with microscopic audio influence
    if (dustRef.current) {
      const pos = dustRef.current.geometry.attributes.position.array;
      const audioDust = audio.mid * 0.0006;
      for (let i = 0; i < dustCount; i++) {
        pos[i * 3 + 1] += delta * (0.028 + audioDust);
        pos[i * 3] += Math.sin(time * 0.35 + i) * 0.0006;
        if (pos[i * 3 + 1] > 2.0) {
          pos[i * 3 + 1] = -0.6;
        }
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // B. Animate gentle rising coffee steam
    if (coffeeSteamRef.current) {
      const pos = coffeeSteamRef.current.geometry.attributes.position.array;
      const cupX = -1.55;
      const cupY = -0.85;
      for (let i = 0; i < steamCount; i++) {
        steamMeta[i].life += delta * steamMeta[i].speed;
        if (steamMeta[i].life > 1.0) {
          steamMeta[i].life = 0;
          pos[i * 3] = cupX + (Math.random() - 0.5) * 0.04;
          pos[i * 3 + 1] = cupY;
        } else {
          pos[i * 3 + 1] = cupY + steamMeta[i].life * 0.55;
          pos[i * 3] = cupX + Math.sin(time * 2.0 + steamMeta[i].wobblePhase) * 0.02 * steamMeta[i].life;
        }
      }
      coffeeSteamRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // C. Very subtle desk lamp breath (calm and distraction-free)
    if (taskLightRef.current) {
      const audioPulse = audio.bass * lightMult * 0.45;
      taskLightRef.current.intensity = 2.6 + audioPulse;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          0. ARCHITECTURAL ROOM DEPTH & BACKGROUND SEPARATION
      ======================================================== */}
      {/* Back Wall with subtle wainscotting ledge */}
      <mesh position={[0, 1.8, -4.5]}>
        <planeGeometry args={[36, 16]} />
        <meshStandardMaterial color="#0d1527" roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.35, -4.48]}>
        <boxGeometry args={[36, 0.06, 0.04]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>

      {/* Soft Workspace Ambient Fill Light (Eliminates pitch-black darkness in Dark Mode) */}
      <pointLight position={[-2.4, 0.4, 0.8]} color="#93c5fd" intensity={0.95} distance={5.5} decay={1.8} />

      {/* ========================================================
          1. SLEEK MINIMALIST DESK SURFACE
      ======================================================== */}
      {/* Desk Surface (Rich matte slate with visible silhouette) */}
      <mesh position={[0, -1.1, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 24]} />
        <meshStandardMaterial 
          color="#1b2336" 
          roughness={0.45} 
          metalness={0.3} 
        />
      </mesh>

      {/* Desk Front Edge Bevel (Light-catching trim defining desk plane) */}
      <mesh position={[0, -1.11, 2.4]}>
        <boxGeometry args={[32, 0.06, 0.06]} />
        <meshStandardMaterial 
          color="#475569" 
          roughness={0.25} 
          metalness={0.65} 
        />
      </mesh>

      {/* ========================================================
          2. ARCHITECTURAL ARTICULATED TASK LAMP
      ======================================================== */}
      <group position={[1.6, -1.1, 0.4]}>
        {/* Solid Circular Base */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.3, 0.34, 0.06, 28]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Lower Joint */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.85} />
        </mesh>

        {/* Lower Arm */}
        <mesh position={[-0.1, 0.65, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.022, 0.022, 1.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Articulated Elbow Joint */}
        <mesh position={[-0.2, 1.25, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#475569" metalness={0.85} />
        </mesh>

        {/* Upper Arm Angled Over Desk */}
        <mesh position={[-0.55, 1.5, 0]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Lamp Shade & Warm Illuminating Cone */}
        <group position={[-0.95, 1.72, 0]} rotation={[0, 0, 0.35]}>
          {/* Shade */}
          <mesh>
            <coneGeometry args={[0.26, 0.34, 24, 1, true]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Inner Glowing Bulb */}
          <mesh position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.075, 16, 16]} />
            <meshBasicMaterial color="#fef3c7" />
          </mesh>
          
          {/* Focused Desk Spotlight Pooling Warm Light on the Workspace */}
          <spotLight
            position={[0, -0.05, 0]}
            target-position={[-0.8, -1.1, -0.2]}
            color="#fef3c7"
            intensity={3.8}
            angle={Math.PI / 3.8}
            penumbra={0.65}
            distance={6.5}
          />
          {/* Radiant Warm Desk Fill Light with Subtle Audio-Reactive Breath */}
          <pointLight
            ref={taskLightRef}
            position={[0, -0.15, 0]}
            color="#fde68a"
            intensity={2.6}
            distance={4.8}
            decay={1.8}
          />
        </group>
      </group>

      {/* ========================================================
          3. SLEEK ALUMINUM OPEN LAPTOP
      ======================================================== */}
      <group position={[0.0, -1.09, 0.6]} rotation={[0, 0.06, 0]}>
        {/* Laptop Lower Base / Keyboard Deck */}
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[1.1, 0.022, 0.75]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Keyboard Well */}
        <mesh position={[0, 0.024, -0.08]}>
          <boxGeometry args={[0.96, 0.005, 0.42]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.024, 0.22]}>
          <boxGeometry args={[0.34, 0.003, 0.24]} />
          <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Laptop Display (Tilted at ~115 degrees) */}
        <group position={[0, 0.02, -0.37]} rotation={[-0.45, 0, 0]}>
          {/* Screen Lid Backing */}
          <mesh position={[0, 0.36, 0]}>
            <boxGeometry args={[1.1, 0.72, 0.018]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Screen Display Face with Crisp Glow */}
          <mesh position={[0, 0.36, 0.01]}>
            <planeGeometry args={[1.04, 0.66]} />
            <meshStandardMaterial
              color="#0b1329"
              emissive={secondaryColor}
              emissiveIntensity={0.52}
              roughness={0.15}
            />
          </mesh>
          {/* Subtle Code / Text lines on display */}
          {[-0.18, -0.08, 0.02, 0.12, 0.22].map((y, i) => (
            <mesh key={i} position={[-0.15, 0.36 + y, 0.012]}>
              <planeGeometry args={[0.65 - (i % 3) * 0.15, 0.02]} />
              <meshBasicMaterial color="#f8fafc" transparent opacity={0.8} />
            </mesh>
          ))}
          {/* Screen bounce light casting back onto keyboard */}
          <pointLight position={[0, 0.25, 0.25]} color={secondaryColor} intensity={0.9} distance={2.4} decay={2.0} />
        </group>
      </group>

      {/* ========================================================
          4. OPEN HARDBOUND NOTEBOOK & FINE-POINT PEN
      ======================================================== */}
      <group position={[-0.95, -1.09, 0.75]} rotation={[0, 0.15, 0]}>
        {/* Notebook Cover */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.52]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Left Page (Soft cream white) */}
        <mesh position={[-0.17, 0.022, 0]}>
          <boxGeometry args={[0.32, 0.008, 0.48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Left Page Ruled Lines */}
        {[-0.14, -0.06, 0.02, 0.1, 0.18].map((ly, idx) => (
          <mesh key={`lp-${idx}`} position={[-0.17, 0.027, ly]}>
            <planeGeometry args={[0.24, 0.008]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} />
          </mesh>
        ))}

        {/* Right Page */}
        <mesh position={[0.17, 0.022, 0]}>
          <boxGeometry args={[0.32, 0.008, 0.48]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {/* Right Page Ruled Lines */}
        {[-0.14, -0.06, 0.02, 0.1, 0.18].map((ly, idx) => (
          <mesh key={`rp-${idx}`} position={[0.17, 0.027, ly]}>
            <planeGeometry args={[0.24, 0.008]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.35} />
          </mesh>
        ))}

        {/* Notebook Ribbon Bookmark */}
        <mesh position={[0, 0.028, 0.1]}>
          <boxGeometry args={[0.02, 0.004, 0.35]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        {/* Fine-Point Metal Pen alongside notebook */}
        <group position={[0.42, 0.02, 0]} rotation={[0, 0.05, 0]}>
          <mesh>
            <cylinderGeometry args={[0.014, 0.014, 0.44, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Pen Clip */}
          <mesh position={[0, 0.016, -0.1]}>
            <boxGeometry args={[0.008, 0.012, 0.12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          5. MINIMAL CERAMIC COFFEE MUG WITH GENTLE STEAM
      ======================================================== */}
      <group position={[-1.55, -1.09, 0.85]}>
        {/* Natural Cork Coaster */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
          <meshStandardMaterial color="#78350f" roughness={0.9} />
        </mesh>
        {/* Ceramic Mug Body */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.24, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Mug Handle */}
        <mesh position={[-0.14, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.065, 0.016, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        {/* Hot Dark Coffee Liquid inside */}
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.11, 20]} />
          <meshStandardMaterial color="#271c19" roughness={0.15} />
        </mesh>
      </group>

      {/* Gentle Rising Coffee Steam (Soft organic alpha, ZERO square particles) */}
      <points ref={coffeeSteamRef}>
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
          map={softSteamTexture}
          color="#f1f5f9"
          transparent
          opacity={0.28}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ========================================================
          6. STACK OF HARDBOUND DESIGN BOOKS
      ======================================================== */}
      <group position={[-1.4, -1.09, -0.2]} rotation={[0, -0.18, 0]}>
        {/* Bottom Book (Deep Navy) */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.72, 0.08, 0.95]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {/* Middle Book (Slate Grey, slightly offset) */}
        <mesh position={[0.03, 0.11, 0.02]} rotation={[0, 0.06, 0]}>
          <boxGeometry args={[0.68, 0.06, 0.9]} />
          <meshStandardMaterial color="#334155" roughness={0.65} />
        </mesh>
        {/* Top Book (Minimal Off-White) */}
        <mesh position={[-0.02, 0.16, -0.01]} rotation={[0, -0.04, 0]}>
          <boxGeometry args={[0.62, 0.05, 0.85]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
      </group>

      {/* ========================================================
          7. MINIMALIST CYLINDRICAL DESK CLOCK / TIMER
      ======================================================== */}
      <group position={[0.95, -1.09, -0.15]} rotation={[0, -0.25, 0]}>
        {/* Clock Body */}
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Clock Face */}
        <mesh position={[0, 0.12, 0.042]}>
          <circleGeometry args={[0.1, 24]} />
          <meshBasicMaterial color="#090d16" />
        </mesh>
        {/* Minimal Hands */}
        <mesh position={[0, 0.14, 0.045]}>
          <boxGeometry args={[0.008, 0.05, 0.002]} />
          <meshBasicMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0.02, 0.12, 0.045]}>
          <boxGeometry args={[0.04, 0.008, 0.002]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
      </group>

      {/* ========================================================
          8. SOFT FLOATING DUST MOTES (ZERO SQUARE EDGES)
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
          size={0.16}
          map={softDustTexture}
          color={primaryColor}
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
