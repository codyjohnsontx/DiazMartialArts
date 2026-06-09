'use client';

import { FormEvent, useState } from 'react';

import { Button } from '@/components/Button';
import { getPublicEnv } from '@/lib/env';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldName = 'firstName' | 'lastName' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

const { formspreeEndpoint: endpoint } = getPublicEnv();

const ageGroups = [
  'Adult (16+)',
  'Teen (13–15)',
  'Junior (7–13)',
  "Lil' Dragon (4–7)",
];

const interests = [
  'BJJ Gi/No-Gi',
  'Muay Thai',
  'Karate · TKD',
  'Self-Defense',
  'Kids Program',
  'Tactical',
  'Not sure yet',
];

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-bronze"
    >
      {children}
    </label>
  );
}

const inputClass =
  'w-full border border-black/18 bg-[#FAFAFA] px-3.5 py-3 text-sm text-ink placeholder:text-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ember';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set(['BJJ Gi/No-Gi']),
  );

  function toggleInterest(label: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function clearFieldError(field: FieldName) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validate(values: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
  }): FieldErrors {
    const errors: FieldErrors = {};
    if (!values.firstName) errors.firstName = 'Please enter your first name.';
    if (!values.lastName) errors.lastName = 'Please enter your last name.';
    if (!values.email) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (values.phone && !/^[0-9+()\-\s]{7,20}$/.test(values.phone)) {
      errors.phone = 'Please enter a valid phone number.';
    }
    if (values.message && values.message.length < 10) {
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

    const values = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    const errors = validate(values);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setStatus('error');
      setFormError('Please correct the highlighted fields and try again.');
      return;
    }

    formData.set('name', `${values.firstName} ${values.lastName}`);
    formData.set('interest', Array.from(selectedInterests).join(', '));

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
      setStatusMessage('Thanks. We received your message and will reply soon.');
      form.reset();
      setSelectedInterests(new Set(['BJJ Gi/No-Gi']));
    } catch {
      setStatus('error');
      setFormError('Network error. Please try again in a moment.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-white p-7 sm:p-9" noValidate>
      <h2 className="text-2xl font-extrabold tracking-tight">Free trial request</h2>
      <p className="mt-2 text-sm text-black/65">
        No card required. Athletic clothes are enough.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <input
            id="firstName"
            name="firstName"
            placeholder="Alex"
            required
            autoComplete="given-name"
            aria-invalid={Boolean(fieldErrors.firstName)}
            onChange={() => clearFieldError('firstName')}
            className={inputClass}
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-ember">{fieldErrors.firstName}</p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <input
            id="lastName"
            name="lastName"
            placeholder="Rivera"
            required
            autoComplete="family-name"
            aria-invalid={Boolean(fieldErrors.lastName)}
            onChange={() => clearFieldError('lastName')}
            className={inputClass}
          />
          {fieldErrors.lastName && (
            <p className="mt-1 text-sm text-ember">{fieldErrors.lastName}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@email.com"
            required
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            onChange={() => clearFieldError('email')}
            className={inputClass}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-ember">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(512) 000-0000"
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            onChange={() => clearFieldError('phone')}
            className={inputClass}
          />
          {fieldErrors.phone && (
            <p className="mt-1 text-sm text-ember">{fieldErrors.phone}</p>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="ageGroup">Age group</FieldLabel>
          <select id="ageGroup" name="ageGroup" className={inputClass} defaultValue={ageGroups[0]}>
            {ageGroups.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>Interest</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {interests.map((c) => {
              const active = selectedInterests.has(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleInterest(c)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-xs font-bold tracking-[0.04em] transition',
                    active
                      ? 'border border-ink bg-ink text-sand'
                      : 'border border-black/18 bg-transparent text-ink hover:border-black/40',
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="message">What are your goals?</FieldLabel>
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="A few sentences about why you're starting…"
            aria-invalid={Boolean(fieldErrors.message)}
            onChange={() => clearFieldError('message')}
            className={cn(inputClass, 'min-h-[100px] resize-y')}
          />
          {fieldErrors.message && (
            <p className="mt-1 text-sm text-ember">{fieldErrors.message}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-sm text-xs text-black/55">
          By submitting you agree to be contacted about your trial. We respect your inbox.
        </p>
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Submit request →'}
        </Button>
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-ember">
        {status === 'error' ? formError : ''}
      </p>
      <p aria-live="polite" className="text-sm text-black/70">
        {status === 'success' ? statusMessage : ''}
      </p>
    </form>
  );
}
