import { cn } from '@/lib/utils';

type SectionProps = {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleAs?: 'h1' | 'h2';
};

export function Section({ id, title, children, className, titleAs = 'h2' }: SectionProps) {
  const HeadingTag = titleAs;

  return (
    <section
      id={id}
      className={cn('mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8', className)}
    >
      {title && (
        <header className="mb-10 max-w-3xl">
          <HeadingTag className="text-3xl font-bold text-ink sm:text-4xl">{title}</HeadingTag>
        </header>
      )}
      {children}
    </section>
  );
}
