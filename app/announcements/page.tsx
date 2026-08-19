import {
  AnnouncementFlyerGallery,
  type AnnouncementFlyer,
} from '@/components/AnnouncementFlyerGallery';
import { Eyebrow } from '@/components/Eyebrow';
import { pageMetadata } from '@/lib/seo';

// Every entry below is transcribed from the flyer image it points at: the
// price, what that price includes, and the ages or contact details the flyer
// prints. None of the three carries a start date or an expiry, so none is
// claimed here - `date` says so rather than guessing a run.
const flyers: AnnouncementFlyer[] = [
  {
    id: 'back-to-school-special',
    src: '/announcements/back-to-school-special.jpeg',
    alt: 'Back to School special: $60 to start a child at Diaz Martial Arts, including uniform and belt. Lil Dragons Karate for ages 4 to 6, Karate Kids for ages 7 to 11. The flyer prints no end date.',
    title: 'Back to School Special',
    tag: 'Kids',
    date: 'No end date listed',
    category: 'Promos',
    width: 1247,
    height: 1600,
  },
  {
    id: 'jiu-jitsu-special',
    src: '/announcements/jiu-jitsu-special.jpeg',
    alt: 'Jiu Jitsu special: $130 to get started at Diaz Martial Arts, including a jiu jitsu gi and two private lessons. Call 512-392-4763 to make an appointment. The flyer prints no end date.',
    title: 'Jiu Jitsu Special',
    tag: 'BJJ',
    date: 'No end date listed',
    category: 'Promos',
    width: 1024,
    height: 1536,
  },
  {
    id: 'muay-thai-special',
    src: '/announcements/muay-thai-special.jpeg',
    alt: 'Muay Thai special: $60 to get started at Diaz Martial Arts, including 16 ounce gloves and two private lessons. Call 512-392-4763 to make an appointment. The flyer prints no end date.',
    title: 'Muay Thai Special',
    tag: 'Muay Thai',
    date: 'No end date listed',
    category: 'Promos',
    width: 1024,
    height: 1536,
  },
];

export const metadata = pageMetadata({
  title: 'Announcements',
  description:
    'Current announcements and beginner specials for Diaz Martial Arts in San Marcos, Texas: back to school karate for kids, jiu jitsu, and Muay Thai.',
  path: '/announcements',
  keywords: [
    'martial arts specials san marcos',
    'kids karate back to school',
    'beginner jiu jitsu special',
    'beginner muay thai special',
  ],
});

export default function AnnouncementsPage() {
  return (
    <>
      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <Eyebrow>What&apos;s happening</Eyebrow>
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
