import { site, hasAbn } from '../../data/site';

/**
 * Structured data for Google.
 *
 * Nothing here is invented. Fields backed by unverified values in site.ts
 * are omitted entirely rather than guessed — a wrong address or fabricated
 * credential in JSON-LD is both a trust problem and a ranking risk.
 */

const BUSINESS_ID = `${site.url}/#business`;
const absolute = (path: string) => new URL(path, site.url).toString();

export function businessSchema() {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    // RoofingContractor is a LocalBusiness subtype — more specific than
    // the generic LocalBusiness most competitors use.
    '@type': 'RoofingContractor',
    '@id': BUSINESS_ID,
    name: site.name,
    description: site.tagline,
    url: site.url,
    email: site.email,
    telephone: site.contacts.map((c) => c.phone),
    logo: absolute('/brand/enj-logo.png'),
    image: absolute('/brand/enj-og.jpg'),
    sameAs: [site.social.instagram],

    // No streetAddress: ENJ is a service-area business operating from
    // Ulladulla rather than a shopfront. Locality and region are accurate;
    // a fabricated street address would not be.
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.base.suburb,
      addressRegion: site.base.state,
      postalCode: site.base.postcode,
      addressCountry: site.base.country,
    },

    // Confirmed service area only. Expand once ENJ confirms travel radius.
    areaServed: [
      {
        '@type': 'Place',
        name: `${site.base.suburb}, ${site.base.state}`,
      },
    ],

    currenciesAccepted: 'AUD',
  };

  if (hasAbn) {
    schema.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'ABN',
      value: site.abn,
    };
  }

  if (site.hours.length > 0) {
    schema.openingHoursSpecification = site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    }));
  }

  return schema;
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: 'en-AU',
    publisher: { '@id': BUSINESS_ID },
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: absolute(input.url),
    serviceType: input.name,
    provider: { '@id': BUSINESS_ID },
    areaServed: { '@type': 'Place', name: `${site.base.suburb}, ${site.base.state}` },
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absolute(item.url),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
