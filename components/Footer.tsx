import Link from 'next/link';

import { site } from '@/content/site';

import { Crest } from './Crest';

const trainLinks = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/ondemand', label: 'On Demand' },
];

const gymLinks = [
  { href: '/coaches', label: 'Coaches' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function FooterTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/85">
      {children}
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <FooterTitle>{title}</FooterTitle>
      <ul className="mt-3 grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[13px] text-white/72 transition hover:text-sand focus-visible:outline-ember"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === 'Instagram') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.55a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7.25a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Zm0 2a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z" />
      </svg>
    );
  }

  if (name === 'Facebook') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M14 8.3V6.9c0-.68.47-.84.8-.84h2.05V2.18L14.03 2C10.9 2 9.78 4.35 9.78 5.86V8.3H7v4.05h2.78V22H14v-9.65h3.18l.5-4.05H14Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

export function Footer() {
  const socialLinks = [
    { href: site.socials.instagram, full: 'Instagram' },
    { href: site.socials.facebook, full: 'Facebook' },
    { href: site.socials.youtube, full: 'YouTube' },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="mt-20 bg-ink text-sand" role="contentinfo">
      <div className="mx-auto w-full max-w-6xl border-t-2 border-ember px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Crest size={40} variant="light" />
              <div>
                <div className="text-base font-extrabold">DIAZ MARTIAL ARTS</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Est. 1998
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-[1.7] text-white/72">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            <p className="mt-3 text-[13px] leading-[1.7] text-white/72">
              <a href={site.phoneHref} className="hover:text-sand">
                {site.phone}
              </a>
              <br />
              <a href={`mailto:${site.email}`} className="hover:text-sand">
                {site.email}
              </a>
            </p>
          </div>

          <FooterCol title="Train" links={trainLinks} />
          <FooterCol title="Gym" links={gymLinks} />

          <div>
            <FooterTitle>Hours</FooterTitle>
            <ul className="mt-3 grid gap-1.5">
              {site.hours.map((h) => (
                <li
                  key={h}
                  className="text-[13px] text-white/72 [font-variant-numeric:tabular-nums]"
                >
                  {h}
                </li>
              ))}
            </ul>
            {socialLinks.length > 0 && (
              <>
                <div className="mt-6">
                  <FooterTitle>Follow</FooterTitle>
                </div>
                <div className="mt-3 flex gap-2">
                  {socialLinks.map((s) => (
                    <a
                      key={s.full}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.full}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 text-sand transition hover:bg-white/10 focus-visible:outline-ember"
                    >
                      <SocialIcon name={s.full} />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-5 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition hover:text-sand">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-sand">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="transition hover:text-sand">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
