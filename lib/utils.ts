import { getPublicEnv } from '@/lib/env';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function toAbsoluteUrl(path: string): string {
  return new URL(path, getPublicEnv().siteUrl).toString();
}

/** A US-dollar amount as a reader writes it: `$125`, or `$12.50` when it has cents. */
export function formatPriceUsd(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDateTimeRange(start: Date, end?: Date): string {
  const dateFmt = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeFmt = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (!end) {
    return `${dateFmt.format(start)} at ${timeFmt.format(start)}`;
  }

  return `${dateFmt.format(start)} · ${timeFmt.format(start)}-${timeFmt.format(end)}`;
}
