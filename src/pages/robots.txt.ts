import type { APIRoute } from 'astro';
import { noindexSite } from '../lib/mode';

/** A review build must never be crawled; a launch build points crawlers at the sitemap. */
export const GET: APIRoute = ({ site }) => {
  const body = noindexSite
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
