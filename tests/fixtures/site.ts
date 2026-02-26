/** Shared constants for Playwright tests — no Next.js imports. */

export const SITE_NAME = 'Diaz Martial Arts';

export const NAV_LINKS = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export const PUBLIC_PAGES: Array<{ path: string; heading: string }> = [
  { path: '/', heading: 'Martial Arts for Real' },
  { path: '/programs', heading: 'Programs' },
  { path: '/schedule', heading: 'Schedule' },
  { path: '/coaches', heading: 'Coaches' },
  { path: '/pricing', heading: 'Pricing' },
  { path: '/contact', heading: 'Contact' },
  { path: '/faq', heading: 'FAQ' },
  { path: '/privacy', heading: 'Privacy' },
  { path: '/terms', heading: 'Terms' },
];
