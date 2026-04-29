import Image from 'next/image';

import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

const flyers = [
  {
    id: 'may-events-calendar',
    src: '/announcements/may-2026-events-calendar.jpg',
    alt: 'Diaz Martial Arts May events calendar',
  },
  {
    id: 'rifle-course',
    src: '/announcements/rifle-course-may-8-2026.jpg',
    alt: 'Diaz Martial Arts rifle course flyer',
  },
  {
    id: 'birthday-discount',
    src: '/announcements/facebook-birthday-ad.jpg',
    alt: 'Diaz Martial Arts birthday discount flyer',
  },
  {
    id: 'mom-and-me-class',
    src: '/announcements/mom-and-me-class.jpg',
    alt: 'Diaz Martial Arts Mom and Me class flyer',
  },
  {
    id: 'blue-stripe-testing',
    src: '/announcements/blue-stripe-testing.jpg',
    alt: 'Diaz Martial Arts blue stripe testing flyer',
  },
  {
    id: 'memorial-day-closure',
    src: '/announcements/memorial-day-2026.jpg',
    alt: 'Diaz Martial Arts Memorial Day closure flyer',
  },
];

export const metadata = pageMetadata({
  title: 'Announcements',
  description: 'Events calendar for Diaz Martial Arts in San Marcos, Texas.',
  path: '/announcements',
  keywords: [
    'martial arts events san marcos',
    'bjj tournament',
    'martial arts seminar texas',
  ],
});

export default function AnnouncementsPage() {
  return (
    <Section
      title="Announcements"
      titleAs="h1"
      eyebrow="Events Calendar"
      className="text-center [&>header]:mx-auto [&>header]:text-center [&>header>p]:justify-center"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {flyers.map((flyer) => (
          <div key={flyer.id}>
            <a
              href={`#${flyer.id}`}
              aria-label={`Enlarge ${flyer.alt}`}
              className="block cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_20px_70px_-45px_rgba(16,18,20,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-48px_rgba(16,18,20,0.55)]"
            >
              <Image
                src={flyer.src}
                alt={flyer.alt}
                width={1650}
                height={1275}
                loading="eager"
                className="h-auto w-full"
              />
            </a>

            <a
              id={flyer.id}
              href="#"
              aria-label={`Close enlarged ${flyer.alt}`}
              className="announcement-lightbox fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 opacity-0 pointer-events-none transition target:opacity-100 target:pointer-events-auto sm:p-8"
            >
              <span className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft sm:right-6 sm:top-6">
                Close
              </span>
              <Image
                src={flyer.src}
                alt={flyer.alt}
                width={1650}
                height={1275}
                loading="eager"
                className="max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
              />
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}
