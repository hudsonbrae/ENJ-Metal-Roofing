/**
 * Single source of truth for ENJ's business data.
 *
 * Every tel: link, footer line, contact page and JSON-LD block reads from
 * here, so contact details can never drift out of sync with the structured
 * data Google reads.
 *
 * An empty string or array means "not yet verified": consuming components
 * render nothing rather than a placeholder. Never fill these with example
 * values.
 */

export interface Contact {
  name: string;
  /** E.164, used in tel: hrefs */
  phone: string;
  /** Australian display format */
  display: string;
  /** Confirmed by ENJ. */
  owner: boolean;
}

export const site = {
  name: 'ENJ Metal Roofing',
  shortName: 'ENJ',
  legalName: 'ENJ Metal Roofing',

  tagline: 'Premium Metal Roofing Solutions',

  url: 'https://enjmetalroofing.com.au',
  email: 'enjmetalroofing@gmail.com',

  /** John and Ethan own the business (confirmed by ENJ). */
  contacts: [
    { name: 'John', phone: '+61492803371', display: '0492 803 371', owner: true },
    { name: 'Ethan', phone: '+61490459266', display: '0490 459 266', owner: true },
  ] satisfies Contact[],

  /**
   * ENJ works across the Shoalhaven region rather than from a published
   * street address, so structured data uses areaServed and no locality.
   */
  base: {
    region: 'Shoalhaven',
    /** For running text: "based in the Shoalhaven". */
    regionPhrase: 'the Shoalhaven',
    state: 'NSW',
    stateName: 'New South Wales',
    country: 'AU',
  },

  social: {
    instagram: 'https://www.instagram.com/enj.metalroofing/',
    instagramHandle: '@enj.metalroofing',
  },

  // Awaiting verified values from ENJ. Components render these only when
  // non-empty; an empty value renders nothing at all.

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

  /** Opening hours, once confirmed. Structured data omits them while empty. */
  hours: [] as { days: string[]; opens: string; closes: string }[],
} as const;

/** John is listed first and is the default call target across the site. */
export const primaryContact = site.contacts[0];
export const owners = site.contacts.filter((c) => c.owner);
export const ownerNames = owners.map((c) => c.name).join(' and ');

export const hasLicence = site.licence.number.length > 0;
export const hasAbn = site.abn.length > 0;
