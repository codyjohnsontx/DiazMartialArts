/** Shared constants for Playwright tests — no Next.js imports. */

export const SITE_NAME = 'Diaz Martial Arts';

/**
 * Members live in the separate Diaz on Demand app. Mirrors resolveOndemandUrl in
 * lib/ondemand-url.mjs: undefined when unset or still the reserved .invalid
 * placeholder, otherwise the normalised URL the site actually emits.
 */
export const ONDEMAND_URL: string | undefined = (() => {
  const raw = process.env.NEXT_PUBLIC_ONDEMAND_URL?.trim();
  if (!raw) return undefined;

  const url = new URL(raw);
  return url.hostname.endsWith('.invalid') ? undefined : url.toString();
})();

export const NAV_LINKS = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/contact', label: 'Contact' },
  { href: '/ondemand', label: 'On Demand' },
];

export const MARKETING_NAV_LINKS = NAV_LINKS.filter((link) => link.href !== '/ondemand');

export const PUBLIC_PAGES: Array<{ path: string; heading: string }> = [
  { path: '/', heading: 'Martial arts' },
  { path: '/pricing', heading: 'Pricing' },
  { path: '/programs', heading: 'Programs' },
  { path: '/programs/brazilian-jiu-jitsu', heading: 'Brazilian Jiu Jitsu' },
  { path: '/programs/muay-thai-kickboxing', heading: 'Muay Thai' },
  { path: '/programs/haganah', heading: 'Haganah' },
  { path: '/programs/tkd-korean-karate', heading: 'TKD Korean Karate' },
  { path: '/programs/filipino-martial-arts-jkd', heading: 'Filipino Martial Arts' },
  { path: '/programs/iptt-tactical', heading: 'I.P.T.T. Tactical' },
  { path: '/programs/beginner-lil-dragons', heading: "Beginner Lil' Dragons" },
  { path: '/programs/advanced-lil-dragons', heading: "Advanced Lil' Dragons" },
  { path: '/programs/beginner-juniors', heading: 'Beginner Juniors' },
  { path: '/programs/advanced-juniors', heading: 'Advanced Juniors' },
  { path: '/programs/junior-black-belts', heading: 'Junior Black Belts' },
  { path: '/programs/kids-brazilian-jiu-jitsu', heading: 'Kids Brazilian Jiu Jitsu' },
  { path: '/schedule', heading: 'Schedule' },
  { path: '/coaches', heading: 'Coaches' },
  { path: '/announcements', heading: 'Announcements' },
  { path: '/contact', heading: 'Visit the gym' },
  { path: '/faq', heading: 'FAQ' },
  { path: '/privacy', heading: 'Privacy' },
  { path: '/terms', heading: 'Terms' },
];
