import Link from 'next/link';

import { cn } from '@/lib/utils';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

const buttonStyles = {
  primary: 'bg-ember text-white hover:bg-[#941f15] focus-visible:outline-ember shadow-soft',
  secondary: 'bg-ink text-white hover:bg-black focus-visible:outline-ink shadow-soft',
  ghost:
    'border border-white/30 bg-white/10 text-white hover:bg-white/15 focus-visible:outline-white',
};

export function Button({
  children,
  href,
  type = 'button',
  onClick,
  className,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
    buttonStyles[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} aria-disabled={disabled}>
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
