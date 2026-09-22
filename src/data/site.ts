/**
 * Single source of truth for ENJ's business data.
 *
 * Every tel: link, footer line, contact page and JSON-LD block reads from here,
 * so NAP data can never drift out of sync with the structured data Google reads.
 *
 * Empty string / empty array means "not yet verified" — consuming components
 * render nothing rather than a placeholder. Never fill these with example values.
 */

export interface Contact {
  name: string;
  /** E.164, used in tel: hrefs */
  phone: string;
  /** Australian display format */
  display: string;
}

export const site = {
  name: 'ENJ Metal Roofing',
  shortName: 'ENJ',
  legalName: 'ENJ Metal Roofing',

  tagline: 'Premium Metal Roofing Solutions',
  values: ['Quality', 'Reliability', 'Workmanship'] as const,

  url: 'https://enjmetalroofing.com.au',
  email: 'enjmetalroofing@gmail.com',

  contacts: [
    { name: 'John', phone: '+61492803371', display: '0492 803 371' },
    { name: 'Ethan', phone: '+61490459266', display: '0490 459 266' },
  ] satisfies Contact[],

  base: {
    suburb: 'Ulladulla',
    state: 'NSW',
    stateName: 'New South Wales',
    postcode: '2539',
    region: 'Shoalhaven',
    country: 'AU',
  },

  social: {
    instagram: 'https://www.instagram.com/enj.metalroofing/',
    instagramHandle: '@enj.metalroofing',
  },

  // ─────────────────────────────────────────────────────────────
  // Awaiting verified values from ENJ. Components check for a
  // non-empty string before rendering — an empty value renders
  // nothing at all, never a placeholder or "N/A".
  // ─────────────────────────────────────────────────────────────

  /** Australian Business Number, e.g. '12 345 678 901' */
  abn: '',

  licence: {
    /** NSW contractor licence number */
    number: '',
    authority: 'NSW Fair Trading',
  },

  insurance: {
    /** e.g. '$20,000,000 public liability' */
    publicLiability: '',
  },

  /** No street address published — ENJ operates from Ulladulla across the
   *  South Coast. LocalBusiness schema uses areaServed instead, which is
   *  correct for a mobile trade and avoids an unverifiable address. */
  address: null,

  /** Opening hours, once confirmed. Schema.org omits the property while empty. */
  hours: [] as { days: string[]; opens: string; closes: string }[],
} as const;

/** John is listed first and is the default call target across the site. */
export const primaryContact = site.contacts[0];

export const hasLicence = site.licence.number.length > 0;
export const hasAbn = site.abn.length > 0;
