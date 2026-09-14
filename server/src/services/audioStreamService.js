import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

// Supported MIME types strictly mapped by extension
const MIME_MAP = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.mp4': 'audio/mp4',
  '.flac': 'audio/flac',
};

/**
 * Validates trackId to prevent path traversal
 * @param {string} trackId
 * @returns {boolean}
 */
export function isValidTrackId(trackId) {
  if (!trackId || typeof trackId !== 'string') return false;
  // Strictly allow alphanumeric, hyphen, and underscore
  return /^[a-zA-Z0-9_-]+$/.test(trackId);
}

/**
 * Resolves the absolute audio file path for a track safely
 * Ensures path is within AUDIO_STORAGE_PATH and prevents traversal
 * @param {string} filenameOrTrackId
 * @returns {string|null}
 */
export function resolveSafeAudioPath(filenameOrTrackId) {
  if (!filenameOrTrackId) return null;

  // Sanitize input: extract basename only
  const cleanName = path.basename(filenameOrTrackId);
  const storageDir = path.resolve(config.AUDIO_STORAGE_PATH);

  // Check possible extensions if no extension provided
  const candidateExtensions = cleanName.includes('.') ? [''] : ['.wav', '.mp3', '.ogg', '.flac'];

  for (const ext of candidateExtensions) {
    const candidateFile = `${cleanName}${ext}`;
    const resolved = path.resolve(storageDir, candidateFile);

    // Assert resolved path is inside storage directory (prevents ../ and absolute path escapes)
    if (!resolved.startsWith(storageDir)) {
      console.warn(`[Security] Path traversal attempt blocked: "${filenameOrTrackId}"`);
      return null;
    }

    if (fs.existsSync(resolved)) {
      const stat = fs.statSync(resolved);
      if (stat.isFile()) {
        return resolved;
      }
    }
  }

  // Fallback to default ambient asset if available
  const defaultAsset = path.resolve(storageDir, 'default-ambient.wav');
  if (fs.existsSync(defaultAsset)) {
    return defaultAsset;
  }

  return null;
}

/**
 * Determines MIME type from file extension
 * @param {string} filePath
 * @returns {string}
 */
export function getAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || 'audio/mpeg';
}

/**
 * Streams audio file supporting HTTP Range Requests (HTTP 206 / 200 / 416)
 * @param {string} filePath - Absolute path to audio file
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function streamAudioWithRange(filePath, req, res) {
  const stat = fs.statSync(filePath);
  const totalSize = stat.size;
  const mimeType = getAudioMimeType(filePath);
  const range = req.headers.range;

  // 1. Full Content (No Range Header)
  if (!range) {
    res.writeHead(200, {
      'Content-Length': totalSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });
    const readStream = fs.createReadStream(filePath);
    readStream.on('error', (err) => {
      console.error('[AudioStream] Read stream error:', err.message);
      if (!res.headersSent) res.status(500).end();
    });
    readStream.pipe(res);
    return;
  }

  // 2. Parse Range Header: "bytes=START-END"
  const bytesPrefix = 'bytes=';
  if (!range.startsWith(bytesPrefix)) {
    res.writeHead(416, {
      'Content-Range': `bytes */${totalSize}`,
    });
    res.end();
    return;
  }

  const rangeParts = range.substring(bytesPrefix.length).split('-');
  let start = parseInt(rangeParts[0], 10);
  let end = rangeParts[1] ? parseInt(rangeParts[1], 10) : totalSize - 1;

  // Handle suffix range (e.g. bytes=-500 -> last 500 bytes)
  if (isNaN(start) && !isNaN(end)) {
    start = totalSize - end;
    end = totalSize - 1;
  }

  // Validate range bounds
  if (isNaN(start) || isNaN(end) || start < 0 || end >= totalSize || start > end) {
    res.writeHead(416, {
      'Content-Range': `bytes */${totalSize}`,
    });
    res.end();
    return;
  }

  // 3. Partial Content (HTTP 206)
  const chunkSize = end - start + 1;
  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${totalSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize,
    'Content-Type': mimeType,
    'Cache-Control': 'no-cache',
  });

  const readStream = fs.createReadStream(filePath, { start, end });
  readStream.on('error', (err) => {
    console.error('[AudioStream] Partial read error:', err.message);
    if (!res.headersSent) res.status(500).end();
  });
  readStream.pipe(res);
}
