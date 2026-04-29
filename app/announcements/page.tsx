import { AnnouncementFlyerGallery } from '@/components/AnnouncementFlyerGallery';
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
      <AnnouncementFlyerGallery flyers={flyers} />
    </Section>
  );
}
