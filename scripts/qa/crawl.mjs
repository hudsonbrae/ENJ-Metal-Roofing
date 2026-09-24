/**
 * Crawls a running site from its home page, following every internal link
 * and asset, and reports broken links and browser console errors.
 *
 *   node scripts/qa/crawl.mjs http://localhost:4321/
 *   node scripts/qa/serve-pages.mjs & node scripts/qa/crawl.mjs http://localhost:4400/ENJ-Metal-Roofing/
 */
import { chromium } from '@playwright/test';

const start = new URL(process.argv[2] ?? 'http://localhost:4321/');
const browser = await chromium.launch();
const page = await browser.newPage();

const queue = [start.href];
const seen = new Set();
const broken = [];
const consoleErrors = [];

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`${page.url()}: ${msg.text()}`);
});
page.on('response', (res) => {
  const u = new URL(res.url());
  if (u.origin === start.origin && res.status() >= 400) broken.push(`${res.status()} ${u.pathname} (on ${page.url()})`);
});

while (queue.length > 0) {
  const target = queue.shift();
  if (seen.has(target)) continue;
  seen.add(target);
  await page.goto(target, { waitUntil: 'networkidle' });
  const links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => a.href));
  for (const link of links) {
    const u = new URL(link);
    u.hash = '';
    if (u.origin === start.origin && u.pathname.startsWith(start.pathname) && !seen.has(u.href)) queue.push(u.href);
  }
}

await browser.close();
console.log(`Pages crawled: ${seen.size}`);
console.log(broken.length ? `Broken:\n  ${[...new Set(broken)].join('\n  ')}` : 'Broken links: none');
console.log(consoleErrors.length ? `Console errors:\n  ${consoleErrors.join('\n  ')}` : 'Console errors: none');
process.exit(broken.length || consoleErrors.length ? 1 : 0);
