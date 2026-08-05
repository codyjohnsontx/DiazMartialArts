'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/Button';
import { getPublicEnv } from '@/lib/env';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>;

const { formspreeEndpoint: endpoint } = getPublicEnv();

const inputClasses =
  'w-full border border-white/18 bg-white/5 px-3.5 py-3 text-sm text-sand placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold';

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
    <form onSubmit={handleSubmit} className="grid gap-3" noValidate>
      <div>
        <label htmlFor="waitlist-name" className="sr-only">
          Full name
        </label>
        <input
          id="waitlist-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Full name"
          aria-invalid={Boolean(fieldErrors.name)}
          onChange={() => clearFieldError('name')}
          className={inputClasses}
        />
        {fieldErrors.name && <p className="mt-1 text-sm text-gold">{fieldErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="waitlist-email" className="sr-only">
          Email address
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          aria-invalid={Boolean(fieldErrors.email)}
          onChange={() => clearFieldError('email')}
          className={inputClasses}
        />
        {fieldErrors.email && <p className="mt-1 text-sm text-gold">{fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="waitlist-status" className="sr-only">
          Training status
        </label>
        <select id="waitlist-status" name="message" className={inputClasses} defaultValue="">
          <option value="" disabled>
            Choose one…
          </option>
          <option>I&apos;m a current Diaz Martial Arts member</option>
          <option>I train at another gym</option>
          <option>I&apos;m new to martial arts</option>
        </select>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={status === 'submitting'}
        className="justify-between"
      >
        {status === 'submitting' ? 'Joining…' : 'Join waitlist'}
        <span aria-hidden="true">→</span>
      </Button>

      {formError && (
        <p role="alert" className="text-sm text-gold">
          {formError}
        </p>
      )}
      {statusMessage && (
        <p role="status" className="text-sm font-semibold text-sand">
          {statusMessage}
        </p>
      )}
    </form>
  );
}
