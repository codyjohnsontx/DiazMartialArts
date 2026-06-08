import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AccountStatusCard } from '@/components/AccountStatusCard';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders links when href is provided', () => {
    render(<Button href="/contact">Book Free Trial</Button>);

    const link = screen.getByRole('link', { name: 'Book Free Trial' });
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('renders a disabled button and suppresses clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders disabled links as non-focusable and suppresses clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button href="/contact" onClick={onClick} disabled>
        Book Free Trial
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Book Free Trial' });
    await user.click(link);

    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
    expect(onClick).not.toHaveBeenCalled();
  });
});

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
