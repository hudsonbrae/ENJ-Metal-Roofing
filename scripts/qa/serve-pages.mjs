/**
 * Serves dist/ under /ENJ-Metal-Roofing/ the way GitHub Pages does, so the
 * static review build can be tested locally before it is published.
 *
 *   DEPLOY_TARGET=github-pages npx astro build --mode review
 *   node scripts/qa/serve-pages.mjs      ->  http://localhost:4400/ENJ-Metal-Roofing/
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const BASE = '/ENJ-Metal-Roofing';
const ROOT = 'dist';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain',
};

async function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const candidate = join(ROOT, clean);
  if (!candidate.startsWith(ROOT)) return null;
  try {
    const info = await stat(candidate);
    return info.isDirectory() ? join(candidate, 'index.html') : candidate;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const file = pathname.startsWith(BASE) ? await resolveFile(pathname.slice(BASE.length) || '/') : null;
  try {
    if (!file) throw new Error('not found');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(join(ROOT, '404.html')).catch(() => 'Not found'));
  }
}).listen(4400, () => console.log(`Serving ${ROOT} at http://localhost:4400${BASE}/`));
