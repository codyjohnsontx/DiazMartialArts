import Image from 'next/image';

import { cn } from '@/lib/utils';

type Tint = 'sand' | 'ink' | 'ember' | 'clay';

type PlaceholderProps = {
  label: string;
  tint?: Tint;
  height?: number;
  ratio?: string;
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
};

const tints: Record<Tint, { a: string; b: string; text: string }> = {
  sand: { a: '#E9DFD5', b: '#DCD0C2', text: 'rgba(16,18,20,0.55)' },
  ink: { a: '#1A1F26', b: '#101214', text: 'rgba(247,243,237,0.65)' },
  ember: { a: '#7A1810', b: '#5C100A', text: 'rgba(247,243,237,0.72)' },
  clay: { a: '#D4C4B3', b: '#C2B09D', text: 'rgba(16,18,20,0.55)' },
};

export function Placeholder({
  label,
  tint = 'sand',
  height,
  ratio,
  src,
  alt,
  className,
  children,
}: PlaceholderProps) {
  const t = tints[tint];

  if (src) {
    return (
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-sm bg-black/5',
          className,
        )}
        style={{
          height: ratio ? undefined : height,
          aspectRatio: ratio,
        }}
      >
        <Image
          src={src}
          alt={alt ?? label}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex w-full items-end overflow-hidden rounded-sm p-4',
        className,
      )}
      style={{
        height: ratio ? undefined : height,
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${t.a} 0 14px, ${t.b} 14px 28px)`,
        color: t.text,
      }}
    >
      {children}
      <span className="font-mono text-[11px] uppercase tracking-[0.08em]">{label}</span>
    </div>
  );
}
