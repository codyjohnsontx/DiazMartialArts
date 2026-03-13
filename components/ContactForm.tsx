'use client';

import { FormEvent, useState } from 'react';

import { getPublicEnv } from '@/lib/env';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldName = 'name' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

const { formspreeEndpoint: endpoint } = getPublicEnv();

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  function clearFieldError(field: FieldName) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(name: string, email: string, phone: string, message: string): FieldErrors {
    const errors: FieldErrors = {};

    if (!name) errors.name = 'Please enter your name.';
    if (!email) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!message) {
      errors.message = 'Please enter a message.';
    } else if (message.length < 10) {
      errors.message = 'Please include at least 10 characters.';
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setStatusMessage('');

    if (!endpoint) {
      setStatus('error');
      setFormError('Add NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable form submissions.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const errors = validate(name, email, phone, message);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setFormError('Please correct the highlighted fields and try again.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        setStatus('error');
        setFormError('Your request could not be sent. Please try again.');
        return;
      }

      setStatus('success');
      setFieldErrors({});
      setStatusMessage('Thanks. We received your message and will reply soon.');
      form.reset();
    } catch {
      setStatus('error');
      setFormError('Network error. Please try again in a moment.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold text-ink">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? 'name-error' : undefined}
          onChange={() => clearFieldError('name')}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        />
        {fieldErrors.name && (
          <p id="name-error" className="mt-1 text-sm text-ember">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          onChange={() => clearFieldError('email')}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-ember">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-ink">
          Phone (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
          onChange={() => clearFieldError('phone')}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        />
        {fieldErrors.phone && (
          <p id="phone-error" className="mt-1 text-sm text-ember">
            {fieldErrors.phone}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'message-error' : undefined}
          onChange={() => clearFieldError('message')}
          className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        />
        {fieldErrors.message && (
          <p id="message-error" className="mt-1 text-sm text-ember">
            {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#941f15] disabled:cursor-not-allowed disabled:opacity-75"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>

      <p id="form-error" aria-live="polite" className="text-sm text-ember">
        {status === 'error' ? formError : ''}
      </p>
      <p aria-live="polite" className="text-sm text-black/70">
        {status === 'success' ? statusMessage : ''}
      </p>
    </form>
  );
}
