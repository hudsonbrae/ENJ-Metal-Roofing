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

The first 19 photos are on the site: three projects plus eight workmanship
close-ups. See [PHOTO-AUDIT.md](PHOTO-AUDIT.md) for what went where and what
is still missing. For each project, ENJ to confirm:

| Project | Confirm |
| --- | --- |
| Rural hip roof | The two photos are the same job; suburb, year, roof profile and colour if happy to share |
| Suburban home | Same as above |
| New home in a housing estate | Same as above; whether it can be described as a new build |

Also: permission to show each property (the photos are aerial and some
show neighbouring homes), and whether the worker visible in the
bushland photo is happy to appear.

## Optional

- Opening hours (`src/data/site.ts` → `hours`)
- Common questions customers ask, with answers (`src/content/faqs`)
- Customer reviews once real ones exist (`src/content/testimonials`)
- Suburbs to highlight within the Shoalhaven, only where ENJ has done work
  (`src/content/service-areas`)
