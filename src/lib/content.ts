import { getCollection, render, type CollectionEntry } from 'astro:content';
import { reviewMode } from './mode';

/* The only place pages read content from. It applies the review/launch
   rules in one spot: fixtures and drafts appear in review mode only. */

type ProjectEntry = CollectionEntry<'projects'> | CollectionEntry<'projectFixtures'>;
export type ProjectData = CollectionEntry<'projects'>['data'];
export type Photo = NonNullable<ProjectData['hero']>;

export interface Project {
  /** URL segment. Fixtures are prefixed so they are recognisable everywhere. */
  slug: string;
  url: string;
  isFixture: boolean;
  data: ProjectData;
  entry: ProjectEntry;
}

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

function toProject(entry: ProjectEntry, isFixture: boolean): Project {
  const slug = isFixture ? `fixture-${entry.id}` : entry.id;
  return { slug, url: `/projects/${slug}/`, isFixture, data: entry.data as ProjectData, entry };
}

export async function getProjects(): Promise<Project[]> {
  const real = (await getCollection('projects')).map((e) => toProject(e, false));
  const fixtures = reviewMode
    ? (await getCollection('projectFixtures')).map((e) => toProject(e, true))
    : [];

  // Real work always leads. Within each group: featured first, then order.
  const sort = (list: Project[]) =>
    list.sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.order - b.data.order);

  return [...sort(real), ...sort(fixtures)];
}

export async function renderProject(project: Project) {
  return render(project.entry);
}

/** The photo that represents a project in lists and the hero. */
export function leadPhoto(project: Project): Photo | undefined {
  const { hero, gallery, beforeAfter } = project.data;
  return hero ?? gallery[0] ?? beforeAfter[0]?.after;
}

/** Close-up workmanship shots across all projects, for the detail section. */
export function detailPhotos(projects: Project[], limit = 3) {
  return projects
    .flatMap((project) =>
      project.data.gallery
        .filter((photo) => photo.kind === 'detail')
        .map((photo) => ({ photo, project })),
    )
    .slice(0, limit);
}

export function projectLocation(project: Project) {
  const { suburb, state } = project.data.location ?? {};
  return [suburb, state].filter(Boolean).join(', ') || undefined;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatCompleted(value?: string) {
  if (!value) return undefined;
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

export async function getServices() {
  const all = (await getCollection('services')).sort(byOrder);
  return reviewMode ? all : all.filter((service) => !service.data.draft);
}

export async function getFaqs() {
  const all = (await getCollection('faqs')).sort(byOrder);
  return reviewMode ? all : all.filter((faq) => !faq.data.draft);
}

export async function getTestimonials() {
  return (await getCollection('testimonials')).filter((t) => t.data.verified);
}

export async function getServiceAreas() {
  return (await getCollection('serviceAreas')).sort(byOrder);
}
