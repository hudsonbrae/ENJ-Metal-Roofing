import { defineCollection, reference, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

/* Content model.

   Rule: every descriptive field is optional. Templates render a field only
   when it has a value, so an unknown suburb produces a project page with no
   location line rather than a placeholder. No required field exists that
   could tempt someone to fill a gap with a guess.

   Real ENJ content lives in src/content/. Development fixtures live in
   src/fixtures/ as a separate collection and are only merged in review mode
   (see src/lib/content.ts). A launch build refuses to ship them
   (scripts/check-launch-build.mjs). */

const photo = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    /** Describe what is in the photo. Required: every image needs alt text. */
    alt: z.string().min(1),
    caption: z.string().optional(),
  });

const projectSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    /** The service this job falls under. Links the project to its service page. */
    service: reference('services').optional(),
    /** One or two factual sentences. No superlatives. */
    summary: z.string().optional(),

    location: z
      .object({
        suburb: z.string().optional(),
        state: z.string().optional(),
      })
      .optional(),
    /** "2026" or "2026-09". Only if known. */
    completed: z
      .string()
      .regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Use YYYY or YYYY-MM')
      .optional(),
    status: z.enum(['complete', 'in-progress']).default('complete'),

    roof: z
      .object({
        /** e.g. Corrugated, Trimdek, Klip-Lok */
        profile: z.string().optional(),
        /** e.g. COLORBOND steel, COLORBOND Ultra, Zincalume */
        material: z.string().optional(),
        /** e.g. Surfmist, Monument */
        colour: z.string().optional(),
      })
      .optional(),
    /** Factual list of the work done. */
    scope: z.array(z.string()).default([]),

    /** Leads the project. Falls back to the first gallery photo. */
    hero: photo(image).optional(),
    gallery: z
      .array(
        photo(image).extend({
          /** wide: the whole roof in context. detail: close-up workmanship. during: work underway. */
          kind: z.enum(['wide', 'detail', 'during']).default('wide'),
        }),
      )
      .default([]),
    beforeAfter: z
      .array(
        z.object({
          before: photo(image),
          after: photo(image),
          caption: z.string().optional(),
        }),
      )
      .default([]),

    /** Featured projects lead the homepage and the work page. */
    featured: z.boolean().default(false),
    /** Lower numbers sort first. */
    order: z.number().default(100),
  });

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: projectSchema,
});

/** Development fixtures. Same shape as projects, never real ENJ work. */
const projectFixtures = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/fixtures/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: projectSchema,
});

/**
 * Real ENJ photos that are not part of a documented project: a strong
 * detail shot, or a job with only one photo. Captions describe only what is
 * visible. Used for the homepage hero and detail section, and the Work page.
 */
const workmanship = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/workmanship' }),
  schema: ({ image }) =>
    photo(image).extend({
      /** detail: close-up of a junction, flashing or fixing. wide: a roof in context. */
      kind: z.enum(['detail', 'wide', 'during']).default('detail'),
      /** Use as the homepage hero. Only one should be set. */
      hero: z.boolean().default(false),
      /** Crop anchor for tight crops, e.g. "50% 40%". */
      focus: z.string().optional(),
      order: z.number().default(100),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Short form for navigation. */
      shortTitle: z.string().optional(),
      summary: z.string(),
      /** Factual description of what the work involves. */
      includes: z.array(z.string()).default([]),
      suitableFor: z.array(z.string()).default([]),
      image: photo(image).optional(),
      order: z.number().default(100),
      /**
       * True until ENJ confirms they offer this service.
       * Review mode shows drafts with an "awaiting confirmation" marker;
       * launch mode leaves them out of pages, navigation and the sitemap.
       */
      draft: z.boolean().default(true),
    }),
});

/** Empty until ENJ supplies genuine, attributable reviews. */
const testimonials = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    author: z.string(),
    suburb: z.string().optional(),
    date: z.coerce.date().optional(),
    source: z.enum(['google', 'facebook', 'direct']),
    /** Must be true to render. */
    verified: z.boolean().default(false),
    project: reference('projects').optional(),
  }),
});

/**
 * Empty by design. An area page exists only where ENJ confirms it works,
 * never generated from a suburb list for SEO.
 */
const serviceAreas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/service-areas' }),
  schema: z.object({
    suburb: z.string(),
    state: z.string().default('NSW'),
    postcode: z.string().optional(),
    order: z.number().default(100),
  }),
});

/** Questions ENJ actually gets asked. The markdown body is the answer. */
const faqs = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    order: z.number().default(100),
    /** Unconfirmed answers show in review mode only. */
    draft: z.boolean().default(true),
  }),
});

export const collections = { projects, projectFixtures, workmanship, services, testimonials, serviceAreas, faqs };
