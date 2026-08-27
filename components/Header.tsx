'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './Button';
import { Crest } from './Crest';

const navItems = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/contact', label: 'Contact' },
  { href: '/ondemand', label: 'On Demand' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-ink"
          aria-label="Diaz Martial Arts home"
        >
          <Crest size={42} />
          <span className="leading-[1.05]">
            <span className="block text-[15px] font-extrabold tracking-wide">
              DIAZ MARTIAL ARTS
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 min-[1035px]:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap pb-1 text-[13px] font-semibold tracking-[0.02em] transition',
                  active
                    ? 'border-b-2 border-ember text-ink'
                    : 'border-b-2 border-transparent text-black/70 hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 min-[1035px]:flex">
          <Button href="/contact">Book Free Trial</Button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-ink min-[1035px]:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="text-lg">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          'min-[1035px]:hidden',
          // `invisible` is load-bearing rather than decoration: opacity and max-height
          // hide the closed panel from the eye and the mouse but leave its links in
          // the tab order. `tests/e2e/header-widths.spec.ts` owns that reasoning and
          // fails in both directions - closed unreachable, open reachable.
          open
            ? 'visible pointer-events-auto max-h-[560px] border-t border-black/10 opacity-100'
            : 'invisible pointer-events-none max-h-0 overflow-hidden opacity-0',
        )}
      >
        <nav aria-label="Mobile" className="space-y-2 bg-sand px-4 py-5 sm:px-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-base font-semibold text-ink hover:bg-black/5',
                isActive(item.href) && 'bg-black/5',
              )}
              aria-current={isActive(item.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2">
            <Button href="/contact" className="w-full" onClick={() => setOpen(false)}>
              Book Free Trial
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
