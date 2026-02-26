import Link from 'next/link';

import { site } from '@/content/site';

const quickLinks = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/account', label: 'My Account' },
  { href: '/ondemand', label: 'Diaz on Demand' },
];

export function Footer() {
  const socialLinks = [
    { label: 'Instagram', href: site.socials.instagram },
    { label: 'Facebook', href: site.socials.facebook },
    { label: 'YouTube', href: site.socials.youtube },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-20 border-t border-black/10 bg-ink text-sand" role="contentinfo">
      <div className="mx-auto w-full max-w-6xl border-t-2 border-ember px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="text-lg font-bold">{site.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Address: {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              Phone: <a href={site.phoneHref}>{site.phone}</a>
              <br />
              Email: <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
              Hours
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {site.hours.map((hour) => (
                <li key={hour}>{hour}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
              Quick Links
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm text-white/80">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm transition hover:text-ember focus-visible:outline-ember"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/85">
              Socials
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm transition hover:text-ember focus-visible:outline-ember"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/65 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-ember">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-ember">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
