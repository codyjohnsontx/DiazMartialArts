import { describe, expect, it } from 'vitest';

import { cn, formatDateTimeRange, formatList } from '@/lib/utils';

describe('cn', () => {
  it('joins truthy class names with a single space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('skips falsy entries', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns an empty string when all entries are falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});

describe('formatDateTimeRange', () => {
  it('formats a single start datetime when no end is given', () => {
    const start = new Date(2026, 4, 5, 18, 30);
    expect(formatDateTimeRange(start)).toBe('Tue, May 5 at 6:30 PM');
  });

  it('formats a start-end range with a separator', () => {
    const start = new Date(2026, 4, 5, 18, 0);
    const end = new Date(2026, 4, 5, 19, 30);
    expect(formatDateTimeRange(start, end)).toBe('Tue, May 5 · 6:00 PM-7:30 PM');
  });
});

describe('formatList', () => {
  it('writes one, two and three items the way a sentence lists them', () => {
    expect(formatList(['a gi'])).toBe('a gi');
    expect(formatList(['a gi', 'two private lessons'])).toBe('a gi and two private lessons');
    expect(formatList(['gloves', 'a gi', 'two lessons'])).toBe('gloves, a gi, and two lessons');
  });

  it('writes nothing for no items', () => {
    expect(formatList([])).toBe('');
  });
});
