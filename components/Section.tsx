import { cn } from '@/lib/utils';

type SectionProps = {
  id?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleAs?: 'h1' | 'h2';
};

export function Section({
  id,
  title,
  eyebrow,
  description,
  children,
  className,
  titleAs = 'h2',
}: SectionProps) {
  const HeadingTag = titleAs;

  return (
    <section
      id={id}
      className={cn('mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8', className)}
    >
      {(title || eyebrow || description) && (
        <header className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-bronze">
              <span
                className="inline-block h-0.5 w-5 shrink-0 rounded-full bg-ember"
                aria-hidden="true"
              />
              {eyebrow}
            </p>
          )}
          {title && (
            <HeadingTag className="text-3xl font-bold text-ink sm:text-4xl">{title}</HeadingTag>
          )}
          {description && (
            <p className="mt-4 text-base leading-relaxed text-black/75">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
