import { getPublicEnv } from '@/lib/env';

import { Card } from './Card';

export function MonthlyCalendarEmbed() {
  const { googleCalendarEmbedUrl: embedUrl } = getPublicEnv();

  if (!embedUrl) {
    return (
      <Card>
        <p className="text-sm text-black/70">Monthly calendar coming soon.</p>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '75%' }}>
        <iframe
          title="Diaz Martial Arts monthly schedule"
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </Card>
  );
}
