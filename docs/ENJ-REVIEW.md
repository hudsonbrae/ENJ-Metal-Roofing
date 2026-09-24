# ENJ review list

Everything on the site that is waiting on John and Ethan. In the review
build these items show with an **Awaiting ENJ** marker or a
**Photograph needed** panel; in the launch build they are hidden until
confirmed. Nothing here is filled in with a guess.

## Confirmed so far

- Business works across the Shoalhaven region, NSW
- John and Ethan are the owners
- Contact: John 0492 803 371, Ethan 0490 459 266, enjmetalroofing@gmail.com
- Free quotes (from the Instagram bio)
- Logo: the supplied artwork is the only version; the site uses a vector
  trace of it, plus a horizontal version for the header

## Needed before launch

| Item | Where it shows | How to update |
| --- | --- | --- |
| Which services to advertise | Services pages, homepage, footer, quote form options | `src/content/services/*.md`: set `draft: false` on each confirmed service; delete any not offered |
| Service descriptions are accurate | Each service page | Same files |
| How a job runs (4 steps) | Homepage "How a job runs" | `src/data/process.ts`: edit wording, then `processConfirmed = true` |
| "A new business" wording, and whether to mention John and Ethan's trade background | About page | `src/pages/about.astro` |
| NSW contractor licence number | About page, footer | `src/data/site.ts` → `licence.number` |
| ABN | About page, footer, structured data | `src/data/site.ts` → `abn` |
| Public liability insurance | About page | `src/data/site.ts` → `insurance.publicLiability` |
| Privacy policy checked | Privacy page | `src/pages/privacy.astro` |

## Photography

Add each job as a project (see `src/content/projects/_TEMPLATE.md.txt`).
The most useful shots, in order:

1. A finished roof from ground level or low drone, with the house in view
   (homepage hero and project lead)
2. Close-ups of ridge capping, a valley or flashing, and a run of fasteners
   (homepage "Where roofs fail")
3. A before and after from the same spot
4. Work underway, with sheets going on
5. John and Ethan on site (About page); a real photo, no stock

Once the first real project is added, the development fixtures stop leading
the homepage automatically; they remain in review mode below real work
until removed from `src/fixtures/projects`.

## Optional

- Opening hours (`src/data/site.ts` → `hours`)
- Common questions customers ask, with answers (`src/content/faqs`)
- Customer reviews once real ones exist (`src/content/testimonials`)
- Suburbs to highlight within the Shoalhaven, only where ENJ has done work
  (`src/content/service-areas`)
