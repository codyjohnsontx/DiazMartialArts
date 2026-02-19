import { SignUp } from '@clerk/nextjs';

import { Section } from '@/components/Section';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Create Account',
  description: 'Create your Diaz Martial Arts member account.',
  path: '/sign-up',
});

export default function SignUpPage() {
  return (
    <Section title="Create Account" eyebrow="Join" description="Create an account to manage your membership and Diaz on Demand access.">
      <div className="mx-auto max-w-md rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-6">
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" forceRedirectUrl="/account" />
      </div>
    </Section>
  );
}
