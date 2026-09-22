// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://enjmetalroofing.com.au',

  // Every page prerenders to static HTML. Only /api/quote runs on demand
  // (it sets `prerender = false`). At launch, swap this adapter for
  // @astrojs/cloudflare, @astrojs/netlify or @astrojs/vercel — the
  // application code does not change.
  adapter: node({ mode: 'standalone' }),

  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // AVIF first, WebP fallback. Generated at build time by sharp.
    responsiveStyles: true,
    layout: 'constrained',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
