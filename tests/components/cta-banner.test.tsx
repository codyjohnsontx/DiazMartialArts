import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CTABanner } from '@/components/CTABanner';
import { site } from '@/content/site';

describe('CTABanner', () => {
  // The banner is a dark gradient card on the light program pages, so both of
  // its buttons must use the dark-surface variants. With the defaults, the
  // primary's ember focus ring measured about 2.79:1 against the card and the
  // ghost's ink text and black/20 border were invisible on the ink gradient.
  it('uses the dark-surface button variants on its ink gradient', () => {
    render(<CTABanner />);

    const schedule = screen.getByRole('link', { name: site.ctas.secondary.label });
    expect(schedule).toHaveAttribute('href', site.ctas.secondary.href);
    expect(schedule).toHaveClass('bg-ember', 'focus-visible:outline-white');
    expect(schedule).not.toHaveClass('focus-visible:outline-ember');

    const coaches = screen.getByRole('link', { name: site.ctas.coaches.label });
    expect(coaches).toHaveAttribute('href', site.ctas.coaches.href);
    expect(coaches).toHaveClass('border-white/35', 'text-sand', 'focus-visible:outline-white');
    expect(coaches).not.toHaveClass('text-ink', 'border-black/20');
  });
});
