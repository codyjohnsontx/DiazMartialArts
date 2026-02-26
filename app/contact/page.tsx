import Link from 'next/link';

import { Card } from '@/components/Card';
import { ContactForm } from '@/components/ContactForm';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { Section } from '@/components/Section';
import { site } from '@/content/site';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Contact',
  description: 'Book a free trial and contact Diaz Martial Arts in San Marcos, TX.',
  path: '/contact',
  keywords: ['book martial arts trial', 'diaz martial arts contact', 'san marcos martial arts gym'],
});

export default function ContactPage() {
  return (
    <>
      <LocalBusinessSchema />
      <Section
        title="Contact"
        titleAs="h1"
        eyebrow="Book a Free Trial"
        description="Tell us your goals and availability. Our team will help you choose the right class and get started."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card interactive={false}>
            <ContactForm />
          </Card>

          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-ink">Visit the academy</h2>
              <address className="mt-3 not-italic text-sm leading-relaxed text-black/75">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </address>
              <p className="mt-4 text-sm text-black/75">
                Phone: <a href={site.phoneHref}>{site.phone}</a>
                <br />
                Email: <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-bronze">
                Hours
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-black/75">
                {site.hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-ink">Already a member?</h2>
              <p className="mt-2 text-sm text-black/75">
                Manage your account and on-demand access from the member hub.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="text-sm font-semibold text-ember hover:text-[#941f15]"
                >
                  Go to My Account
                </Link>
                <Link href="/ondemand" className="text-sm font-semibold text-ink hover:text-ember">
                  Open Diaz on Demand
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
