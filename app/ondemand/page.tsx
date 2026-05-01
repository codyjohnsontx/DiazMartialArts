import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { Card } from '@/components/Card';
import { OndemandWaitlistForm } from '@/components/OndemandWaitlistForm';
import { Section } from '@/components/Section';
import { getAppEnv, getPublicEnv } from '@/lib/env';
import { getEntitlements } from '@/lib/entitlements';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Diaz on Demand',
  description: 'Diaz on Demand is coming soon. Join the waitlist for launch updates.',
  path: '/ondemand',
});

export const dynamic = 'force-dynamic';

export default async function OndemandRoutePage() {
  const { ondemandComingSoon } = getAppEnv();

  if (ondemandComingSoon) {
    return (
      <Section
        title="Diaz on Demand is coming soon"
        titleAs="h1"
        eyebrow="Video Training"
        description="We are building the online training library now. Join the waitlist and we will let you know when access opens."
        className="text-center [&>header]:mx-auto [&>header]:text-center [&>header>p]:justify-center"
      >
        <div className="mx-auto grid max-w-4xl gap-6 text-left lg:grid-cols-[0.9fr_1.1fr]">
          <Card interactive={false}>
            <h2 className="text-xl font-bold text-ink">What is coming</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-black/75">
              <li>Structured video lessons for students training outside class.</li>
              <li>Progress tracking and guided curriculum paths.</li>
              <li>Member access options once the platform is ready.</li>
            </ul>
          </Card>
          <Card interactive={false}>
            <h2 className="text-xl font-bold text-ink">Join the waitlist</h2>
            <p className="mt-2 text-sm leading-relaxed text-black/70">
              Leave your details and we will follow up when Diaz on Demand is ready for students.
            </p>
            <div className="mt-5">
              <OndemandWaitlistForm />
            </div>
          </Card>
        </div>
      </Section>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/ondemand');
  }

  const entitlements = await getEntitlements(userId);
  const { ondemandUrl } = getPublicEnv();

  redirect(`${ondemandUrl}${entitlements.vod ? '/library' : '/subscribe'}`);
}
