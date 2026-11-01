// Renders favicon.svg's shapes to PNG fallbacks. Run: node tools/favicon.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const PURPLE = [0x7a, 0x3e, 0x9d];

const SEGMENTS = [[32, 26, 32, 42], [32, 30, 16, 16], [32, 30, 48, 16], [32, 42, 22, 56], [32, 42, 42, 56]];

function toSegment(x, y, [x1, y1, x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - x1 - t * dx, y - y1 - t * dy);
}

function roundedRect(x, y, radius) {
  const qx = Math.abs(x - 32) - 32 + radius;
  const qy = Math.abs(y - 32) - 32 + radius;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

// Signed distances in icon units; negative means inside the shape.
function pixel(x, y, scale) {
  const edge = d => Math.max(0, Math.min(1, 0.5 - d * scale));
  const figure = Math.min(Math.hypot(x - 32, y - 16) - 8, ...SEGMENTS.map(s => toSegment(x, y, s) - 3.5));
  const white = edge(figure);
  return [
    ...PURPLE.map(c => Math.round(c + (255 - c) * white)),
    Math.round(255 * edge(roundedRect(x, y, 14))),
  ];
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, file) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x++) {
      Buffer.from(pixel((x + 0.5) * 64 / size, (y + 0.5) * 64 / size, size / 64)).copy(raw, row + 1 + x * 4);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  fs.writeFileSync(path.join(root, file), Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]));
}

png(32, 'favicon-32.png');
png(180, 'apple-touch-icon.png');
