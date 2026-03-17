/** Shared constants for Playwright tests — no Next.js imports. */

export const SITE_NAME = 'Diaz Martial Arts';

export const NAV_LINKS = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/contact', label: 'Contact' },
  { href: '/ondemand', label: 'Diaz on Demand' },
];

export const MARKETING_NAV_LINKS = NAV_LINKS.filter((link) => link.href !== '/ondemand');

export const PUBLIC_PAGES: Array<{ path: string; heading: string }> = [
  { path: '/', heading: 'Martial Arts for Real' },
  { path: '/pricing', heading: 'Pricing' },
  { path: '/programs', heading: 'Programs' },
  { path: '/schedule', heading: 'Schedule' },
  { path: '/coaches', heading: 'Coaches' },
  { path: '/announcements', heading: 'Announcements' },
  { path: '/contact', heading: 'Contact' },
  { path: '/faq', heading: 'FAQ' },
  { path: '/privacy', heading: 'Privacy' },
  { path: '/terms', heading: 'Terms' },
  { path: '/sign-in', heading: 'Member Login' },
];
