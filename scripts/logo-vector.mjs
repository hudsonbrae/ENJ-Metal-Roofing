/**
 * Traces the supplied ENJ logo PNG into vector SVGs and composes the lockups.
 *
 * ENJ has only the one raster logo. Tracing keeps the mark and wordmark
 * faithful to it (no redraw) while making them sharp at any size. Each
 * colour is traced as its own layer.
 *
 * Outputs (src/assets/brand/):
 *   enj-logo-stacked-{dark,light}.svg     the original arrangement
 *   enj-logo-horizontal-{dark,light}.svg  mark beside the wordmark, for the header
 *   enj-mark-{dark,light}.svg             the roof mark alone, for icons
 * "dark"/"light" is the ground the logo sits on.
 *
 * The tracer is not a project dependency (its image loader pulls in packages
 * with audit warnings). To re-run:
 *   npm install --no-save potrace && node scripts/logo-vector.mjs
 */
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFile } from 'node:fs/promises';

const SRC = 'src/assets/brand/enj-logo-source.png';
const OUT = 'src/assets/brand';

// Palette sampled from the supplied artwork.
const PALETTE = {
  ink: [0x29, 0x0b, 0x0d],
  red: [0x94, 0x25, 0x31],
  rose: [0xde, 0x6f, 0x7e],
  white: [0xff, 0xff, 0xff],
};

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// The crimson "ROOFING" line sits below the white wordmark. Find where the
// white rows end so every opaque pixel below is treated as ROOFING.
let whiteBottom = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] > 128 && data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) whiteBottom = y;
  }
}

const layers = { ink: [], red: [], rose: [], white: [], roofing: [] };
const masks = Object.fromEntries(Object.keys(layers).map((k) => [k, Buffer.alloc(width * height, 255)]));

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (data[i + 3] < 128) continue;
    let layer;
    if (y > whiteBottom) {
      layer = 'roofing';
    } else {
      let best = Infinity;
      for (const [name, [r, g, b]] of Object.entries(PALETTE)) {
        const d = (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2;
        if (d < best) {
          best = d;
          layer = name;
        }
      }
    }
    masks[layer][y * width + x] = 0;
  }
}

async function trace(mask) {
  const png = await sharp(mask, { raw: { width, height, channels: 1 } }).png().toBuffer();
  const tracer = new potrace.Potrace({ turdSize: 6, optTolerance: 0.3, threshold: 128 });
  await new Promise((resolve, reject) => tracer.loadImage(png, (err) => (err ? reject(err) : resolve())));
  const tag = tracer.getPathTag('#000');
  return tag.match(/d="([^"]+)"/)?.[1] ?? '';
}

function bounds(maskNames) {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (const name of maskNames) {
    const mask = masks[name];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y * width + x] === 0) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const paths = {};
for (const name of Object.keys(masks)) paths[name] = await trace(masks[name]);

const mark = bounds(['ink', 'red', 'rose']);
const word = bounds(['white', 'roofing']);

// Colour per ground. On a dark ground the logo's near-black planes and
// windows would vanish into the page, so they are lifted just enough to
// keep the roof shape readable.
const colours = {
  dark: { ink: '#5c2a2e', red: '#942531', rose: '#de6f7e', word: '#ffffff' },
  light: { ink: '#290b0d', red: '#942531', rose: '#de6f7e', word: '#290b0d' },
};

const gradient = (id) =>
  `<linearGradient id="${id}" x1="0" y1="${word.y + word.h * 0.62}" x2="0" y2="${word.y + word.h}" gradientUnits="userSpaceOnUse">` +
  `<stop offset="0" stop-color="#e64353"/><stop offset="1" stop-color="#b2152a"/></linearGradient>`;

// evenodd: the tracer emits letter counters (the holes in O, R, G, A) as
// inner sub-paths, which only render as holes under the even-odd rule.
const p = (fill, d) => `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`;
const markGroup = (c) => p(c.ink, paths.ink) + p(c.red, paths.red) + p(c.rose, paths.rose);
const wordGroup = (c, gid) => p(c.word, paths.white) + p(`url(#${gid})`, paths.roofing);

const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${title}</title>${body}</svg>\n`;

for (const ground of ['dark', 'light']) {
  const c = colours[ground];

  // Stacked: the original arrangement, trimmed to its content.
  const sx = Math.min(mark.x, word.x);
  const sy = mark.y;
  const sw = Math.max(mark.x + mark.w, word.x + word.w) - sx;
  const sh = word.y + word.h - sy;
  await writeFile(
    `${OUT}/enj-logo-stacked-${ground}.svg`,
    svg(sw, sh, `<defs>${gradient('rs')}</defs><g transform="translate(${-sx} ${-sy})">${markGroup(c)}${wordGroup(c, 'rs')}</g>`, 'ENJ Metal Roofing'),
  );

  // Horizontal: mark at full height, wordmark beside it at 78% of that
  // height, centred. Doubles the wordmark's size at a given logo height.
  const H = mark.h;
  const scale = (H * 0.78) / word.h;
  const gap = Math.round(H * 0.16);
  const wordX = mark.w + gap;
  const wordY = (H - word.h * scale) / 2;
  const totalW = Math.ceil(wordX + word.w * scale);
  await writeFile(
    `${OUT}/enj-logo-horizontal-${ground}.svg`,
    svg(
      totalW,
      H,
      `<defs>${gradient('rh')}</defs>` +
        `<g transform="translate(${-mark.x} ${-mark.y})">${markGroup(c)}</g>` +
        `<g transform="translate(${wordX} ${wordY}) scale(${scale.toFixed(5)}) translate(${-word.x} ${-word.y})">${wordGroup(c, 'rh')}</g>`,
      'ENJ Metal Roofing',
    ),
  );
}

for (const ground of ['dark', 'light']) {
  await writeFile(
    `${OUT}/enj-mark-${ground}.svg`,
    svg(mark.w, mark.h, `<g transform="translate(${-mark.x} ${-mark.y})">${markGroup(colours[ground])}</g>`, 'ENJ'),
  );
}

console.log('mark', mark, 'wordmark', word, 'white rows end at', whiteBottom);
