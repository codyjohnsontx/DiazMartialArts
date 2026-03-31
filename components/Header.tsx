'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './Button';

const navItems = [
  { href: '/programs', label: 'Programs' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/contact', label: 'Contact' },
  { href: '/ondemand', label: 'Diaz on Demand' },
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
    <header className="sticky top-0 z-40 border-b border-black/10 bg-sand/95 shadow-soft backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-ink"
          aria-label="Diaz Martial Arts home"
        >
          <Image
            src="/diaz_logo.avif"
            alt="Diaz Martial Arts"
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
          <span className="text-base font-bold tracking-wide">Diaz Martial Arts</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="nav-link whitespace-nowrap text-sm font-semibold text-black/80 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <SignedOut>
            <Button href="/sign-in?redirect_url=/account" variant="secondary">
              Member Login
            </Button>
          </SignedOut>
          <SignedIn>
            <Button href="/account" variant="secondary">
              My Account
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 text-ink md:hidden"
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
          'md:hidden',
          open
            ? 'pointer-events-auto max-h-[560px] border-t border-black/10 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0',
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
          <SignedOut>
            <Button
              href="/sign-in?redirect_url=/account"
              className="mt-2 w-full"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Member Login
            </Button>
          </SignedOut>
          <SignedIn>
            <Button
              href="/account"
              className="mt-2 w-full"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              My Account
            </Button>
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
