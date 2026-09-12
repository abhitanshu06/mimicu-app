import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioReactiveManager } from '../../../utils/audioReactiveManager';

/**
 * ProceduralScreen
 * 
 * Reusable 3D display component that renders procedural, glowing code lines
 * with syntax highlighting, an active blinking cursor, and realistic monitor frame.
 * Used in Coding Late Night, Gaming, and workspace environments.
 */
export default function ProceduralScreen({
  width = 2.2,
  height = 1.3,
  primaryColor = '#06b6d4',
  secondaryColor = '#8b5cf6',
  accentColor = '#f59e0b',
  biasGlow = true,
}) {
  const cursorRef = useRef();
  const screenRef = useRef();

  // Procedural code line segments (Indents, lengths, and syntax token colors)
  const codeLines = useMemo(() => {
    const lines = [];
    const colors = [
      primaryColor,     // Keywords / vars (cyan)
      secondaryColor,   // Functions / types (purple)
      accentColor,      // Strings / values (amber)
      '#94a3b8',        // Punctuation / identifiers (slate)
      '#64748b',        // Comments (muted)
    ];

    const count = 15;
    const startY = height * 0.38;
    const spacing = height * 0.052;

    for (let i = 0; i < count; i++) {
      const y = startY - i * spacing;
      const indent = (i % 4 === 1 || i % 4 === 2) ? 0.18 : (i % 4 === 3 ? 0.36 : 0);
      const lineWidth = 0.45 + (Math.sin(i * 1.8) * 0.28 + 0.35);
      const color = colors[i % colors.length];

      lines.push({
        y,
        x: -width * 0.42 + indent + lineWidth / 2,
        width: lineWidth,
        color,
        isComment: i === 0 || i === 8,
      });
    }
    return lines;
  }, [width, height, primaryColor, secondaryColor, accentColor]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const audio = audioReactiveManager.getValues();

    // Blinking terminal cursor (2Hz pulse - remains independent and calm)
    if (cursorRef.current) {
      cursorRef.current.visible = Math.floor(time * 2.2) % 2 === 0;
    }

    // Subtle breathing glow of screen emission with audio shimmer
    if (screenRef.current) {
      const audioGlow = audio.treble * 0.12 + audio.bass * 0.08;
      screenRef.current.emissiveIntensity = 0.25 + Math.sin(time * 1.5) * 0.05 + audioGlow;
    }
  });

  return (
    <group>
      {/* Monitor Outer Bezel Frame */}
      <mesh>
        <boxGeometry args={[width, height, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Monitor Display Surface with Terminal Glow */}
      <mesh ref={screenRef} position={[0, 0, 0.026]}>
        <planeGeometry args={[width * 0.96, height * 0.94]} />
        <meshStandardMaterial
          color="#060b14"
          emissive={primaryColor}
          emissiveIntensity={0.25}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Procedural Code Lines */}
      {codeLines.map((line, idx) => (
        <mesh key={idx} position={[line.x, line.y, 0.03]}>
          <planeGeometry args={[line.width, 0.022]} />
          <meshBasicMaterial
            color={line.color}
            transparent
            opacity={line.isComment ? 0.45 : 0.85}
          />
        </mesh>
      ))}

      {/* Active Blinking Terminal Cursor */}
      <mesh ref={cursorRef} position={[-width * 0.42 + 0.58, height * 0.38 - 14 * (height * 0.052), 0.032]}>
        <planeGeometry args={[0.045, 0.026]} />
        <meshBasicMaterial color={primaryColor} />
      </mesh>

      {/* Monitor Stand */}
      <group position={[0, -height / 2, -0.15]}>
        {/* Vertical Upright Column */}
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.09, 0.45, 0.08]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Base Plate on Desk */}
        <mesh position={[0, -0.44, 0.08]}>
          <boxGeometry args={[0.55, 0.02, 0.42]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Bias Backlight wash against wall behind monitor */}
      {biasGlow && (
        <pointLight
          position={[0, 0, -0.4]}
          color={primaryColor}
          intensity={1.2}
          distance={4.5}
          decay={1.8}
        />
      )}
    </group>
  );
}