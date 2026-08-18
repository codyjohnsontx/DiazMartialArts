'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'primary-light' | 'ghost-light' | 'outline-light';
  size?: 'md' | 'lg';
  disabled?: boolean;
};

// The ember fill is shared so the two primaries cannot drift apart; only the
// focus ring differs between them.
const primarySurface = 'bg-ember text-white shadow-soft hover:bg-[#941f15]';

// The `-light` variants are the dark-surface halves of their siblings. Both
// exist because the ratio that carries the control on a light page collapses on
// a dark one, and `cn` is a plain join with no tailwind-merge, so overriding a
// variant through `className` would leave the winner up to Tailwind's internal
// class ordering rather than anything this file declares.
const buttonStyles = {
  primary: `${primarySurface} focus-visible:outline-ember`,
  // Ember on ember-on-dark: the focus ring misses the 3:1 WCAG 1.4.11 bar for a
  // focus indicator on dark surfaces generally, not only over imagery. It
  // reaches about 1.66:1 against the home hero's photo backdrop and about
  // 2.86:1 against bg-ink; a white ring clears the bar on both, at about
  // 10.9:1 over that photo backdrop and about 18.8:1 over bg-ink. The default
  // `primary` keeps the ember ring, so app/page.tsx's CTA banner sits on the
  // bg-ink side of that same gap. That instance is pre-existing and is left
  // alone deliberately because the change that added this variant was scoped to
  // the hero.
  'primary-light': `${primarySurface} focus-visible:outline-white`,
  secondary: 'bg-ink text-white hover:bg-black focus-visible:outline-ink shadow-soft',
  ghost:
    'border border-black/20 bg-transparent text-ink hover:border-black/40 hover:bg-black/5 focus-visible:outline-ink',
  'ghost-light':
    'border border-white/25 bg-transparent text-sand hover:bg-white/10 focus-visible:outline-white',
  // ghost-light's 25% border is about 2.22:1 over bg-ink and about 2.1:1 over
  // the hero's photo backdrop, so it misses the 3:1 WCAG 1.4.11 bar on both.
  // That gap is pre-existing and is not specific to imagery, so it is not why
  // the hero needed another variant. It is left alone deliberately because that
  // change was scoped to the hero, and it reaches every ghost-light call site:
  // app/page.tsx, app/contact/page.tsx (twice), app/ondemand/page.tsx,
  // components/FaqAccordion.tsx and components/ScheduleContent.tsx. The hero
  // needed a border that clears 3:1 against a photographic backdrop, which a
  // 50% border does at about 4.06:1.
  'outline-light':
    'border border-white/50 bg-transparent text-sand hover:border-white hover:bg-white/10 focus-visible:outline-white',
};

const sizeStyles = {
  md: 'px-[18px] py-2.5 text-[13px]',
  lg: 'px-6 py-3.5 text-sm',
};

export function Button({
  children,
  href,
  type = 'button',
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-full text-center font-bold leading-snug tracking-[0.02em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
    sizeStyles[size],
    buttonStyles[variant],
    href && disabled && 'cursor-not-allowed opacity-70',
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          onClick?.();
        }}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
