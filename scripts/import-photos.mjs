/**
 * Imports ENJ's photos from an intake folder into the content collections.
 *
 * Each photo is rotated upright (from its EXIF orientation), stripped of
 * metadata (location data must never be published) and saved under a
 * descriptive name. Selection and grouping decisions are documented in
 * docs/PHOTO-AUDIT.md; this script only carries them out.
 *
 *   node scripts/import-photos.mjs "<intake folder>"
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = process.argv[2];
if (!SRC) {
  console.error('Usage: node scripts/import-photos.mjs "<intake folder>"');
  process.exit(1);
}

// [source file, destination, optional crop {left, top, width, height}]
const plan = [
  // Project: rural hip roof
  ['IMG_0119.JPG', 'src/content/projects/rural-hip-roof/aerial.jpg'],
  ['IMG_0125.JPG', 'src/content/projects/rural-hip-roof/ridge-and-hips.jpg'],

  // Project: suburban home
  ['IMG_0121.JPG', 'src/content/projects/suburban-home/aerial-rear.jpg'],
  ['IMG_0123.JPG', 'src/content/projects/suburban-home/aerial-wide.jpg'],
  ['IMG_0124.JPG', 'src/content/projects/suburban-home/overhead.jpg'],

  // Project: new home in a housing estate
  ['IMG_0129.JPG', 'src/content/projects/estate-new-home/hips-and-valleys.jpg'],
  // Cropped to remove another business's phone number printed on site fencing.
  ['IMG_0128.JPG', 'src/content/projects/estate-new-home/roof-and-estate.jpg', { left: 0, top: 0, width: 1290, height: 968 }],

  // Stand-alone workmanship photos
  ['IMG_0135.JPG', 'src/content/workmanship/bushland-hip.jpg'],
  ['IMG_0133.JPG', 'src/content/workmanship/hip-ridge-valley.jpg'],
  ['IMG_0138.JPG', 'src/content/workmanship/pipe-and-wall-flashing.jpg'],
  ['IMG_0126.JPG', 'src/content/workmanship/charcoal-hip-junction.jpg'],
  ['IMG_0127.JPG', 'src/content/workmanship/charcoal-converging-hips.jpg'],
  ['IMG_0113.JPG', 'src/content/workmanship/wall-flashing-new-build.jpg'],
  ['IMG_0114.JPG', 'src/content/workmanship/pier-capping.jpg'],
  ['IMG_0112.JPG', 'src/content/workmanship/new-meets-existing.jpg'],
];

for (const [file, dest, crop] of plan) {
  await mkdir(dest.slice(0, dest.lastIndexOf('/')), { recursive: true });
  let image = sharp(`${SRC}/${file}`).rotate(); // bake in EXIF orientation
  if (crop) image = image.extract(crop);
  // No withMetadata(): output carries no EXIF, GPS or camera data.
  await image.jpeg({ quality: 94, mozjpeg: true }).toFile(dest);
  console.log(`${file} -> ${dest}`);
}
