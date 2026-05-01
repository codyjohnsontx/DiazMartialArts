'use client';

import { FormEvent, useState } from 'react';

import { getPublicEnv } from '@/lib/env';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

const { formspreeEndpoint: endpoint } = getPublicEnv();
const inputClasses =
  'w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember';

export function OndemandWaitlistForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (!endpoint) {
      setStatus('error');
      setFormError('Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable waitlist submissions.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const errors: FieldErrors = {};

    if (!name) errors.name = 'Please enter your name.';
    if (!email) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (message && message.length < 10) {
      errors.message = 'Please include at least 10 characters or leave this blank.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setFormError('Please correct the highlighted fields and try again.');
      return;
    }

    formData.set('_subject', 'Diaz on Demand waitlist');
    formData.set('source', 'Diaz on Demand coming soon page');

    setStatus('submitting');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (!response.ok) {
        setStatus('error');
        setFormError('Your request could not be sent. Please try again.');
        return;
      }

      setStatus('success');
      setFieldErrors({});
      setStatusMessage('Thanks. You are on the Diaz on Demand waitlist.');
      form.reset();
    } catch {
      setStatus('error');
      setFormError('Network error. Please try again in a moment.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="waitlist-name" className="mb-1 block text-sm font-semibold text-ink">
          Name
        </label>
        <input
          id="waitlist-name"
          name="name"
          required
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'waitlist-name-error' : undefined}
          onChange={() => clearFieldError('name')}
          className={inputClasses}
        />
        {fieldErrors.name && (
          <p id="waitlist-name-error" className="mt-1 text-sm text-ember">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="waitlist-email" className="mb-1 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'waitlist-email-error' : undefined}
          onChange={() => clearFieldError('email')}
          className={inputClasses}
        />
        {fieldErrors.email && (
          <p id="waitlist-email-error" className="mt-1 text-sm text-ember">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="waitlist-phone" className="mb-1 block text-sm font-semibold text-ink">
          Phone (optional)
        </label>
        <input
          id="waitlist-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="waitlist-message" className="mb-1 block text-sm font-semibold text-ink">
          Message (optional)
        </label>
        <textarea
          id="waitlist-message"
          name="message"
          rows={4}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'waitlist-message-error' : undefined}
          onChange={() => clearFieldError('message')}
          className={inputClasses}
        />
        {fieldErrors.message && (
          <p id="waitlist-message-error" className="mt-1 text-sm text-ember">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-[#941f15] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'submitting' ? 'Joining...' : 'Join the waitlist'}
      </button>

      {formError && (
        <p role="alert" className="text-sm text-ember">
          {formError}
        </p>
      )}
      {statusMessage && (
        <p role="status" className="text-sm font-semibold text-ink">
          {statusMessage}
        </p>
      )}
    </form>
  );
}
