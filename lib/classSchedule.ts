import { type ClassBlock, type WeeklySchedule, weeklySchedule } from '@/content/schedule';

export type UpcomingClassBlock = {
  day: WeeklySchedule['day'];
  dayOffset: number;
  start: Date;
  startLabel: string;
  durationLabel: string;
  classes: ClassBlock[];
};

const DAYS: WeeklySchedule['day'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const startTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function parseClock(
  value: string,
  fallbackPeriod?: string,
): { hour: number; minute: number } | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  const rawHour = Number(match[1]);
  const minute = Number(match[2]);
  const period = (match[3] ?? fallbackPeriod)?.toUpperCase();

  if (!period || rawHour < 1 || rawHour > 12 || minute < 0 || minute > 59) {
    return null;
  }

  let hour = rawHour % 12;
  if (period === 'PM') hour += 12;

  return { hour, minute };
}

export function parseClassTimeRange(
  time: string,
): { startMinutes: number; endMinutes: number } | null {
  const [startRaw, endRaw] = time.split('-').map((part) => part.trim());
  if (!startRaw || !endRaw) return null;

  const startPeriod = startRaw.match(/\b(AM|PM)\b/i)?.[1];
  const endPeriod = endRaw.match(/\b(AM|PM)\b/i)?.[1];
  const end = parseClock(endRaw, startPeriod);
  const start = parseClock(startRaw, inferStartPeriod(startRaw, endRaw, endPeriod));

  if (!start || !end) return null;

  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  if (endMinutes <= startMinutes) return null;

  return { startMinutes, endMinutes };
}

function inferStartPeriod(
  startRaw: string,
  endRaw: string,
  endPeriod?: string,
): string | undefined {
  if (!endPeriod) return undefined;

  const startHour = Number(startRaw.match(/^(\d{1,2})/)?.[1]);
  const endHour = Number(endRaw.match(/^(\d{1,2})/)?.[1]);

  if (
    endPeriod.toUpperCase() === 'PM' &&
    startHour !== 12 &&
    ((endHour === 12 && startHour < 12) || (endHour !== 12 && startHour > endHour))
  ) {
    return 'AM';
  }

  return endPeriod;
}

function dateForDayOffset(now: Date, dayOffset: number, minutes: number): Date {
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function formatCountdown(start: Date, now: Date): string {
  const minutes = Math.max(0, Math.ceil((start.getTime() - now.getTime()) / 60_000));

  if (minutes === 0) return 'Starting now';
  return `Starts in ${formatDuration(minutes)}`;
}

export function getScheduleLabel(block: UpcomingClassBlock): string {
  if (block.dayOffset === 0) return block.start.getHours() >= 17 ? 'Tonight' : 'Today';
  if (block.dayOffset === 1) return 'Tomorrow';
  return `Next up ${block.day}`;
}

export type ProgramDaySchedule = {
  day: WeeklySchedule['day'];
  classes: ClassBlock[];
};

export function getClassesForProgram(matchers: string[]): ProgramDaySchedule[] {
  if (matchers.length === 0) return [];
  const lower = matchers.map((m) => m.toLowerCase());
  return weeklySchedule
    .map((entry) => ({
      day: entry.day,
      classes: entry.classes.filter((c) => lower.some((m) => c.program.toLowerCase().includes(m))),
    }))
    .filter((entry) => entry.classes.length > 0);
}

export function getUpcomingClassBlocks(
  now: Date,
  options: { limit?: number; schedule?: WeeklySchedule[] } = {},
): UpcomingClassBlock[] {
  const limit = options.limit ?? 4;
  const schedule = options.schedule ?? weeklySchedule;
  const currentDay = now.getDay();
  const blocks: UpcomingClassBlock[] = [];

  for (let offset = 0; offset < DAYS.length && blocks.length < limit; offset += 1) {
    const day = DAYS[(currentDay + offset) % DAYS.length];
    const daySchedule = schedule.find((entry) => entry.day === day);
    if (!daySchedule) continue;

    const grouped = new Map<number, { endMinutes: number; classes: ClassBlock[] }>();

    for (const classBlock of daySchedule.classes) {
      const parsed = parseClassTimeRange(classBlock.time);
      if (!parsed) continue;
      if (offset === 0 && dateForDayOffset(now, offset, parsed.startMinutes) <= now) {
        continue;
      }

      const existing = grouped.get(parsed.startMinutes);
      if (existing) {
        existing.endMinutes = Math.max(existing.endMinutes, parsed.endMinutes);
        existing.classes.push(classBlock);
      } else {
        grouped.set(parsed.startMinutes, {
          endMinutes: parsed.endMinutes,
          classes: [classBlock],
        });
      }
    }

    const dayBlocks = Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([startMinutes, group]) => {
        const start = dateForDayOffset(now, offset, startMinutes);
        const duration = group.endMinutes - startMinutes;
        return {
          day,
          dayOffset: offset,
          start,
          startLabel: startTimeFormatter.format(start),
          durationLabel: formatDuration(duration),
          classes: group.classes,
        };
      });

    blocks.push(...dayBlocks);
  }

  return blocks.slice(0, limit);
}
