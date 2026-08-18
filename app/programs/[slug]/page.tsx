import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@/components/Button';
import { CourseSchema } from '@/components/CourseSchema';
import { CTABanner } from '@/components/CTABanner';
import { Eyebrow } from '@/components/Eyebrow';
import { Placeholder } from '@/components/Placeholder';
import { Section } from '@/components/Section';
import { programs } from '@/content/programs';
import { classDescriptions } from '@/content/schedule';
import { site } from '@/content/site';
import { getClassesForProgram } from '@/lib/classSchedule';
import { pageMetadata } from '@/lib/seo';

export async function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const program = programs.find((p) => p.slug === params.slug);
  if (!program) return {};

  return pageMetadata({
    title: program.title,
    description: program.description,
    path: `/programs/${program.slug}`,
    image: program.image,
    keywords: [program.title, program.tag, site.address.city, 'martial arts'],
  });
}

export default function ProgramPage({ params }: { params: { slug: string } }) {
  const program = programs.find((p) => p.slug === params.slug);
  if (!program) notFound();

  const schedule = getClassesForProgram(program.scheduleMatchers);

  return (
    <>
      <CourseSchema program={program} />

      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_340px] lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>{program.tag}</Eyebrow>
            <h1 className="display mt-5 text-4xl sm:text-6xl lg:text-7xl">{program.title}</h1>
            <p className="mt-2 text-base font-semibold text-bronze">{program.sub}</p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-black/75 sm:text-lg">
              {program.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact">Book a free trial</Button>
              <Button href="/schedule" variant="ghost">
                See full schedule
              </Button>
            </div>
          </div>
          <Placeholder
            label={program.tag}
            tint="ink"
            ratio="4/5"
            src={program.image}
            alt={`${program.title} class at Diaz Martial Arts`}
            className="hidden lg:block"
          />
        </div>
      </section>

      {/* OVERVIEW */}
      <Section eyebrow="Program details" title="Who it's for">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="border-t-2 border-ember pt-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ember">
              Ages
            </div>
            <p className="mt-1 text-lg font-bold">{program.age}</p>
          </div>
          <div className="border-t-2 border-ember pt-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ember">
              Level
            </div>
            <p className="mt-1 text-lg font-bold">{program.level}</p>
          </div>
          <div className="border-t-2 border-ember pt-4">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ember">
              Category
            </div>
            <p className="mt-1 text-lg font-bold">{program.tag}</p>
          </div>
        </div>
      </Section>

      {/* SCHEDULE SLICE */}
      {schedule.length > 0 && (
        <Section eyebrow="This week" title="Class schedule">
          <div className="border border-black/10 bg-white">
            {schedule.map((entry, di) => (
              <div key={entry.day} className={di > 0 ? 'border-t border-black/10' : undefined}>
                <div className="bg-sand/60 px-6 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em]">{entry.day}</h3>
                </div>
                {entry.classes.map((c, ci) => (
                  <div
                    key={`${entry.day}-${ci}`}
                    className="grid grid-cols-[100px_1fr] items-baseline gap-4 border-t border-black/10 px-6 py-3 sm:grid-cols-[110px_1fr_auto]"
                  >
                    <div className="text-sm font-extrabold tracking-tight [font-variant-numeric:tabular-nums]">
                      {c.time.split('-')[0].trim()}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{c.program}</div>
                      {classDescriptions[c.program] && (
                        <p className="mt-0.5 text-xs text-black/55">
                          {classDescriptions[c.program]}
                        </p>
                      )}
                    </div>
                    <div className="hidden text-xs font-semibold text-black/55 sm:block">
                      {c.coach}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-black/55">
            <Link href="/schedule" className="font-bold text-ember hover:underline">
              View the full weekly schedule →
            </Link>
          </p>
        </Section>
      )}

      {/* CTA */}
      <CTABanner />
    </>
  );
}
