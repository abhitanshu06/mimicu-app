import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Creates a valid RIFF PCM WAV buffer
 * @param {number} durationSec - Length in seconds
 * @param {number} frequency - Base frequency in Hz
 * @param {number} sampleRate - Samples per second (44100)
 * @returns {Buffer} Valid WAV audio file buffer
 */
export function generateWavBuffer(durationSec = 6, frequency = 220, sampleRate = 44100) {
  const numChannels = 2; // Stereo
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // 1. RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // 2. "fmt " sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // 3. "data" sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Synthesize soft ambient dual-tone with smooth envelope
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Harmonic ambient frequencies with gentle tremolo
    const tremolo = 0.8 + 0.2 * Math.sin(2 * Math.PI * 1.5 * t);
    const env = Math.sin((Math.PI * i) / numSamples); // Soft fade in/out
    const sampleL = Math.sin(2 * Math.PI * frequency * t) * 0.4 * env * tremolo;
    const sampleR = Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.3 * env * tremolo;

    // Convert [-1.0, 1.0] float to 16-bit signed integer [-32768, 32767]
    const intL = Math.max(-32768, Math.min(32767, Math.floor(sampleL * 32767)));
    const intR = Math.max(-32768, Math.min(32767, Math.floor(sampleR * 32767)));

    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += blockAlign;
  }

  return buffer;
}

/**
 * Ensures demo audio assets exist in AUDIO_STORAGE_PATH
 * @param {Array<string>} trackIds
 * @returns {Promise<void>}
 */
export async function ensureDemoAudioFiles(trackIds = []) {
  const dir = config.AUDIO_STORAGE_PATH;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Base ambient frequencies for variety across worlds
  const baseFrequencies = [174, 220, 285, 396, 432, 528, 639];

  // Also create a shared fallback demo file
  const fallbackPath = path.join(dir, 'default-ambient.wav');
  if (!fs.existsSync(fallbackPath)) {
    const buf = generateWavBuffer(8, 220);
    fs.writeFileSync(fallbackPath, buf);
  }

  // Create asset for each track ID if missing
  for (let i = 0; i < trackIds.length; i++) {
    const trackId = trackIds[i];
    const fileName = `${trackId}.wav`;
    const filePath = path.join(dir, fileName);
    if (!fs.existsSync(filePath)) {
      const freq = baseFrequencies[i % baseFrequencies.length];
      const buffer = generateWavBuffer(10, freq);
      fs.writeFileSync(filePath, buffer);
    }
  }

  console.log(`[AudioGenerator] Verified ${trackIds.length} audio assets in ${dir}`);
}

// Direct execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  import('../../../src/data/tracks.js')
    .then(({ TRACKS }) => {
      const ids = TRACKS.map((t) => t.id);
      return ensureDemoAudioFiles(ids);
    })
    .then(() => console.log('Audio generation completed successfully.'))
    .catch((err) => {
      console.warn('Falling back to default demo ids for audio generation:', err.message);
      return ensureDemoAudioFiles(['track-3am-1', 'track-3am-2', 'default-ambient']);
    });
}
