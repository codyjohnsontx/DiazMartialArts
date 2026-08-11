import { describe, expect, it } from 'vitest';

import { classDescriptions, weeklySchedule, type WeeklySchedule } from '@/content/schedule';
import { parseClassTimeRange } from '@/lib/classSchedule';

const IPTT = 'I.P.T.T. Handgun (Adult Only)';
const HAGANAH = 'Teen/Adult Haganah (Israeli Self Defense)';

function classesFor(day: WeeklySchedule['day']) {
  const match = weeklySchedule.find((entry) => entry.day === day);
  if (!match) throw new Error(`Missing ${day} in weeklySchedule`);
  return match.classes;
}

function slotsFor(program: string) {
  return weeklySchedule.flatMap((entry) =>
    entry.classes
      .filter((block) => block.program === program)
      .map((block) => `${entry.day} ${block.time}`),
  );
}

describe('weekly schedule matches the 2026 adult class flyer', () => {
  it('runs I.P.T.T. handgun at noon on Tuesday and Thursday plus Friday and Saturday', () => {
    expect(slotsFor(IPTT)).toEqual([
      'Tuesday 12:00-1:00 PM',
      'Thursday 12:00-1:00 PM',
      'Friday 7:00-7:50 PM',
      'Saturday 9:00-9:50 AM',
    ]);
  });

  it('runs Haganah only in the 7:00-8:00 PM slot, Monday through Thursday', () => {
    expect(slotsFor(HAGANAH)).toEqual([
      'Monday 7:00-8:00 PM',
      'Tuesday 7:00-8:00 PM',
      'Wednesday 7:00-8:00 PM',
      'Thursday 7:00-8:00 PM',
    ]);
  });

  it('keeps every day in chronological order', () => {
    for (const entry of weeklySchedule) {
      const starts = entry.classes.map((block) => parseClassTimeRange(block.time)?.startMinutes);
      expect(starts, `${entry.day} has an unparsable time`).not.toContain(undefined);
      expect(starts, `${entry.day} is out of order`).toEqual([...starts].sort((a, b) => a! - b!));
    }
  });

  it('describes every program it schedules, including the new noon I.P.T.T. sessions', () => {
    const scheduled = new Set(
      weeklySchedule.flatMap((entry) => entry.classes.map((block) => block.program)),
    );
    const missing = [...scheduled].filter((program) => !classDescriptions[program]);

    expect(missing).toEqual([]);
    expect(classesFor('Tuesday').some((block) => block.program === IPTT)).toBe(true);
    expect(classDescriptions[IPTT]).toMatch(/tactical handgun/i);
  });
});
