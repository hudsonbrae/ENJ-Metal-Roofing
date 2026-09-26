// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';

/*
 * Three deploy targets:
 *   launch build   `astro build` (npm run build). The live site on
 *                  Cloudflare: static pages plus the /api/quote route.
 *   review / dev   `astro build --mode review` and `astro dev`. Same pages on
 *                  the Node adapter, which the Playwright tests run against.
 *   github-pages   DEPLOY_TARGET=github-pages. The review site at
 *                  hudsonbrae.github.io/ENJ-Metal-Roofing/: fully static,
 *                  served under a sub-path, with no quote endpoint.
 */
const githubPages = process.env.DEPLOY_TARGET === 'github-pages';

const modeFlag = process.argv.indexOf('--mode');
const mode = modeFlag >= 0 ? process.argv[modeFlag + 1] : undefined;
const launchBuild = process.argv.includes('build') && mode !== 'review' && mode !== 'fixtures';

const adapter = githubPages
  ? undefined
  : launchBuild
    ? cloudflare({
        // Pages are built in Node so sharp can process the photos at build
        // time; nothing is resized on Cloudflare at runtime.
        prerenderEnvironment: 'node',
        imageService: 'compile',
      })
    : node({ mode: 'standalone' });

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
  // Change to ENJ's domain once it is registered.
  site: githubPages ? 'https://hudsonbrae.github.io' : 'https://enjmetalroofing.com.au',
  base: githubPages ? '/ENJ-Metal-Roofing' : undefined,
  trailingSlash: 'ignore',

  adapter,

  integrations: [quoteEndpoint(), sitemap({ filter: isIndexable })],

  // Quote email delivery. Set on the host (Cloudflare: Settings > Variables
  // and Secrets); with any of them missing, enquiries are only logged.
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      LEAD_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      LEAD_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

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
