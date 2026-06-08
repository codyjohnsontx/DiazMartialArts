import { cn } from '@/lib/utils';

type EyebrowProps = {
  children: React.ReactNode;
  variant?: 'default' | 'light';
  className?: string;
};

export function Eyebrow({ children, variant = 'default', className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'm-0 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.24em]',
        variant === 'light' ? 'text-gold' : 'text-bronze',
        className,
      )}
    >
      <span
        className="inline-block h-0.5 w-[22px] shrink-0 rounded-full bg-ember"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}
