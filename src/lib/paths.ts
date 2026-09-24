/**
 * Site paths are written root-relative everywhere ('/contact/'). Anything
 * that renders a link passes them through `url()` so the site also works
 * when served from a sub-path, such as the GitHub Pages review deployment
 * at /ENJ-Metal-Roofing/. On the real domain the base is '/' and this is a
 * no-op.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string) {
  return path.startsWith('/') ? `${BASE}${path}` : path;
}
