// Generates the PNG app icons (a can on a dark tile) with no dependencies.
// Run: node scripts/make-icons.mjs
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const sum = Buffer.alloc(4)
  sum.writeUInt32BE(crc(body))
  return Buffer.concat([len, body, sum])
}

const BG = [14, 16, 19]
const CAN = [24, 27, 32]
const GREEN = [140, 214, 0]
const RIM = [184, 190, 198]

/** Colour at normalised coordinates (0..1). */
function pixel(x, y) {
  const inCan = x > 0.34 && x < 0.66 && y > 0.2 && y < 0.82
  if (x > 0.37 && x < 0.63 && ((y > 0.165 && y <= 0.2) || (y >= 0.82 && y < 0.85))) return RIM
  if (!inCan) return BG
  // Lightning bolt as two triangles' worth of half-plane tests.
  const u = (x - 0.5) / 0.32
  const v = (y - 0.51) / 0.62
  const bolt =
    (v > -0.3 && v < 0.02 && u > -0.22 - v * 0.5 && u < 0.1 - v * 0.5) ||
    (v >= -0.06 && v < 0.3 && u > -0.1 - v * 0.5 && u < 0.22 - v * 0.5 && u < 0.24)
  if (bolt) return GREEN
  const shade = 1 + 0.5 * (0.5 - Math.abs(x - 0.44) * 4)
  return CAN.map((c) => Math.max(0, Math.min(255, Math.round(c * shade))))
}

function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  const S = 3 // supersampling per axis
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0]
      for (let sy = 0; sy < S; sy++)
        for (let sx = 0; sx < S; sx++) {
          const c = pixel((x + (sx + 0.5) / S) / size, (y + (sy + 0.5) / S) / size)
          acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]
        }
      for (let k = 0; k < 3; k++) raw[row + 1 + x * 3 + k] = Math.round(acc[k] / (S * S))
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [180, 192, 512]) writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), png(size))
console.log('icons written')
