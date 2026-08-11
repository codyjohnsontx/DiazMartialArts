import {
  AnnouncementFlyerGallery,
  type AnnouncementFlyer,
} from '@/components/AnnouncementFlyerGallery';
import { Eyebrow } from '@/components/Eyebrow';
import { pageMetadata } from '@/lib/seo';

const flyers: AnnouncementFlyer[] = [
  {
    id: 'june-events-calendar',
    src: '/announcements/june-2026-events-calendar.jpg',
    alt: 'Diaz Martial Arts June 2026 events calendar',
    title: 'June Events Calendar',
    tag: 'Calendar',
    date: 'June 2026',
    category: 'Events',
    width: 1096,
    height: 851,
  },
  {
    id: 'rifle-club',
    src: '/announcements/rifle-club-june-5-2026.png',
    alt: 'Rifle Club at Diaz Martial Arts on Friday June 5',
    title: 'Rifle Club',
    tag: 'I.P.T.T.',
    date: 'June 5, 2026',
    category: 'Events',
    width: 1098,
    height: 847,
  },
  {
    id: 'cleber-luciano-seminar',
    src: '/announcements/master-cleber-luciano-seminar-june-16-2026.jpg',
    alt: 'Master Cleber Luciano seminar at Diaz Martial Arts on June 16, 2026',
    title: 'Master Cleber Luciano Seminar',
    tag: 'Seminar',
    date: 'June 16, 2026',
    category: 'Events',
    width: 998,
    height: 750,
  },
  {
    id: 'punch-and-lunch-with-dad',
    src: '/announcements/punch-and-lunch-with-dad-june-21-2026.jpg',
    alt: 'Punch and Lunch with Dad at Diaz Martial Arts on June 21, 2026',
    title: 'Punch and Lunch with Dad',
    tag: 'Family',
    date: 'June 21, 2026',
    category: 'Events',
    width: 1198,
    height: 848,
  },
  {
    id: 'fathers-day',
    src: '/announcements/fathers-day-2026.jpg',
    alt: "Happy Father's Day from Diaz Martial Arts",
    title: "Father's Day",
    tag: 'Holiday',
    date: 'June 21, 2026',
    category: 'Events',
    width: 998,
    height: 746,
  },
  {
    id: 'june-birthday-discount',
    src: '/announcements/june-birthday-discount.jpg',
    alt: 'June birthday discount from Diaz Martial Arts',
    title: 'June Birthday Discount',
    tag: 'Promo',
    date: 'June 2026',
    category: 'Promos',
    width: 1099,
    height: 848,
  },
  {
    id: 'gold-stripe-performance',
    src: '/announcements/gold-stripe-performance-june-24-25-2026.jpg',
    alt: 'Gold Stripe Performance at Diaz Martial Arts on June 24 and 25',
    title: 'Gold Stripe Performance',
    tag: 'Testing',
    date: 'June 24-25, 2026',
    category: 'Testings',
    width: 901,
    height: 647,
  },
  {
    id: 'womens-bjj-class',
    src: '/announcements/womens-bjj-class-june-2026.jpg',
    alt: "All women's Brazilian Jiu-Jitsu class at Diaz Martial Arts in June 2026",
    title: "Women's BJJ Class",
    tag: 'BJJ',
    date: 'June 2026',
    category: 'Events',
    width: 1097,
    height: 847,
  },
  {
    id: 'july-events-calendar',
    src: '/announcements/july-2026-events-calendar.jpg',
    alt: 'Diaz Martial Arts July 2026 events calendar',
    title: 'July Events Calendar',
    tag: 'Calendar',
    date: 'July 2026',
    category: 'Events',
    width: 1994,
    height: 1542,
  },
  {
    id: 'july-birthday-discount',
    src: '/announcements/july-birthday-discount.jpg',
    alt: 'July birthday discount for Diaz Martial Arts students',
    title: 'July Birthday Discount',
    tag: 'Promo',
    date: 'July 2026',
    category: 'Promos',
    width: 1652,
    height: 1306,
  },
  {
    id: 'july-4-closure',
    src: '/announcements/july-4-2026-closure.jpg',
    alt: 'Diaz Martial Arts closed Saturday July 4, 2026',
    title: 'July 4 Closure',
    tag: 'Closed',
    date: 'July 4, 2026',
    category: 'Closures',
    width: 1820,
    height: 1352,
  },
  {
    id: 'fite-nite-bjj',
    src: '/announcements/fite-nite-bjj-july-31-2026.jpg',
    alt: 'Fite Nite BJJ at Diaz Martial Arts on Friday July 31',
    title: 'Fite Nite BJJ',
    tag: 'BJJ',
    date: 'July 31, 2026',
    category: 'Events',
    width: 1814,
    height: 1366,
  },
  {
    id: 'black-stripe-focus',
    src: '/announcements/black-stripe-focus-july-29-30-2026.jpg',
    alt: 'Black Stripe Focus at Diaz Martial Arts on July 29 and 30',
    title: 'Black Stripe Focus',
    tag: 'Testing',
    date: 'July 29-30, 2026',
    category: 'Testings',
    width: 1620,
    height: 1190,
  },
];

export const metadata = pageMetadata({
  title: 'Announcements',
  description:
    'June and July 2026 announcements, events, closures, promotions, schedules, and class updates for Diaz Martial Arts in San Marcos, Texas.',
  path: '/announcements',
  keywords: ['martial arts events san marcos', 'bjj tournament', 'martial arts seminar texas'],
});

export default function AnnouncementsPage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <Eyebrow>Events calendar</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[80px]">Announcements</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <AnnouncementFlyerGallery flyers={flyers} />
      </section>
    </>
  );
}
