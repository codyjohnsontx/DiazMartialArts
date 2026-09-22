import {
  AnnouncementFlyerGallery,
  type AnnouncementFlyer,
} from '@/components/AnnouncementFlyerGallery';
import { pageMetadata } from '@/lib/seo';

// Every entry below is transcribed from the flyer image it points at. The
// price, what it includes, the ages and the phone number go in the structured
// fields (`priceUsd`, `includes`, `ages`, `phone`), which the card renders as
// page text under the title; a field is left off when the flyer does not print
// it, never filled from elsewhere. `alt` describes the picture, since the offer
// no longer has to travel through it. Only the Cleber Luciano flyer prints a
// date; the three specials carry no start date or expiry, so none is claimed
// for them - `date` says so rather than guessing a run. A dated flyer retires
// once its day has passed, together with its entry in content/upcoming.ts.
const flyers: AnnouncementFlyer[] = [
  {
    id: 'cleber-luciano-2026-10-08',
    src: '/announcements/cleber-luciano-2026-10-08.jpg',
    alt: 'Black and white portrait of Master Cleber Luciano standing in a white gi, his name in tall capitals across the top.',
    title: 'Master Cleber Luciano',
    tag: '$125',
    date: 'Thursday, October 8, 2026 - 7-9 PM',
    category: 'Events',
    width: 1650,
    height: 1275,
    priceUsd: 125,
  },
  {
    id: 'back-to-school-special',
    src: '/announcements/back-to-school-special.jpeg',
    alt: 'Cartoon flyer on notebook paper: a green dragon and two children in white karate uniforms, a backpack, and Back to School in big blue and red letters.',
    title: 'Back to School Special',
    tag: 'Kids',
    date: 'No end date listed',
    category: 'Promos',
    width: 1247,
    height: 1600,
    priceUsd: 60,
    includes: ['uniform', 'belt'],
    ages: ['Lil Dragons Karate, ages 4-6', 'Karate Kids, ages 7-11'],
  },
  {
    id: 'jiu-jitsu-special',
    src: '/announcements/jiu-jitsu-special.jpeg',
    alt: 'Two students grappling on the mat in blue and white gis, with Jiu Jitsu Special in white and blue brush lettering.',
    title: 'Jiu Jitsu Special',
    tag: 'BJJ',
    date: 'No end date listed',
    category: 'Promos',
    width: 1024,
    height: 1536,
    priceUsd: 130,
    includes: ['a jiu jitsu gi', 'two private lessons'],
    phone: '512-392-4763',
  },
  {
    id: 'muay-thai-special',
    src: '/announcements/muay-thai-special.jpeg',
    alt: 'A fighter in black gloves and Muay Thai shorts throwing a punch at the camera, with Muay Thai Special in white and red brush lettering.',
    title: 'Muay Thai Special',
    tag: 'Muay Thai',
    date: 'No end date listed',
    category: 'Promos',
    width: 1024,
    height: 1536,
    priceUsd: 60,
    includes: ['16 oz gloves', 'two private lessons'],
    phone: '512-392-4763',
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
            {/*
              ANNOUNCEMENTS is one thirteen-character word with nowhere to
              break, and in Manrope 800 at the `.display` tracking it measures
              8.83px of width per pixel of font size: 424px at the 48px base
              step, 635px at the 72px `sm` step. Both are wider than the column
              they sit in on a phone, so this page scrolled sideways at every
              width from 300 to 439px and again from 640 to 658px.

              The soft hyphen is the fix, over a smaller type step or a shorter
              word, because it costs nothing until the word does not fit: every
              width that already fit is untouched, the heading keeps the same
              scale every other page's h1 gets, and no measured pixel constant
              is involved. A smaller step would need one, and it would be a
              large one - holding a single line at 320px takes a 30px h1, a
              third smaller than the 48px elsewhere - and it would only be the
              right number for this font on the platform it was read on.

              Neither CSS route works here. `overflow-wrap: break-word` clears
              the overflow but breaks mid-syllable with no hyphen drawn
              (ANNOUNCEME / NTS), and `hyphens: auto` does nothing at all in a
              browser carrying no hyphenation dictionary, which headless
              Chromium is - it left all 159 overflowing widths overflowing.
              `hyphens: manual` is the CSS default, so this one character needs
              no rule beside it and breaks the same way in every browser.

              U+00AD is invisible to the accessible name - Chromium computes
              this heading as "Announcements" - so the by-name heading
              assertions in tests/e2e/public-pages.spec.ts match unchanged.
              That spec owns the regression guard.
            */}
            <h1 className="display text-5xl sm:text-7xl lg:text-[80px]">Announce&shy;ments</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <AnnouncementFlyerGallery flyers={flyers} />
      </section>
    </>
  );
}
