import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { Placeholder } from '@/components/Placeholder';
import { coaches } from '@/content/coaches';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Coaches',
  description:
    'Meet the Diaz Martial Arts coaching team leading youth and adult martial arts instruction.',
  path: '/coaches',
  keywords: [
    'martial arts coaches',
    'bjj instructors san marcos',
    'kids martial arts instructors',
  ],
});

export default function CoachesPage() {
  const head = coaches[0];

  if (!head) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <Eyebrow>Instruction</Eyebrow>
        <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">
          Coaches
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-black/75 sm:text-lg">
          Coach profiles are being updated. Please check back soon.
        </p>
      </section>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>Instruction</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">
              Coaches
            </h1>
          </div>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            Experienced instructors focused on technical growth, safety, and long-term
            student development.
          </p>
        </div>
      </section>

      {/* FEATURED HEAD COACH */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8">
        <Placeholder
          label={`Coach ${head.name} · portrait`}
          tint="ember"
          height={520}
          src={head.image}
          alt={head.name}
        />
        <div className="mt-8 lg:mt-0 lg:pt-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-bronze">
            01 · Head Instructor
          </div>
          <h2 className="display mt-3 text-4xl sm:text-5xl lg:text-[64px]">
            {head.name.replace(/^Coach\s+/, '')}
          </h2>
          <div className="mt-6 space-y-3">
            {head.bio.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-black/75"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <Button href="/contact" variant="secondary" size="lg" className="mt-6">
            Train with {head.name.split(' ')[1] ?? head.name} →
          </Button>
        </div>
      </section>

    </>
  );
}
