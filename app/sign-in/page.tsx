import { SignIn } from '@clerk/nextjs';

import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Member Login',
  description: 'Sign in to your Diaz Martial Arts member account.',
  path: '/sign-in',
});

export default function SignInPage() {
  return (
    <Section title="Member Login" eyebrow="Account Access" description="Sign in to manage your memberships and access Diaz on Demand.">
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" forceRedirectUrl="/account" />
      </div>
    </Section>
  );
}
