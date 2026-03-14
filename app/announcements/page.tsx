import Image from 'next/image';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { cn } from '@/lib/utils';
import { pageMetadata } from '@/lib/seo';
import { getAnnouncements } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: 'Announcements',
  description:
    'Upcoming events, tournaments, and seminars at Diaz Martial Arts in San Marcos, Texas.',
  path: '/announcements',
  keywords: [
    'martial arts events san marcos',
    'bjj tournament',
    'martial arts seminar texas',
  ],
});

function formatDate(iso: string) {
  // Date-only strings (YYYY-MM-DD) parse as UTC midnight, which shifts the
  // displayed day in US timezones. Construct using local components instead.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly
    ? (() => { const [y, m, day] = iso.split('-').map(Number); return new Date(y, m - 1, day); })()
    : new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const buttonClasses =
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 bg-ink text-white hover:bg-black focus-visible:outline-ink shadow-soft';

export default async function AnnouncementsPage() {
  let announcements: Awaited<ReturnType<typeof getAnnouncements>> = [];
  let fetchError = false;
  try {
    announcements = await getAnnouncements();
  } catch (err) {
    console.error('[AnnouncementsPage] Failed to fetch announcements:', err);
    fetchError = true;
  }

  return (
    <Section
      title="Announcements"
      titleAs="h1"
      eyebrow="Events & Flyers"
      description="Upcoming tournaments, seminars, and promotions at Diaz Martial Arts."
    >
      {fetchError ? (
        <Card>
          <p className="text-sm text-black/70">
            Unable to load announcements right now. Please check back soon.
          </p>
        </Card>
      ) : announcements.length === 0 ? (
        <Card>
          <p className="text-sm text-black/70">Check back soon for upcoming event flyers.</p>
        </Card>
      ) : (
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          {announcements.map((item) => (
            <Card key={item._id} className="flex flex-col gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-bronze">
                {formatDate(item.eventDate)}
              </p>
              <h2 className="text-xl font-bold text-ink">{item.title}</h2>
              {item.description && (
                <p className="text-sm text-black/75">{item.description}</p>
              )}
              {item.previewImageUrl ? (
                <Image
                  src={item.previewImageUrl}
                  alt={item.title}
                  width={800}
                  height={600}
                  className="w-full rounded-lg"
                  style={{ height: 'auto' }}
                />
              ) : item.pdfUrl ? (
                <div className="aspect-[17/22] w-full overflow-hidden rounded-lg">
                  <iframe
                    src={`${item.pdfUrl}#toolbar=0&navpanes=0`}
                    title={item.title}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>
              ) : null}
              {item.pdfUrl && (
                <a
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonClasses, 'self-start')}
                >
                  View / Download Flyer
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
