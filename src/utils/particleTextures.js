import * as THREE from 'three';

/**
 * particleTextures.js
 * 
 * Procedural texture generators creating soft, feathered, organic alpha textures
 * for WebGL point sprites and particle systems in Three.js.
 * 
 * Guarantees ZERO square or hard-edged particles across all 3D worlds.
 */

let cachedSmokeTexture = null;
let cachedSoftRoundTexture = null;
let cachedBokehTexture = null;

/**
 * Multi-stop gaussian/cosine feathered smoke puff texture.
 * Ideal for warm steam, chai vapour, and drifting mist.
 */
export function getSoftSmokeTexture() {
  if (cachedSmokeTexture) return cachedSmokeTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const centerX = 64;
  const centerY = 64;
  const radius = 64;

  // Feathered radial gradient with gradual falloff
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.65)');
  gradient.addColorStop(0.45, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.02)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  cachedSmokeTexture = new THREE.CanvasTexture(canvas);
  cachedSmokeTexture.needsUpdate = true;
  return cachedSmokeTexture;
}

/**
 * Smooth circular gaussian alpha texture for ambient dust, embers, stardust, and droplets.
 */
export function getSoftParticleTexture() {
  if (cachedSoftRoundTexture) return cachedSoftRoundTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(0.92, 'rgba(255, 255, 255, 0.03)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedSoftRoundTexture = new THREE.CanvasTexture(canvas);
  cachedSoftRoundTexture.needsUpdate = true;
  return cachedSoftRoundTexture;
}

/**
 * Soft bokeh disc texture with delicate rim falloff for distant city lights and atmospheric background.
 */
export function getBokehTexture() {
  if (cachedBokehTexture) return cachedBokehTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  gradient.addColorStop(0.65, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.75)');
  gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedBokehTexture = new THREE.CanvasTexture(canvas);
  cachedBokehTexture.needsUpdate = true;
  return cachedBokehTexture;
}
