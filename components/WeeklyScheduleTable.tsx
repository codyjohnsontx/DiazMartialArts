import { classDescriptions, weeklySchedule } from '@/content/schedule';

import { Card } from './Card';

export function WeeklyScheduleTable() {
  return (
    <Card className="overflow-hidden p-0" interactive={false}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
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
                <th
                  scope="row"
                  className="min-w-[140px] px-5 py-4 text-base font-semibold text-ink"
                >
                  {day.day}
                </th>
                <td className="px-5 py-4">
                  {day.classes.length === 0 ? (
                    <span className="text-sm text-black/60">No classes scheduled.</span>
                  ) : (
                    <ul className="space-y-2">
                      {day.classes.map((entry) => (
                        <li key={`${day.day}-${entry.time}-${entry.program}`}>
                          <details className="group rounded-xl border border-black/10 bg-sand/80">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember">
                              <span>
                                <span className="text-sm font-semibold text-ink">
                                  {entry.time} · {entry.program}
                                </span>
                                <span className="block text-xs uppercase tracking-[0.14em] text-black/60">
                                  {entry.coach}
                                </span>
                              </span>
                              <span
                                aria-hidden="true"
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/15 text-sm text-black/60 transition group-open:rotate-180"
                              >
                                ▾
                              </span>
                            </summary>
                            <div className="border-t border-black/10 px-3 pb-3 pt-2">
                              <p className="text-sm leading-relaxed text-black/75">
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
      </div>
    </Card>
  );
}
