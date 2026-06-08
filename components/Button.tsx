import Link from 'next/link';

import { cn } from '@/lib/utils';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'ghost-light';
  size?: 'md' | 'lg';
  disabled?: boolean;
};

const buttonStyles = {
  primary: 'bg-ember text-white hover:bg-[#941f15] focus-visible:outline-ember shadow-soft',
  secondary: 'bg-ink text-white hover:bg-black focus-visible:outline-ink shadow-soft',
  ghost:
    'border border-black/18 bg-transparent text-ink hover:border-black/40 hover:bg-black/5 focus-visible:outline-ink',
  'ghost-light':
    'border border-white/25 bg-transparent text-sand hover:bg-white/10 focus-visible:outline-white',
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
