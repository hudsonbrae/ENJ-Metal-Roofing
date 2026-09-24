# ENJ Metal Roofing website

Marketing and quote site for ENJ Metal Roofing, a metal roofing business in
the Shoalhaven, NSW, owned by John and Ethan. Currently a **review build**:
it is not live, and content is being confirmed with ENJ before launch.

- Review site (updates on every push to `main`): https://hudsonbrae.github.io/ENJ-Metal-Roofing/
- What still needs ENJ's input: [docs/ENJ-REVIEW.md](docs/ENJ-REVIEW.md)

## Stack

Astro 7, Tailwind CSS 4, TypeScript. No client-side framework: the few
interactive parts (menu, quote form, photo viewer, scroll reveals) are
small inline scripts using native `<dialog>` and IntersectionObserver. Every
page is static HTML except `/api/quote`, which receives quote requests.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server in the background at http://localhost:4321 (review mode) |
| `npm run dev:launch` | Dev server showing the launch version (no fixtures or drafts) |
| `npm run dev:stop` | Stop the background dev server |
| `npm run build` | Launch build, then fails if any review-only content reached `dist/` |
| `npm run build:review` | Review build: fixtures, drafts and "Awaiting ENJ" markers, noindexed |
| `npm run preview` | Serve the last build (Node server) |
| `npm test` | Review build, then the Playwright suite (pages, overflow, axe, forms) |
| `npm run qa:screenshots` | Full-page screenshots at 390, 768 and 1440px for design review |
| `npm run qa:crawl -- <url>` | Crawl a running site for broken links and console errors |
| `npm run assets:brand` | Regenerate favicon, social card and schema logo from the vector logo |
| `npm run assets:fixtures` | Regenerate the synthetic development photos |

The dev server must run in background mode (see `CLAUDE.md`).

## Review mode and launch mode

Review mode (dev, `build:review`, and the GitHub Pages site) shows material
that exists only for building and reviewing: development fixtures,
photography placeholders, draft services, and wording marked
"Awaiting ENJ". A plain `npm run build` is launch mode: all of that
disappears and sections collapse cleanly, and
`scripts/check-launch-build.mjs` fails the build if any of it leaks through.

## Content

| What | Where |
| --- | --- |
| Business details, phone numbers, ABN, licence | `src/data/site.ts` (empty values render nothing) |
| Services | `src/content/services/*.md` (`draft: true` until ENJ confirms) |
| Projects | `src/content/projects/<name>/index.md` plus photos; see `_TEMPLATE.md.txt` there |
| Process steps | `src/data/process.ts` (`processConfirmed`) |
| FAQs, testimonials, service areas | `src/content/faqs`, `testimonials`, `service-areas` (empty until real content exists) |
| Development fixtures | `src/fixtures/projects` (review mode only; never real work) |

Nothing on the site is invented. Every descriptive field is optional, and an
unknown value is left out rather than filled with a guess.

## Logo

ENJ supplied one raster logo (`src/assets/brand/enj-logo-source.png`). It is
traced to vector (`scripts/logo-vector.mjs`) as a stacked lockup (the
original arrangement) and a horizontal lockup for the header. All uses go
through `src/components/brand/Logo.astro`.

## Deployment

- **Review site**: `.github/workflows/review-site.yml` builds with
  `DEPLOY_TARGET=github-pages` and publishes to GitHub Pages under
  `/ENJ-Metal-Roofing/`. All internal links go through `url()` in
  `src/lib/paths.ts`, so the site works under that sub-path. Pages is static,
  so the quote form validates but sends nothing there (the page says so).
  Test it locally with `node scripts/qa/serve-pages.mjs`.
- **Checks**: `.github/workflows/checks.yml` runs the launch-build guard and
  the test suite on every pull request and push.
- **Launch** (not yet): swap the Node adapter in `astro.config.mjs` for the
  chosen host's, set `RESEND_API_KEY`, `LEAD_TO_EMAIL` and `LEAD_FROM_EMAIL`
  so enquiries are emailed (see `src/lib/leads/transport.ts`), point the
  domain at the host, and run `npm run build`.
