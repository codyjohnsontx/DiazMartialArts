import { Button } from '@/components/Button';
import { ContactForm } from '@/components/ContactForm';
import { Eyebrow } from '@/components/Eyebrow';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { site } from '@/content/site';
import { getPublicEnv } from '@/lib/env';
import { pageMetadata } from '@/lib/seo';

const { ondemandUrl } = getPublicEnv();

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Book a free trial and contact Diaz Martial Arts in San Marcos, TX.',
  path: '/contact',
  keywords: [
    'book martial arts trial',
    'diaz martial arts contact',
    'san marcos martial arts gym',
  ],
});

export default function ContactPage() {
  return (
    <>
      <LocalBusinessSchema />

      {/* HERO */}
      <section className="border-b border-black/10">
        <div className="mx-auto grid w-full max-w-6xl items-end gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <Eyebrow>Book a free trial</Eyebrow>
            <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-[88px]">
              Visit the gym
            </h1>
          </div>
          <p className="text-base leading-relaxed text-black/75 sm:text-lg">
            Tell us your goals and availability. We&apos;ll help you choose the right
            class and get you started, usually within 24 hours.
          </p>
        </div>
      </section>

      {/* FORM + SIDEBAR */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <ContactForm />

          <div className="flex flex-col gap-4">
            <div className="border border-black/10 bg-white p-7">
              <Eyebrow>Visit us</Eyebrow>
              <p className="mt-3.5 text-base leading-relaxed">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </p>
              <div className="mt-4 grid gap-1">
                {site.hours.map((h) => (
                  <div
                    key={h}
                    className="text-[13px] text-black/72 [font-variant-numeric:tabular-nums]"
                  >
                    {h}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-1.5 border-t border-black/10 pt-5">
                <a
                  href={site.phoneHref}
                  className="text-sm font-bold text-ink hover:text-ember"
                >
                  📞 {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm font-bold text-ink hover:text-ember"
                >
                  ✉ {site.email}
                </a>
              </div>
            </div>

            <div className="bg-ink p-7 text-sand">
              <Eyebrow variant="light">Already a member?</Eyebrow>
              <p className="my-3 text-sm leading-relaxed text-white/72">
                Member accounts and video access live in Diaz on Demand. Head there for
                access or launch updates.
              </p>
              <div className="flex flex-wrap gap-2">
                {ondemandUrl && (
                  <Button href={ondemandUrl} variant="ghost-light">
                    Member Login
                  </Button>
                )}
                <Button href="/ondemand" variant="ghost-light">
                  On Demand
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
