import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CTABanner } from '@/components/CTABanner';
import { site } from '@/content/site';

describe('CTABanner', () => {
  // Cody asked for the address sub-lines under this heading to go; the footer
  // already carries the full address on every page.
  it('renders the heading with no address or hours lines under it', () => {
    const { container } = render(<CTABanner />);

    expect(screen.getByRole('heading', { name: 'Classes 6 days a week.' })).toBeInTheDocument();
    expect(container).not.toHaveTextContent(site.address.street);
    expect(container).not.toHaveTextContent(`${site.address.city}, ${site.address.state}`);
    expect(container).not.toHaveTextContent(site.hours[0]);
  });
});
