import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FaqAccordion } from '@/components/FaqAccordion';
import { faqGroups } from '@/content/faq';

describe('FaqAccordion', () => {
  it('opens the first FAQ item by default', () => {
    render(<FaqAccordion groups={faqGroups} />);

    expect(screen.getByRole('button', { name: /Do I need prior experience/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText(/Most new students begin/i)).toBeVisible();
  });

  it('toggles FAQ answers', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion groups={faqGroups} />);

    await user.click(screen.getByRole('button', { name: /Do I need prior experience/i }));
    expect(screen.queryByText(/Most new students begin/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /What should I bring/i }));
    expect(screen.getByText(/Wear comfortable athletic clothing/i)).toBeVisible();
  });

  it('updates the active topic link when a topic is selected', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion groups={faqGroups} />);

    const membership = screen.getByRole('link', { name: 'Membership' });
    await user.click(membership);

    expect(membership).toHaveClass('border-ember');
  });
});
