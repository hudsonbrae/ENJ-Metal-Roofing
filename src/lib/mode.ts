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

export const reviewMode = mode === 'review' || (import.meta.env.DEV && mode !== 'launch');

/** A review build is deployed somewhere ENJ can see it, but search engines must not. */
export const noindexSite = reviewMode && !import.meta.env.DEV;
