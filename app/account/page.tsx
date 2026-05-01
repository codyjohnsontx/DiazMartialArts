import { auth, currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { AccountStatusCard } from '@/components/AccountStatusCard';
import { Card } from '@/components/Card';
import { Section } from '@/components/Section';
import { getEntitlements } from '@/lib/entitlements';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'My Account',
  description: 'Manage your Diaz Martial Arts member account and Diaz on Demand access.',
  path: '/account',
  noIndex: true,
});

const accountNav = [
  { label: 'Profile', href: '/account' },
  { label: 'Membership', href: '/account#membership' },
  { label: 'Settings', href: '/account#settings' },
];

export default async function AccountPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account');
  }

  const [user, entitlements] = await Promise.all([currentUser(), getEntitlements(userId)]);

  const memberName = user?.fullName || user?.firstName || 'Member';
  const memberEmail = user?.primaryEmailAddress?.emailAddress || 'No email on file';

  return (
    <Section
      title="My Account"
      titleAs="h1"
      eyebrow="Member Hub"
      description="Manage your profile and memberships. Diaz on Demand access is managed as a separate entitlement."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-ink">Account Navigation</h2>
            <nav className="mt-3 flex flex-wrap gap-2" aria-label="Account">
              {accountNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-black/15 px-3 py-1.5 text-sm text-black/70 hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-ink">Profile</h2>
            <p className="mt-2 text-sm text-black/75">Name: {memberName}</p>
            <p className="mt-1 text-sm text-black/75">Email: {memberEmail}</p>
          </Card>

          <Card id="membership">
            <h2 className="text-lg font-bold text-ink">Membership</h2>
            <div className="mt-3 space-y-3 text-sm text-black/75">
              <p>Gym Membership: {entitlements.gymMember ? 'Active' : 'Inactive'}</p>
              <p>Diaz on Demand: {entitlements.vod ? 'Active' : 'Inactive'}</p>
            </div>
          </Card>

          <Card id="settings">
            <h2 className="text-lg font-bold text-ink">Settings</h2>
            <Link
              href="/sign-out"
              className="mt-2 inline-block text-sm text-black/70 hover:text-ink"
            >
              Sign out
            </Link>
          </Card>
        </div>

        <div>
          <AccountStatusCard vodActive={entitlements.vod} />
        </div>
      </div>
    </Section>
  );
}
