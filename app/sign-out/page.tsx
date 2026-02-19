'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

import { Section } from '@/components/Section';

export default function SignOutPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    void signOut({ redirectUrl: '/' });
  }, [signOut]);

  return (
    <Section title="Signing out" eyebrow="Account">
      <p className="text-sm text-black/70">You are being signed out.</p>
    </Section>
  );
}
