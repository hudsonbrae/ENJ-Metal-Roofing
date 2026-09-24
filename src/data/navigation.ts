import { url } from '../lib/paths';

/** Primary navigation. Service links are not listed here: they come from
 *  the services collection, so a new or withdrawn service updates the
 *  footer automatically. Paths are root-relative; render them with url(). */
export const primaryNav = [
  { label: 'Services', href: '/services/' },
  { label: 'Work', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const quoteHref = '/contact/';

/** Whether `href` (a site path) is the current page or one of its children. */
export function isCurrent(pathname: string, href: string) {
  const target = url(href);
  return href === '/' ? pathname === target : pathname.startsWith(target);
}
