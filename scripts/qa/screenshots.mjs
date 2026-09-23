/**
 * Full-page screenshots of every page at the review breakpoints, for design
 * review. Runs against a running server (default: the dev server).
 *
 *   node scripts/qa/screenshots.mjs [baseUrl] [outDir]
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4321';
const out = process.argv[3] ?? 'qa-screenshots';

const pages = [
  ['home', '/'],
  ['services', '/services/'],
  ['service', '/services/re-roofing/'],
  ['work', '/projects/'],
  ['project', '/projects/fixture-full-record/'],
  ['about', '/about/'],
  ['contact', '/contact/'],
  ['thanks', '/contact/thank-you/'],
];

const viewports = [
  ['390', { width: 390, height: 844 }],
  ['768', { width: 768, height: 1024 }],
  ['1440', { width: 1440, height: 900 }],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();

for (const [vpName, viewport] of viewports) {
  // Reduced motion: scroll reveals render immediately, so nothing is captured mid-fade.
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const [name, path] of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Lazy images below the fold: scroll through once so they load.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${out}/${name}-${vpName}.png`, fullPage: true });
    await page.screenshot({ path: `${out}/${name}-${vpName}-fold.png` });
  }
  await context.close();
}

await browser.close();
console.log(`Screenshots written to ${out}`);
