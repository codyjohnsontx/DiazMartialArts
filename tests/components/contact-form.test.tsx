import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function renderContactForm(endpoint?: string) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://diaz.example';
  if (endpoint) {
    process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT = endpoint;
  } else {
    delete process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  }
  const { ContactForm } = await import('@/components/ContactForm');
  render(<ContactForm />);
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
});

describe('ContactForm', () => {
  it('shows a setup error when Formspree is not configured', async () => {
    const user = userEvent.setup();
    await renderContactForm();

    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(
      screen.getByText(/Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable form submissions/i),
    ).toBeVisible();
  });

  it('validates required and malformed fields before submitting', async () => {
    const user = userEvent.setup();
    await renderContactForm('https://formspree.io/f/test');

    await user.type(screen.getByLabelText('First name'), 'Alex');
    await user.type(screen.getByLabelText('Last name'), 'Rivera');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Phone'), 'abc');
    await user.type(screen.getByLabelText(/What are your goals/i), 'short');
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(screen.getByText('Please enter a valid email address.')).toBeVisible();
    expect(screen.getByText('Please enter a valid phone number.')).toBeVisible();
    expect(screen.getByText('Please include at least 10 characters.')).toBeVisible();
  });

  it('submits valid requests and resets the form', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    await renderContactForm('https://formspree.io/f/test');

    await user.type(screen.getByLabelText('First name'), 'Alex');
    await user.type(screen.getByLabelText('Last name'), 'Rivera');
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Phone'), '(512) 555-1212');
    await user.type(
      screen.getByLabelText(/What are your goals/i),
      'I want to build confidence and learn fundamentals.',
    );
    await user.click(screen.getByRole('button', { name: /Self-Defense/i }));
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Thanks. We received your message/i)).toBeVisible();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://formspree.io/f/test',
      expect.objectContaining({ method: 'POST', headers: { Accept: 'application/json' } }),
    );
    expect(screen.getByLabelText('First name')).toHaveValue('');
    expect(screen.getByRole('button', { name: /BJJ Gi\/No-Gi/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

