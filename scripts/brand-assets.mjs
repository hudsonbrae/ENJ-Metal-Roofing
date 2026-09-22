/**
 * Derives the brand asset set from the single supplied ENJ logo.
 *
 * The supplied artwork is a dark-ground lockup: the "ENJ METAL" wordmark is
 * white, so the logo is unreadable on light backgrounds. This script produces
 * an ink-wordmark variant for light sections, an isolated roof mark for the
 * favicon, and an Open Graph card.
 *
 * The roof mark itself is never altered — only the wordmark colour changes,
 * and only so the existing identity can sit on a light background.
 *
 * Run: node scripts/brand-assets.mjs <path-to-source-logo.png>
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = process.argv[2];
const OUT = 'public/brand';

const INK = { r: 0x29, g: 0x0b, b: 0x0d };
const WHITE_THRESHOLD = 200;
const ALPHA_THRESHOLD = 16;

if (!SRC) {
  console.error('Usage: node scripts/brand-assets.mjs <source-logo.png>');
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const base = sharp(SRC).ensureAlpha();
const { data, info } = await base
  .clone()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Opaque bounding box, and the first row where the white wordmark starts.
let minX = width, minY = height, maxX = -1, maxY = -1, whiteStart = height;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] < ALPHA_THRESHOLD) continue;

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    const isWhite =
      data[i] > WHITE_THRESHOLD &&
      data[i + 1] > WHITE_THRESHOLD &&
      data[i + 2] > WHITE_THRESHOLD;
    if (isWhite && y < whiteStart) whiteStart = y;
  }
}

const box = {
  left: minX,
  top: minY,
  width: maxX - minX + 1,
  height: maxY - minY + 1,
};
console.log('content box:', box, '| white wordmark starts at y =', whiteStart);

// ── 1. Full lockup, trimmed. For dark grounds. ──
await sharp(SRC).ensureAlpha().extract(box).png()
  .toFile(`${OUT}/enj-logo.png`);

// ── 2. Ink-wordmark variant. For light grounds. ──
const inked = Buffer.from(data);
for (let i = 0; i < inked.length; i += channels) {
  if (inked[i + 3] < ALPHA_THRESHOLD) continue;
  if (
    inked[i] > WHITE_THRESHOLD &&
    inked[i + 1] > WHITE_THRESHOLD &&
    inked[i + 2] > WHITE_THRESHOLD
  ) {
    inked[i] = INK.r;
    inked[i + 1] = INK.g;
    inked[i + 2] = INK.b;
  }
}
await sharp(inked, { raw: { width, height, channels } })
  .extract(box)
  .png()
  .toFile(`${OUT}/enj-logo-ink.png`);

// ── 3. Isolated roof mark, for favicon and compact lockups. ──
const markHeight = Math.max(1, whiteStart - minY - 8);
const mark = sharp(SRC)
  .ensureAlpha()
  .extract({ left: box.left, top: box.top, width: box.width, height: markHeight });

await mark.clone().png().toFile(`${OUT}/enj-mark.png`);

// Square, padded favicon on the brand ink ground.
const markSquare = await mark
  .clone()
  .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp({
  create: {
    width: 512, height: 512, channels: 4,
    background: { ...INK, alpha: 1 },
  },
})
  .composite([{ input: markSquare, gravity: 'center' }])
  .png()
  .toFile(`${OUT}/favicon-512.png`);

await sharp(`${OUT}/favicon-512.png`).resize(180, 180).png()
  .toFile(`${OUT}/apple-touch-icon.png`);

// ── 4. Open Graph card, 1200x630 on ink. ──
const ogLogo = await sharp(SRC)
  .ensureAlpha()
  .extract(box)
  .resize(620, null, { fit: 'inside' })
  .toBuffer();

await sharp({
  create: {
    width: 1200, height: 630, channels: 4,
    background: { ...INK, alpha: 1 },
  },
})
  .composite([{ input: ogLogo, gravity: 'center' }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${OUT}/enj-og.jpg`);

console.log('Brand assets written to', OUT);
