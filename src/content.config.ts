import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* ═══════════════════════════════════════════════════════════════
   CONTENT MODEL

   Design rule: every descriptive field is OPTIONAL.

   Templates render a field only when it exists, so an unknown
   suburb produces a project page with no location line — which
   reads as deliberate, not incomplete. This makes fabrication
   structurally impossible rather than merely discouraged: there
   is no required field that could tempt a placeholder value.

   `testimonials` and `serviceAreas` intentionally ship with zero
   entries. Their sections do not render while empty and appear
   automatically once real content exists.
   ═══════════════════════════════════════════════════════════════ */

const imageRole = z.enum([
  'hero',    // 16:9 desktop / 4:5 mobile — leads the project
  'wide',    // full-bleed context shot
  'detail',  // macro: seam, flashing, ridge, valley — workmanship evidence
  'before',
  'during',
  'after',
]);

const projects = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      // ── Required: structural only, never descriptive ──
      title: z.string(),
      status: z.enum(['complete', 'in-progress']),
      type: z.enum([
        're-roof',
        'new-construction',
        'repair',
        'gutters-fascia',
        'other',
      ]),

      // ── Optional: rendered only when verified ──
      suburb: z.string().optional(),
      state: z.string().optional(),
      year: z.number().int().optional(),
      /** e.g. 'Corrugated', 'Trimdek', 'Klip-Lok' */
      roofProfile: z.string().optional(),
      /** e.g. 'COLORBOND steel' */
      material: z.string().optional(),
      /** e.g. 'Surfmist' */
      colour: z.string().optional(),
      /** Factual work items, not marketing claims */
      scope: z.array(z.string()).optional(),
      summary: z.string().optional(),

      images: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            role: imageRole,
            caption: z.string().optional(),
          }),
        )
        .default([]),

      featured: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Short form for nav and indices */
      shortTitle: z.string().optional(),
      summary: z.string(),
      /** Factual description of what the work involves */
      includes: z.array(z.string()).optional(),
      suitableFor: z.array(z.string()).optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      relatedProjects: z.array(reference('projects')).default([]),
      order: z.number().default(0),
      /**
       * TRUE until ENJ confirms they offer this service.
       *
       * Draft services still render — the site would otherwise have no
       * services at all before confirmation — but the build prints a
       * warning listing every unconfirmed entry, and this flag is the
       * single greppable marker for what still needs sign-off.
       */
      draft: z.boolean().default(true),
    }),
});

/** Empty until ENJ supplies genuine, attributable reviews. */
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    suburb: z.string().optional(),
    date: z.coerce.date().optional(),
    source: z.enum(['google', 'facebook', 'direct']),
    /** Must be true to render. Guards against unverified quotes. */
    verified: z.boolean().default(false),
    relatedProject: reference('projects').optional(),
  }),
});

/**
 * Empty by design. Area pages are only created where ENJ has genuinely
 * worked — never generated across a suburb list for SEO. Thin, duplicated
 * location pages are both dishonest and actively penalised by Google.
 */
const serviceAreas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/service-areas' }),
  schema: z.object({
    suburb: z.string(),
    state: z.string().default('NSW'),
    postcode: z.string().optional(),
    /** Straight-line distance context, only if meaningful */
    intro: z.string().optional(),
    relatedProjects: z.array(reference('projects')).default([]),
    order: z.number().default(0),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    order: z.number().default(0),
    /** Surfaces in FAQPage structured data */
    schema: z.boolean().default(true),
  }),
});

export const collections = { projects, services, testimonials, serviceAreas, faqs };
