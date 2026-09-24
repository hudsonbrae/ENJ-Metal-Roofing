/**
 * Review mode vs launch mode.
 *
 * Review mode shows material that exists only to help build and review the
 * site: development project fixtures, labelled photography placeholders, draft
 * services and copy that is awaiting ENJ's confirmation (with visible markers).
 *
 * Launch mode shows verified content only. Anything unconfirmed disappears and
 * its section collapses.
 *
 *   npm run dev                 review mode
 *   npm run dev:launch          launch mode, to preview empty states locally
 *   npm run build:review        review build, noindexed, for ENJ to look over
 *   npm run build               launch build
 */
const mode = import.meta.env.MODE;

export const reviewMode =
  mode === 'review' || mode === 'fixtures' || (import.meta.env.DEV && mode !== 'launch');

/**
 * Synthetic development projects (src/fixtures). Now that ENJ's real work is
 * on the site they only appear when asked for:
 *   astro dev --mode fixtures   /   astro build --mode fixtures
 * or automatically in review mode if there are no real projects at all.
 */
export const fixturesRequested = mode === 'fixtures';

/**
 * The GitHub Pages test deployment: static files only, so the quote form
 * validates but cannot send. Set by astro.config.mjs from DEPLOY_TARGET.
 */
export const staticPreview = import.meta.env.STATIC_PREVIEW === 'true';

/** A review build is deployed somewhere ENJ can see it, but search engines must not. */
export const noindexSite = reviewMode && !import.meta.env.DEV;
