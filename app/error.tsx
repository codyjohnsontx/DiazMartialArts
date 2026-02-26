'use client';

import { useEffect } from 'react';

import { Button } from '@/components/Button';
import { Section } from '@/components/Section';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section eyebrow="Error" title="Something went wrong">
      <p className="mb-6 text-base leading-relaxed text-black/70">
        An unexpected error occurred. You can try again or return to the home page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button href="/" variant="secondary">
          Go Home
        </Button>
      </div>
    </Section>
  );
}
