import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSoftSmokeTexture, getBokehTexture } from '../../../utils/particleTextures';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * ChaiTapriWorld
 * 
 * Aesthetic Indian roadside chai tapri / tea stall atmosphere for "Chai & Sutta".
 * Recognizable Elements:
 * 1. Roadside Chai Tapri (wooden counter, corrugated awning, rustic timber posts)
 * 2. Aluminium Chai Ketli (kettle with spout, lid, and handle on gas burner)
 * 3. Cutting Chai Glasses in wire rack holder + steaming glass on counter
 * 4. Stylized Low-Poly Human Silhouette Character standing naturally holding chai & cigarette
 * 5. Warm hanging incandescent bulb illuminating the stall and character
 * 6. Soft organic steam and cigarette smoke (ZERO square particles)
 * 7. Distant city skyline and evening ambient lights
 */
export default function ChaiTapriWorld({ vibe }) {
  const chaiSteamRef = useRef();
  const cigSmokeRef = useRef();
  const bulbLightRef = useRef();
  const bokehRef = useRef();

  const primaryColor = vibe?.colors?.primary || '#f97316';
  const secondaryColor = vibe?.colors?.secondary || '#818cf8';

  // 1. Chai Kettle Steam Particles (Emerging from kettle spout and chai glass)
  // Particle meta stored as flat Float32Arrays (5 fields × steamCount) for CPU-cache-friendly
  // hot-loop access — avoids JS heap object property reads at 60fps.
  const steamCount = 38;
  const [steamPositions, steamAlphas, steamScales, steamMeta] = useMemo(() => {
    const pos = new Float32Array(steamCount * 3);
    const alphas = new Float32Array(steamCount);
    const scales = new Float32Array(steamCount);
    // Flat layout: [life, speed, driftPhase, driftFreq, baseScale] per particle
    const meta = new Float32Array(steamCount * 5);

    const originX = 0.55;
    const originY = -0.32;
    const originZ = 1.3;

    for (let i = 0; i < steamCount; i++) {
      const life = Math.random();
      pos[i * 3] = originX + (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = originY + life * 1.1;
      pos[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.08;
      alphas[i] = Math.sin(life * Math.PI);
      const baseScale = 0.08 + Math.random() * 0.06;
      scales[i] = baseScale * (1.0 + life * 2.2);

      const b = i * 5;
      meta[b]     = life;
      meta[b + 1] = 0.15 + Math.random() * 0.12;         // speed
      meta[b + 2] = Math.random() * Math.PI * 2;         // driftPhase
      meta[b + 3] = 1.8 + Math.random() * 1.4;           // driftFreq
      meta[b + 4] = baseScale;                            // baseScale
    }

    return [pos, alphas, scales, meta];
  }, [steamCount]);

  // 2. Cigarette Wispy Smoke (Emerging from character's left hand)
  // Same flat Float32Array layout as steamMeta.
  const cigCount = 28;
  const [cigPositions, cigAlphas, cigScales, cigMeta] = useMemo(() => {
    const pos = new Float32Array(cigCount * 3);
    const alphas = new Float32Array(cigCount);
    const scales = new Float32Array(cigCount);
    const meta = new Float32Array(cigCount * 5);

    const handX = -0.58;
    const handY = -0.36;
    const handZ = 1.62;

    for (let i = 0; i < cigCount; i++) {
      const life = Math.random();
      pos[i * 3] = handX + (Math.random() - 0.5) * 0.03;
      pos[i * 3 + 1] = handY + life * 0.9;
      pos[i * 3 + 2] = handZ + (Math.random() - 0.5) * 0.03;
      alphas[i] = Math.sin(life * Math.PI);
      const baseScale = 0.05 + Math.random() * 0.04;
      scales[i] = baseScale * (1.0 + life * 2.8);

      const b = i * 5;
      meta[b]     = life;
      meta[b + 1] = 0.18 + Math.random() * 0.12;         // speed
      meta[b + 2] = Math.random() * Math.PI * 2;         // driftPhase
      meta[b + 3] = 2.2 + Math.random() * 1.6;           // driftFreq
      meta[b + 4] = baseScale;                            // baseScale
    }

    return [pos, alphas, scales, meta];
  }, [cigCount]);

  // Soft Smoke Shader Materials
  const steamMaterial = useMemo(() => {
    const texture = getSoftSmokeTexture();
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uColor: { value: new THREE.Color('#fed7aa') },
        uOpacity: { value: 0.35 },
      },
      vertexShader: `
        attribute float aAlpha;
        attribute float aScale;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aScale * (150.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          float alpha = tex.a * vAlpha * uOpacity;
          if (alpha < 0.005) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  const cigMaterial = useMemo(() => {
    const texture = getSoftSmokeTexture();
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uColor: { value: new THREE.Color('#e2e8f0') },
        uOpacity: { value: 0.28 },
      },
      vertexShader: `
        attribute float aAlpha;
        attribute float aScale;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aScale * (140.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vAlpha;
        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          float alpha = tex.a * vAlpha * uOpacity;
          if (alpha < 0.005) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, []);

  // Distant City Skyline Towers
  const towers = useMemo(() => {
    const list = [];
    for (let i = -12; i <= 12; i += 1.8) {
      const h = 4.0 + Math.abs(Math.sin(i * 1.2)) * 4.5;
      const w = 1.0 + Math.abs(Math.cos(i)) * 0.7;
      const z = -(14 + Math.abs(Math.sin(i * 0.8)) * 6);
      list.push({ x: i * 1.5, y: h / 2 - 2.2, z, h, w });
    }
    return list;
  }, []);

  // Distant City Ambient Bokeh
  const bokehCount = 36;
  const [bokehPositions, bokehColors] = useMemo(() => {
    const pos = new Float32Array(bokehCount * 3);
    const cols = new Float32Array(bokehCount * 3);
    const palette = [
      new THREE.Color('#f59e0b'),
      new THREE.Color('#fb923c'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#fef08a'),
    ];
    for (let i = 0; i < bokehCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 4.5 - 0.5;
      pos[i * 3 + 2] = -(10 + Math.random() * 10);
      const c = palette[i % palette.length];
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return [pos, cols];
  }, [bokehCount]);

  const bokehTexture = useMemo(() => getBokehTexture(), []);

  // Frame Loop Animation
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // A. Animate Chai Kettle Steam
    if (chaiSteamRef.current) {
      const p = chaiSteamRef.current.geometry.attributes.position;
      const a = chaiSteamRef.current.geometry.attributes.aAlpha;
      const s = chaiSteamRef.current.geometry.attributes.aScale;
      const originX = 0.55;
      const originY = -0.32;
      const originZ = 1.3;

      for (let i = 0; i < steamCount; i++) {
        const b = i * 5;
        steamMeta[b] += delta * steamMeta[b + 1] * 0.5; // life += delta * speed * 0.5
        if (steamMeta[b] > 1.0) {
          steamMeta[b] = 0;
          p.array[i * 3] = originX + (Math.random() - 0.5) * 0.04;
          p.array[i * 3 + 1] = originY;
          p.array[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.04;
        } else {
          p.array[i * 3 + 1] = originY + steamMeta[b] * 1.1;
          const drift = Math.sin(time * steamMeta[b + 3] + steamMeta[b + 2]) * 0.04 * steamMeta[b];
          p.array[i * 3] = originX + drift;
        }
        a.array[i] = Math.sin(steamMeta[b] * Math.PI);
        s.array[i] = steamMeta[b + 4] * (1.0 + steamMeta[b] * 2.2);
      }
      p.needsUpdate = true;
      a.needsUpdate = true;
      s.needsUpdate = true;
    }

    // B. Animate Cigarette Wispy Smoke
    if (cigSmokeRef.current) {
      const p = cigSmokeRef.current.geometry.attributes.position;
      const a = cigSmokeRef.current.geometry.attributes.aAlpha;
      const s = cigSmokeRef.current.geometry.attributes.aScale;
      const handX = -0.46;
      const handY = -0.65;
      const handZ = 2.03;

      for (let i = 0; i < cigCount; i++) {
        const b = i * 5;
        cigMeta[b] += delta * cigMeta[b + 1] * 0.45; // life += delta * speed * 0.45
        if (cigMeta[b] > 1.0) {
          cigMeta[b] = 0;
          p.array[i * 3] = handX + (Math.random() - 0.5) * 0.02;
          p.array[i * 3 + 1] = handY;
          p.array[i * 3 + 2] = handZ + (Math.random() - 0.5) * 0.02;
        } else {
          p.array[i * 3 + 1] = handY + cigMeta[b] * 0.9;
          const drift = Math.sin(time * cigMeta[b + 3] + cigMeta[b + 2]) * 0.035 * cigMeta[b];
          p.array[i * 3] = handX + drift;
        }
        a.array[i] = Math.sin(cigMeta[b] * Math.PI);
        s.array[i] = cigMeta[b + 4] * (1.0 + cigMeta[b] * 2.8);
      }
      p.needsUpdate = true;
      a.needsUpdate = true;
      s.needsUpdate = true;
    }

    // C. Hanging Light Subtle Filament Flicker + Audio-Reactive Warm Pulse
    const audio = audioReactiveManager.getValues();
    const lightMult = audio.profile?.lightResponse ?? 0.35;
    if (bulbLightRef.current) {
      const audioPulse = audio.bass * lightMult * 1.35;
      bulbLightRef.current.intensity = 2.7 + Math.sin(time * 8) * 0.15 + Math.sin(time * 23) * 0.08 + audioPulse;
    }

    // D. Distant Bokeh Drift with subtle audio response
    if (bokehRef.current) {
      bokehRef.current.rotation.y = Math.sin(time * 0.04) * 0.02 + audio.mid * 0.015;
    }
  });

  return (
    <group>
      {/* ========================================================
          1. ROADSIDE GROUND & PAVEMENT
          ======================================================== */}
      <mesh position={[0, -1.8, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 28]} />
        <meshStandardMaterial color="#1a1e2a" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Roadside Curb edge in foreground */}
      <mesh position={[0, -1.72, 3.2]}>
        <boxGeometry args={[36, 0.16, 0.5]} />
        <meshStandardMaterial color="#2d3446" roughness={0.5} />
      </mesh>

      {/* ========================================================
          2. ROADSIDE CHAI TAPRI (TEA STALL STRUCTURE)
          ======================================================== */}
      <group position={[0.6, -1.6, 0.5]}>
        {/* Stall Wooden Counter Base */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.2, 1.1, 1.0]} />
          <meshStandardMaterial color="#4a2e1b" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Counter Wooden Top Surface Slab */}
        <mesh position={[0, 1.12, 0.05]}>
          <boxGeometry args={[2.4, 0.08, 1.2]} />
          <meshStandardMaterial color="#6b4423" roughness={0.55} metalness={0.15} />
        </mesh>

        {/* Front Shelf Rail */}
        <mesh position={[0, 0.45, 0.52]}>
          <boxGeometry args={[2.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#7c4a27" roughness={0.6} />
        </mesh>

        {/* 4 Timber Posts Supporting the Roof */}
        <mesh position={[-1.1, 1.8, -0.5]}>
          <cylinderGeometry args={[0.035, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#3b2212" roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 1.8, -0.5]}>
          <cylinderGeometry args={[0.035, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#3b2212" roughness={0.8} />
        </mesh>
        <mesh position={[-1.1, 1.8, 0.5]}>
          <cylinderGeometry args={[0.035, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#3b2212" roughness={0.8} />
        </mesh>
        <mesh position={[1.1, 1.8, 0.5]}>
          <cylinderGeometry args={[0.035, 0.04, 2.4, 8]} />
          <meshStandardMaterial color="#3b2212" roughness={0.8} />
        </mesh>

        {/* Slanted Corrugated Tin Roof Awning */}
        <mesh position={[0, 3.0, 0.1]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[2.7, 0.06, 1.6]} />
          <meshStandardMaterial color="#2d3748" roughness={0.5} metalness={0.6} />
        </mesh>

        {/* Tapri Wooden Bench beside counter */}
        <group position={[1.4, 0, 0.4]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.4, 0.05, 1.2]} />
            <meshStandardMaterial color="#5c381e" roughness={0.7} />
          </mesh>
          <mesh position={[-0.15, 0.15, -0.45]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#3b2212" />
          </mesh>
          <mesh position={[0.15, 0.15, -0.45]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#3b2212" />
          </mesh>
          <mesh position={[-0.15, 0.15, 0.45]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#3b2212" />
          </mesh>
          <mesh position={[0.15, 0.15, 0.45]}>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#3b2212" />
          </mesh>
        </group>

        {/* ========================================================
            3. TRADITIONAL ALUMINIUM CHAI KETLI (KETTLE)
            ======================================================== */}
        <group position={[-0.1, 1.16, 0.3]}>
          {/* Gas Burner Ring */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.06, 16]} />
            <meshStandardMaterial color="#1e2530" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Soft Blue/Amber Burner Flame Glow */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <pointLight position={[0, 0.08, 0]} color="#fb923c" intensity={1.2} distance={1.8} />

          {/* Aluminium Kettle Body */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.14, 0.18, 0.28, 18]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.85} />
          </mesh>
          {/* Domed Kettle Lid */}
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Lid Knob */}
          <mesh position={[0, 0.43, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Kettle Spout */}
          <mesh position={[0.15, 0.28, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.03, 0.045, 0.18, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.35} metalness={0.85} />
          </mesh>
          {/* Overhead Wire Handle */}
          <mesh position={[0, 0.44, 0]}>
            <torusGeometry args={[0.14, 0.015, 8, 24, Math.PI]} rotation={[0, 0, 0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
        </group>

        {/* ========================================================
            4. CUTTING CHAI GLASSES ON WIRE CADDY RACK
            ======================================================== */}
        <group position={[0.6, 1.16, 0.2]}>
          {/* Wire Rack Frame */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.42, 0.1, 0.3]} />
            <meshStandardMaterial color="#334155" wireframe roughness={0.4} metalness={0.7} />
          </mesh>

          {/* 4 Cutting Chai Glasses in rack */}
          {[-0.12, 0.12].map((gx, i) =>
            [-0.08, 0.08].map((gz, j) => (
              <group key={`${i}-${j}`} position={[gx, 0.08, gz]}>
                {/* Fluted Tea Glass */}
                <mesh>
                  <cylinderGeometry args={[0.045, 0.035, 0.14, 14]} />
                  <meshPhysicalMaterial
                    color="#fed7aa"
                    transmission={0.85}
                    roughness={0.15}
                    thickness={0.15}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
                {/* Chai Liquid inside */}
                <mesh position={[0, -0.01, 0]}>
                  <cylinderGeometry args={[0.04, 0.032, 0.1, 14]} />
                  <meshStandardMaterial color="#c25e00" emissive="#ea580c" emissiveIntensity={0.3} roughness={0.2} />
                </mesh>
              </group>
            ))
          )}
        </group>

        {/* Extra Steaming Chai Glass in front on the counter */}
        <group position={[0.2, 1.16, 0.45]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.038, 0.16, 16]} />
            <meshPhysicalMaterial
              color="#fed7aa"
              transmission={0.88}
              roughness={0.12}
              thickness={0.2}
              transparent
              opacity={0.88}
            />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.12, 16]} />
            <meshStandardMaterial color="#c25e00" emissive="#ea580c" emissiveIntensity={0.4} roughness={0.2} />
          </mesh>
        </group>

        {/* Traditional Tapri Glass Biscuit Jar (Parle-G / Rusk) */}
        <group position={[-0.8, 1.16, 0.15]}>
          {/* Jar Glass Body */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.34, 18]} />
            <meshPhysicalMaterial
              color="#e2e8f0"
              transmission={0.88}
              roughness={0.1}
              thickness={0.15}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Metal Screw Lid */}
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.135, 0.135, 0.04, 18]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Golden Chai Biscuits inside jar */}
          {[-0.08, 0, 0.08].map((by, bi) => (
            <mesh key={bi} position={[0, 0.1 + by, 0]}>
              <boxGeometry args={[0.16, 0.04, 0.14]} />
              <meshStandardMaterial color="#d97706" roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* ========================================================
            5. HANGING BARE INCANDESCENT BULB (WARM GOLDEN LIGHT)
            ======================================================== */}
        <group position={[0, 2.7, 0.2]}>
          {/* Hanging Wire */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Socket */}
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.03, 0.025, 0.06, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Glowing Bulb */}
          <mesh position={[0, -0.09, 0]}>
            <sphereGeometry args={[0.065, 16, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Golden Tapri Point Light */}
          <pointLight
            ref={bulbLightRef}
            position={[0, -0.15, 0]}
            color="#f59e0b"
            intensity={2.8}
            distance={7.5}
            decay={1.8}
          />
        </group>
      </group>

      {/* ========================================================
          6. STYLIZED NOCTURNAL CUSTOMER SILHOUETTE (CHAI & SUTTA)
             (Minimalist, natural silhouette; zero distorted limbs or fingers)
          ======================================================== */}
      <group position={[-0.75, -1.6, 1.8]} rotation={[0, 0.32, 0]}>
        {/* Ground Footwear Silhouette */}
        <mesh position={[-0.11, 0.05, 0.04]}>
          <boxGeometry args={[0.13, 0.08, 0.25]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </mesh>
        <mesh position={[0.11, 0.05, -0.02]}>
          <boxGeometry args={[0.13, 0.08, 0.25]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} />
        </mesh>

        {/* Trousers in Relaxed Stance (Clean continuous silhouette) */}
        <mesh position={[-0.11, 0.52, 0.02]}>
          <cylinderGeometry args={[0.078, 0.068, 0.88, 12]} />
          <meshStandardMaterial color="#0f1624" roughness={0.7} />
        </mesh>
        <mesh position={[0.11, 0.52, -0.02]}>
          <cylinderGeometry args={[0.078, 0.068, 0.88, 12]} />
          <meshStandardMaterial color="#0f1624" roughness={0.7} />
        </mesh>

        {/* Casual Midnight Jacket / Coat Silhouette (Smooth organic form) */}
        <mesh position={[0, 1.28, 0]}>
          <cylinderGeometry args={[0.22, 0.17, 0.74, 16]} />
          <meshStandardMaterial color="#141c2c" roughness={0.65} metalness={0.15} />
        </mesh>
        {/* Soft Jacket Collar */}
        <mesh position={[0, 1.66, 0]}>
          <cylinderGeometry args={[0.14, 0.16, 0.08, 14]} />
          <meshStandardMaterial color="#0f1624" roughness={0.7} />
        </mesh>

        {/* Natural Head & Beanie Silhouette */}
        <mesh position={[0, 1.76, 0]}>
          <sphereGeometry args={[0.115, 16, 16]} />
          <meshStandardMaterial color="#1a2336" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.83, -0.01]} rotation={[-0.05, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 14, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color="#0a0f18" roughness={0.85} />
        </mesh>

        {/* Relaxed Arms Resting in Silhouette (No distorted limbs or individual fingers) */}
        {/* Left Arm: Relaxed at side with sleeve contour */}
        <mesh position={[-0.26, 1.18, 0.04]} rotation={[0.08, 0, 0.15]}>
          <cylinderGeometry args={[0.065, 0.055, 0.65, 12]} />
          <meshStandardMaterial color="#141c2c" roughness={0.65} />
        </mesh>
        {/* Right Arm: Natural profile holding sutta with relaxed forearm */}
        <mesh position={[0.22, 1.25, 0.08]} rotation={[0.45, 0, -0.18]}>
          <cylinderGeometry args={[0.065, 0.055, 0.62, 12]} />
          <meshStandardMaterial color="#141c2c" roughness={0.65} />
        </mesh>

        {/* Glowing Sutta Ember Tip (Subtle ember light at hand position) */}
        <group position={[0.2, 0.95, 0.31]}>
          {/* Subtle burning ember glow */}
          <mesh>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          <pointLight color="#ff5722" intensity={0.25} distance={0.6} />
        </group>

        {/* Soft Warm Rim Light from Tapri on the silhouette's edge */}
        <mesh position={[0.16, 1.3, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.06} />
        </mesh>
      </group>

      {/* ========================================================
          7. ORGANIC RISING STEAM & SUTTA SMOKE (ZERO SQUARES)
          ======================================================== */}
      {/* Kettle & Counter Chai Steam */}
      <points ref={chaiSteamRef} material={steamMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={steamCount}
            array={steamPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aAlpha"
            count={steamCount}
            array={steamAlphas}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={steamCount}
            array={steamScales}
            itemSize={1}
          />
        </bufferGeometry>
      </points>

      {/* Wispy Cigarette Smoke rising from character's hand */}
      <points ref={cigSmokeRef} material={cigMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={cigCount}
            array={cigPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aAlpha"
            count={cigCount}
            array={cigAlphas}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={cigCount}
            array={cigScales}
            itemSize={1}
          />
        </bufferGeometry>
      </points>

      {/* ========================================================
          8. DISTANT CITY SKYLINE & AMBIENT TWILIGHT LIGHTS
          ======================================================== */}
      {towers.map((tower, idx) => (
        <group key={idx} position={[tower.x, tower.y, tower.z]}>
          <mesh>
            <boxGeometry args={[tower.w, tower.h, tower.w]} />
            <meshStandardMaterial color="#0b101c" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Lit Windows */}
          <mesh position={[tower.x > 0 ? -tower.w / 2 - 0.01 : tower.w / 2 + 0.01, (idx % 3) * 0.9, 0]}>
            <planeGeometry args={[0.22, 0.28]} />
            <meshBasicMaterial
              color={idx % 2 === 0 ? '#fde047' : '#fdba74'}
              transparent
              opacity={0.65}
            />
          </mesh>
        </group>
      ))}

      {/* Distant City Bokeh Disc Lights */}
      <points ref={bokehRef}>
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
          size={0.6}
          map={bokehTexture}
          vertexColors
          transparent
          opacity={0.45}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
