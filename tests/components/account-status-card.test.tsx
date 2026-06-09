import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AccountStatusCard } from '@/components/AccountStatusCard';

describe('AccountStatusCard', () => {
  it('shows inactive VOD status with an ondemand link', () => {
    render(<AccountStatusCard vodActive={false} />);

    expect(screen.getByText('Status: Not Active')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open Diaz on Demand' })).toHaveAttribute(
      'href',
      '/ondemand',
    );
  });

  it('shows active VOD status copy', () => {
    render(<AccountStatusCard vodActive />);

    expect(screen.getByText('Status: Active')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to Diaz on Demand' })).toHaveAttribute(
      'href',
      '/ondemand',
    );
  });
});
