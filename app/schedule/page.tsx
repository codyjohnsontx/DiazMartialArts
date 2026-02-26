import Link from 'next/link';

import { MonthlyCalendarEmbed } from '@/components/MonthlyCalendarEmbed';
import { Section } from '@/components/Section';
import { UpcomingEvents } from '@/components/UpcomingEvents';
import { WeeklyScheduleTable } from '@/components/WeeklyScheduleTable';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Schedule',
  description:
    'View the weekly class schedule, monthly Google Calendar, and upcoming events for the next 60 days.',
  path: '/schedule',
  keywords: [
    'martial arts schedule',
    'bjj class schedule',
    'muay thai schedule',
    'san marcos martial arts',
  ],
});

export default function SchedulePage() {
  return (
    <Section
      title="Schedule"
      titleAs="h1"
      eyebrow="Train Smart"
      description="Use the weekly class lineup for your routine, then check monthly calendar updates and upcoming events."
    >
      <div className="mb-8 rounded-2xl border border-black/10 bg-white/80 p-4 text-sm text-black/70 sm:p-5">
        Looking for digital training access? Visit{' '}
        <Link href="/ondemand" className="font-semibold text-ember hover:text-[#941f15]">
          Diaz on Demand
        </Link>{' '}
        from your member account.
      </div>

      <div className="space-y-10">
        <section aria-labelledby="weekly-heading">
          <h2 id="weekly-heading" className="mb-4 text-2xl font-bold text-ink">
            Weekly Class Schedule
          </h2>
          <WeeklyScheduleTable />
        </section>

        <section aria-labelledby="monthly-heading">
          <h2 id="monthly-heading" className="mb-4 text-2xl font-bold text-ink">
            Monthly Calendar
          </h2>
          <MonthlyCalendarEmbed />
        </section>

        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="sr-only">
            Upcoming Events
          </h2>
          <UpcomingEvents />
        </section>
      </div>
    </Section>
  );
}
