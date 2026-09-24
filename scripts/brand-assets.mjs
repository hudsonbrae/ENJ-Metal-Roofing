/**
 * Renders the icon, social card and structured-data logo from the vector
 * logo files produced by scripts/logo-vector.mjs.
 *
 *   npm run assets:brand
 */
import sharp from 'sharp';
import { mkdir, writeFile, rm } from 'node:fs/promises';

const BRAND = 'src/assets/brand';
const PUBLIC_OUT = 'public/brand';
const INK = { r: 0x29, g: 0x0b, b: 0x0d, alpha: 1 };

await mkdir(PUBLIC_OUT, { recursive: true });

const render = (file, width) => sharp(`${BRAND}/${file}`, { density: 600 }).resize({ width }).png().toBuffer();

async function icon(size) {
  const mark = await render('enj-mark-dark.svg', Math.round(size * 0.74));
  return sharp({ create: { width: size, height: size, channels: 4, background: INK } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}

await writeFile(`${PUBLIC_OUT}/favicon-512.png`, await icon(512));
await writeFile(`${PUBLIC_OUT}/apple-touch-icon.png`, await icon(180));

// favicon.ico holding one 48px PNG image (valid ICO since Windows Vista and
// supported by every current browser). Browsers request /favicon.ico
// automatically, so it must be ENJ's mark rather than a framework default.
const png48 = await icon(48);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0);
entry.writeUInt8(48, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png48.length, 8);
entry.writeUInt32LE(22, 12);
await writeFile('public/favicon.ico', Buffer.concat([header, entry, png48]));

// Open Graph card, 1200x630 on ink.
const ogLogo = await render('enj-logo-horizontal-dark.svg', 880);
await sharp({ create: { width: 1200, height: 630, channels: 4, background: INK } })
  .composite([{ input: ogLogo, gravity: 'center' }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(`${PUBLIC_OUT}/enj-og.jpg`);

// Logo referenced by structured data. Google shows it on light grounds.
await writeFile(`${PUBLIC_OUT}/enj-logo.png`, await render('enj-logo-stacked-light.svg', 1200));

// Superseded raster lockups.
await rm(`${BRAND}/enj-logo.png`, { force: true });
await rm(`${BRAND}/enj-logo-ink.png`, { force: true });

console.log('Brand assets rendered from vector sources.');
