/**
 * Generates development fixture images for src/fixtures/projects/.
 *
 * These are deliberately synthetic: flat ribbed-sheet patterns in the
 * aspect ratios real photography will arrive in, so layouts, crops,
 * galleries and loading behaviour can be tested before ENJ's photos exist.
 * They are never presented as ENJ work and never ship in a launch build.
 *
 *   npm run assets:fixtures
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = 'src/fixtures/projects';

const tones = {
  surfmist: { base: '#dcdcd6', light: '#f4f4f0', dark: '#9a9a94', sky: '#c9d3d8' },
  monument: { base: '#3c3f42', light: '#6a6e72', dark: '#1d1f21', sky: '#a9b4ba' },
  rust: { base: '#7a5a48', light: '#a58470', dark: '#4a352a', sky: '#b9c1c4' },
  basalt: { base: '#585a5c', light: '#86898b', dark: '#2e3032', sky: '#bcc6cb' },
};

/** Ribbed sheet across the frame, lit from one side, with an optional sky band. */
function sheetSvg({ width, height, tone, angle = -8, rib = 44, sky = 0.28, label }) {
  const t = tones[tone];
  const skyH = Math.round(height * sky);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
    <pattern id="ribs" width="${rib}" height="${rib}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
      <rect width="${rib}" height="${rib}" fill="${t.base}"/>
      <rect x="0" width="${rib * 0.18}" height="${rib}" fill="${t.light}"/>
      <rect x="${rib * 0.18}" width="${rib * 0.1}" height="${rib}" fill="${t.dark}" opacity="0.55"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" fill="${t.sky}"/>
  <polygon points="0,${skyH + height * 0.08} ${width},${skyH} ${width},${height} 0,${height}" fill="url(#ribs)"/>
  <polygon points="0,${skyH + height * 0.08} ${width},${skyH} ${width},${skyH + 10} 0,${skyH + height * 0.08 + 10}" fill="${t.dark}" opacity="0.7"/>
  <rect width="${width}" height="${height}" fill="url(#light)"/>
  <text x="${width * 0.04}" y="${height - height * 0.06}" font-family="Arial, Helvetica, sans-serif"
        font-size="${Math.round(Math.min(width, height) * 0.045)}" font-weight="700"
        fill="#ffffff" fill-opacity="0.75" letter-spacing="4">DEVELOPMENT FIXTURE  ${label}</text>
</svg>`;
}

const jobs = [
  // Landscape-led project with every field and every image type.
  ['full-record/hero.jpg', { width: 2400, height: 1600, tone: 'surfmist', label: '3:2 HERO' }],
  ['full-record/wide.jpg', { width: 2400, height: 1350, tone: 'surfmist', angle: -3, sky: 0.4, label: '16:9 WIDE' }],
  ['full-record/detail-ridge.jpg', { width: 1800, height: 1800, tone: 'surfmist', angle: -30, rib: 120, sky: 0, label: '1:1 DETAIL' }],
  ['full-record/detail-valley.jpg', { width: 1600, height: 2000, tone: 'surfmist', angle: 25, rib: 110, sky: 0.1, label: '4:5 DETAIL' }],
  ['full-record/during.jpg', { width: 2400, height: 1600, tone: 'basalt', angle: -12, label: '3:2 DURING' }],
  ['full-record/before.jpg', { width: 2000, height: 1500, tone: 'rust', angle: -8, label: '4:3 BEFORE' }],
  ['full-record/after.jpg', { width: 2000, height: 1500, tone: 'surfmist', angle: -8, label: '4:3 AFTER' }],

  // Portrait-led project with the minimum fields.
  ['portrait-minimal/hero.jpg', { width: 1600, height: 2000, tone: 'monument', angle: 12, sky: 0.22, label: '4:5 HERO' }],
  ['portrait-minimal/detail.jpg', { width: 1800, height: 1800, tone: 'monument', angle: -40, rib: 130, sky: 0, label: '1:1 DETAIL' }],

  // No hero set: the first gallery photo must stand in. Panoramic crop test.
  ['gallery-only/panorama.jpg', { width: 2800, height: 1200, tone: 'basalt', angle: -2, sky: 0.45, label: '21:9 WIDE' }],
  ['gallery-only/detail.jpg', { width: 1600, height: 2000, tone: 'basalt', angle: 30, rib: 120, sky: 0, label: '4:5 DETAIL' }],
];

for (const [path, spec] of jobs) {
  const dir = `${OUT}/${path.split('/')[0]}`;
  await mkdir(dir, { recursive: true });
  await sharp(Buffer.from(sheetSvg(spec))).jpeg({ quality: 74, mozjpeg: true }).toFile(`${OUT}/${path}`);
}

console.log(`Wrote ${jobs.length} fixture images to ${OUT}`);
