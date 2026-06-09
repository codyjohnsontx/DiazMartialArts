import { describe, expect, it } from 'vitest';

import {
  formatCountdown,
  getScheduleLabel,
  getUpcomingClassBlocks,
  parseClassTimeRange,
} from '@/lib/classSchedule';

describe('parseClassTimeRange', () => {
  it('parses ranges where the start period is inferred from the end period', () => {
    expect(parseClassTimeRange('7:00-8:00 AM')).toEqual({
      startMinutes: 420,
      endMinutes: 480,
    });
    expect(parseClassTimeRange('5:00-5:45 PM')).toEqual({
      startMinutes: 1020,
      endMinutes: 1065,
    });
  });

  it('handles noon ranges without shifting the start into PM incorrectly', () => {
    expect(parseClassTimeRange('11:00-12:00 PM')).toEqual({
      startMinutes: 660,
      endMinutes: 720,
    });
    expect(parseClassTimeRange('11:00-1:00 PM')).toEqual({
      startMinutes: 660,
      endMinutes: 780,
    });
    expect(parseClassTimeRange('12:00-1:00 PM')).toEqual({
      startMinutes: 720,
      endMinutes: 780,
    });
  });
});

describe('getUpcomingClassBlocks', () => {
  it('finds Tuesday evening classes and groups simultaneous starts', () => {
    const now = new Date(2026, 4, 26, 15, 32);

    const blocks = getUpcomingClassBlocks(now, { limit: 4 });

    expect(blocks[0]).toMatchObject({
      day: 'Tuesday',
      dayOffset: 0,
      startLabel: '5:00 PM',
      durationLabel: '55m',
    });
    expect(blocks[0].classes.map((classBlock) => classBlock.program)).toEqual([
      'Advanced Juniors Weapons (Ages 7-13)',
      'Teen/Adult TKD Korean Karate - Weapons',
      'Junior Black Belts Weapons (Ages 10-13)',
    ]);
    expect(blocks.slice(1).map((block) => block.startLabel)).toEqual([
      '6:00 PM',
      '6:25 PM',
      '7:00 PM',
    ]);
  });

  it('falls forward after the final class of the day', () => {
    const now = new Date(2026, 4, 26, 21, 30);

    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({
      day: 'Wednesday',
      dayOffset: 1,
      startLabel: '7:00 AM',
    });
  });

  it('skips closed days', () => {
    const now = new Date(2026, 4, 30, 13, 30);

    const [next] = getUpcomingClassBlocks(now);

    expect(next).toMatchObject({
      day: 'Monday',
      dayOffset: 2,
      startLabel: '7:00 AM',
    });
  });
});

describe('schedule labels and countdowns', () => {
  it('formats countdowns and day labels', () => {
    const now = new Date(2026, 4, 26, 15, 32);
    const [next] = getUpcomingClassBlocks(now);

    expect(getScheduleLabel(next)).toBe('Tonight');
    expect(formatCountdown(next.start, now)).toBe('Starts in 1h 28m');
    expect(formatCountdown(now, now)).toBe('Starting now');
  });
});
