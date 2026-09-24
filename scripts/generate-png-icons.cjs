const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure-JS PNG generator without any external dependencies
function createPNG(width, height, getPixelRGBA) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte (0 = None) before each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // IDAT (Deflated)
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation for PNG chunks
function createChunk(type, data) {
  const len = data.length;
  const header = Buffer.alloc(4);
  header.writeUInt32BE(len, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const payload = Buffer.concat([typeBuf, data]);

  const crcTable = getCRCTable();
  let crc = 0xffffffff;
  for (let i = 0; i < payload.length; i++) {
    crc = crcTable[(crc ^ payload[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xffffffff) >>> 0;

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([header, payload, crcBuf]);
}

let crcTableCache = null;
function getCRCTable() {
  if (crcTableCache) return crcTableCache;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  crcTableCache = table;
  return table;
}

// Draw a stylized SmartTrack logo badge
function renderSmartTrackPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background gradient: Deep midnight blue (#0f172a to #1e1b4b)
  const normY = y / h;
  let bgR = Math.floor(15 + normY * 15);
  let bgG = Math.floor(23 + normY * 4);
  let bgB = Math.floor(42 + normY * 33);

  // If not maskable, round corners (squircle radius ~ 22% of dimension)
  if (!isMaskable) {
    const rx = Math.abs(dx);
    const ry = Math.abs(dy);
    const cornerRadius = w * 0.22;
    const innerW = cx - cornerRadius;
    const innerH = cy - cornerRadius;
    if (rx > innerW && ry > innerH) {
      const cdist = Math.sqrt((rx - innerW) ** 2 + (ry - innerH) ** 2);
      if (cdist > cornerRadius) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }
  }

  // Central glowing disc
  const radius = w * 0.38;
  if (dist < radius) {
    const ratio = dist / radius;
    // Radial indigo / cyan core
    const coreR = Math.floor(56 * (1 - ratio) + 99 * ratio);
    const coreG = Math.floor(189 * (1 - ratio) + 102 * ratio);
    const coreB = Math.floor(248 * (1 - ratio) + 241 * ratio);

    // Book chevron shape
    const bookY = cy + h * 0.05;
    const bookLeft = cx - w * 0.22;
    const bookRight = cx + w * 0.22;

    if (x >= bookLeft && x <= bookRight && y >= cy - h * 0.15 && y <= cy + h * 0.18) {
      // Golden / white book highlight
      return [245, 158, 11, 255];
    }

    // Top Star diamond
    const starDist = Math.abs(x - cx) + Math.abs(y - (cy - h * 0.22));
    if (starDist < w * 0.08) {
      return [253, 224, 71, 255];
    }

    return [
      Math.min(255, Math.floor(bgR * 0.3 + coreR * 0.7)),
      Math.min(255, Math.floor(bgG * 0.3 + coreG * 0.7)),
      Math.min(255, Math.floor(bgB * 0.3 + coreB * 0.7)),
      255
    ];
  }

  // Thin outer cyan ring
  if (dist >= radius && dist <= radius + w * 0.025) {
    return [56, 189, 248, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPNG(192, 192, (x, y, w, h) => renderSmartTrackPixel(x, y, w, h, false))
);
console.log('Created pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderSmartTrackPixel(x, y, w, h, false))
);
console.log('Created pwa-512x512.png');

// 3. pwa-maskable-512x512.png (full bleed with 15% safe padding)
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPNG(512, 512, (x, y, w, h) => renderSmartTrackPixel(x, y, w, h, true))
);
console.log('Created pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPNG(180, 180, (x, y, w, h) => renderSmartTrackPixel(x, y, w, h, false))
);
console.log('Created apple-touch-icon.png');
