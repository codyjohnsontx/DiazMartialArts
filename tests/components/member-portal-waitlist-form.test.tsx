import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function renderMemberPortalWaitlistForm(endpoint?: string) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
  if (endpoint) {
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT = endpoint;
  } else {
    delete process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  }
  const { MemberPortalWaitlistForm } = await import('@/components/MemberPortalWaitlistForm');
  render(<MemberPortalWaitlistForm />);
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
});

describe('MemberPortalWaitlistForm', () => {
  it('shows a setup error when Formspree is not configured', async () => {
    const user = userEvent.setup();
    await renderMemberPortalWaitlistForm();

    await user.click(screen.getByRole('button', { name: /Join the waitlist/i }));

    expect(
      screen.getByText(/Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable member portal waitlist submissions/i),
    ).toBeVisible();
  });

  it('validates required fields before submitting', async () => {
    const user = userEvent.setup();
    await renderMemberPortalWaitlistForm('https://formspree.io/f/test');

    await user.type(screen.getByLabelText('Email address'), 'bad-email');
    await user.click(screen.getByRole('button', { name: /Join the waitlist/i }));

    expect(screen.getByText('Please enter your name.')).toBeVisible();
    expect(screen.getByText('Please enter a valid email address.')).toBeVisible();
  });

  it('submits valid member portal waitlist requests', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await renderMemberPortalWaitlistForm('https://formspree.io/f/test');

    await user.type(screen.getByLabelText('Full name'), 'Alex Rivera');
    await user.type(screen.getByLabelText('Email address'), 'alex@example.com');
    await user.selectOptions(
      screen.getByLabelText('Membership status'),
      "I'm a current Diaz Martial Arts member",
    );
    await user.click(screen.getByRole('button', { name: /Join the waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thanks. You are on the member portal waitlist/i)).toBeVisible();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://formspree.io/f/test',
      expect.objectContaining({ method: 'POST', headers: { Accept: 'application/json' } }),
    );
  });
});

