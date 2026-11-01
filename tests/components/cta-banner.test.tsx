import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CTABanner } from '@/components/CTABanner';
import { site } from '@/content/site';

describe('CTABanner', () => {
  // The address and hours are facts a visitor needs, so they stay under the
  // heading even though the site's decorative sub-lines were removed.
  it('renders the heading with the address and hours under it', () => {
    const { container } = render(<CTABanner />);

    expect(screen.getByRole('heading', { name: 'Classes 6 days a week.' })).toBeInTheDocument();
    expect(container).toHaveTextContent(site.address.street);
    expect(container).toHaveTextContent(`${site.address.city}, ${site.address.state}`);
    expect(container).toHaveTextContent(site.hours[0]);
  });
});
