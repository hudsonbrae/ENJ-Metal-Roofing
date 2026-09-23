// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// Pages that must never appear in search results or the sitemap:
// post-submission states, and development fixtures in review builds.
const NOINDEX_PATHS = ['/contact/thank-you/', '/contact/not-sent/'];
const isIndexable = (page) =>
  !NOINDEX_PATHS.some((path) => page.endsWith(path)) && !page.includes('/projects/fixture-');

export default defineConfig({
  site: 'https://enjmetalroofing.com.au',

  // Every page prerenders to static HTML. Only /api/quote runs on demand.
  // Before launch, swap this for the adapter of the chosen host
  // (@astrojs/cloudflare, @astrojs/netlify or @astrojs/vercel).
  adapter: node({ mode: 'standalone' }),

  integrations: [sitemap({ filter: isIndexable })],

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
