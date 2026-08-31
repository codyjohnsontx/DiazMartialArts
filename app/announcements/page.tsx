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
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[80px]">Announce&shy;ments</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <AnnouncementFlyerGallery flyers={flyers} />
      </section>
    </>
  );
}
