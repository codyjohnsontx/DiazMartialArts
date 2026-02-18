import { classDescriptions, weeklySchedule } from '@/content/schedule';

import { Card } from './Card';

export function WeeklyScheduleTable() {
  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Weekly class schedule</caption>
        <thead className="bg-ink text-sm uppercase tracking-[0.14em] text-sand">
          <tr>
            <th className="px-5 py-4">Day</th>
            <th className="px-5 py-4">Class Times</th>
          </tr>
        </thead>
        <tbody>
          {weeklySchedule.map((day) => (
            <tr key={day.day} className="border-t border-black/10 align-top">
              <th scope="row" className="min-w-[120px] px-5 py-4 text-base font-semibold text-ink">
                {day.day}
              </th>
              <td className="px-5 py-4">
                {day.classes.length === 0 ? (
                  <span className="text-sm text-black/55">No classes scheduled.</span>
                ) : (
                  <ul className="space-y-2">
                    {day.classes.map((entry) => (
                      <li key={`${day.day}-${entry.time}-${entry.program}`} className="rounded-xl bg-sand">
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
                            <span>
                              <span className="text-sm font-semibold text-ink">{entry.time} · {entry.program}</span>
                              <span className="block text-xs uppercase tracking-[0.14em] text-black/55">{entry.coach}</span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="text-sm font-bold text-black/55 transition group-open:rotate-45"
                            >
                              +
                            </span>
                          </summary>
                          <div className="border-t border-black/10 px-3 pb-3 pt-2">
                            <p className="text-sm leading-relaxed text-black/70">
                              {classDescriptions[entry.program] || 'Class details coming soon.'}
                            </p>
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
