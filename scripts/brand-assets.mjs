/**
 * Derives every brand asset from the single supplied ENJ logo.
 *
 * The supplied artwork is a dark-ground lockup: the "ENJ METAL" wordmark is
 * white. This script produces an ink-wordmark variant for light grounds, an
 * isolated roof mark for the favicon, and an Open Graph card. The roof mark
 * is never altered; only the wordmark colour changes, and only so the
 * existing identity can sit on a light background.
 *
 * When ENJ supplies a vector (SVG) or a horizontal lockup, replace
 * src/assets/brand/enj-logo*.png (or point Logo.astro at the SVG) and
 * re-run this script for the favicon and social card.
 *
 *   npm run assets:brand
 */
import sharp from 'sharp';
import { mkdir, writeFile, rm } from 'node:fs/promises';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: node scripts/brand-assets.mjs <source-logo.png>');
  process.exit(1);
}

const UI_OUT = 'src/assets/brand'; // goes through astro:assets
const PUBLIC_OUT = 'public/brand'; // stable URLs: favicon, social card, schema logo

const INK = { r: 0x29, g: 0x0b, b: 0x0d };
const WHITE_THRESHOLD = 200;
const ALPHA_THRESHOLD = 16;

await mkdir(UI_OUT, { recursive: true });
await mkdir(PUBLIC_OUT, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Opaque bounding box, and the first row of the white wordmark.
let minX = width, minY = height, maxX = -1, maxY = -1, whiteStart = height;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] < ALPHA_THRESHOLD) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    const white = data[i] > WHITE_THRESHOLD && data[i + 1] > WHITE_THRESHOLD && data[i + 2] > WHITE_THRESHOLD;
    if (white) whiteStart = Math.min(whiteStart, y);
  }
}
const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };

// 1. Lockup for dark grounds (as supplied, trimmed).
const darkGround = await sharp(SRC).ensureAlpha().extract(box).png().toBuffer();
await writeFile(`${UI_OUT}/enj-logo.png`, darkGround);
await writeFile(`${PUBLIC_OUT}/enj-logo.png`, darkGround);

// 2. Lockup for light grounds: white wordmark recoloured to ink.
const inked = Buffer.from(data);
for (let i = 0; i < inked.length; i += channels) {
  if (inked[i + 3] < ALPHA_THRESHOLD) continue;
  if (inked[i] > WHITE_THRESHOLD && inked[i + 1] > WHITE_THRESHOLD && inked[i + 2] > WHITE_THRESHOLD) {
    inked[i] = INK.r;
    inked[i + 1] = INK.g;
    inked[i + 2] = INK.b;
  }
}
await sharp(inked, { raw: { width, height, channels } }).extract(box).png().toFile(`${UI_OUT}/enj-logo-ink.png`);

// 3. Roof mark alone, on ink, for icons.
const mark = sharp(SRC)
  .ensureAlpha()
  .extract({ left: box.left, top: box.top, width: box.width, height: Math.max(1, whiteStart - minY - 8) });

async function iconPng(size, markSize) {
  const markBuffer = await mark
    .clone()
    .resize(markSize, markSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { ...INK, alpha: 1 } } })
    .composite([{ input: markBuffer, gravity: 'center' }])
    .png()
    .toBuffer();
}

await writeFile(`${PUBLIC_OUT}/favicon-512.png`, await iconPng(512, 380));
await writeFile(`${PUBLIC_OUT}/apple-touch-icon.png`, await iconPng(180, 134));

// favicon.ico holding a single 48px PNG image (valid ICO since Windows Vista,
// supported by every current browser). Browsers request /favicon.ico
// automatically, so this must be ENJ's mark, not a framework default.
const ico48 = await iconPng(48, 38);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0); // width
entry.writeUInt8(48, 1); // height
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // colour planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(ico48.length, 8); // image size
entry.writeUInt32LE(22, 12); // offset
await writeFile('public/favicon.ico', Buffer.concat([header, entry, ico48]));
await rm('public/favicon.svg', { force: true });

// 4. Open Graph card, 1200x630 on ink.
const ogLogo = await sharp(darkGround).resize(620, null, { fit: 'inside' }).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { ...INK, alpha: 1 } } })
  .composite([{ input: ogLogo, gravity: 'center' }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${PUBLIC_OUT}/enj-og.jpg`);

// The old public mark and ink variant are no longer referenced.
await rm(`${PUBLIC_OUT}/enj-mark.png`, { force: true });
await rm(`${PUBLIC_OUT}/enj-logo-ink.png`, { force: true });

console.log('Brand assets written to', UI_OUT, 'and', PUBLIC_OUT);
