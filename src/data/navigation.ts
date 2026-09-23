/** Primary navigation. Service links are not listed here: they come from
 *  the services collection, so a new or withdrawn service updates the
 *  footer automatically. */
export const primaryNav = [
  { label: 'Services', href: '/services/' },
  { label: 'Work', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const quoteHref = '/contact/';

export function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}
