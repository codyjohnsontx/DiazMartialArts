import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders links when href is provided', () => {
    render(<Button href="/contact">Book Free Trial</Button>);

    const link = screen.getByRole('link', { name: 'Book Free Trial' });
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('gives the light variants a white focus ring for dark surfaces', () => {
    render(
      <>
        <Button href="/contact" variant="primary-light">
          Book Free Trial
        </Button>
        <Button href="/schedule" variant="outline-light">
          View Schedule
        </Button>
      </>,
    );

    const primary = screen.getByRole('link', { name: 'Book Free Trial' });
    expect(primary).toHaveClass('bg-ember', 'focus-visible:outline-white');
    expect(primary).not.toHaveClass('focus-visible:outline-ember');

    // 50% is the border opacity that clears 3:1 over the hero photo
    expect(screen.getByRole('link', { name: 'View Schedule' })).toHaveClass(
      'border-white/50',
      'focus-visible:outline-white',
    );
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
    expect(link).toHaveClass('cursor-not-allowed', 'opacity-70');
    expect(onClick).not.toHaveBeenCalled();
  });
});
