// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

/*
 * Two deploy targets:
 *   default        static pages + the /api/quote server route (Node adapter;
 *                  swap for the chosen host's adapter before launch)
 *   github-pages   DEPLOY_TARGET=github-pages. The review site at
 *                  hudsonbrae.github.io/ENJ-Metal-Roofing/: fully static,
 *                  served under a sub-path, with no quote endpoint.
 */
const githubPages = process.env.DEPLOY_TARGET === 'github-pages';

// Post-submission pages and development fixtures never go in the sitemap.
const NOINDEX_PATHS = ['/contact/thank-you/', '/contact/not-sent/'];
const isIndexable = (page) =>
  !NOINDEX_PATHS.some((path) => page.endsWith(path)) && !page.includes('/projects/fixture-');

/** Registers the quote endpoint wherever a server exists to run it. */
const quoteEndpoint = () => ({
  name: 'enj-quote-endpoint',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (githubPages) return;
      injectRoute({ pattern: '/api/quote', entrypoint: './src/server/quote.ts', prerender: false });
    },
  },
});

export default defineConfig({
  site: githubPages ? 'https://hudsonbrae.github.io' : 'https://enjmetalroofing.com.au',
  base: githubPages ? '/ENJ-Metal-Roofing' : undefined,
  trailingSlash: 'ignore',

  adapter: githubPages ? undefined : node({ mode: 'standalone' }),

  integrations: [quoteEndpoint(), sitemap({ filter: isIndexable })],

  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.STATIC_PREVIEW': JSON.stringify(githubPages ? 'true' : 'false'),
    },
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
