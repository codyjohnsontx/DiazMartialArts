import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { UpcomingEventsSchema } from '@/components/UpcomingEventsSchema';

describe('UpcomingEventsSchema', () => {
  it('keeps feed text that closes a script tag inside the JSON-LD', () => {
    const title = 'Seminar</script><script>alert(1)</script>';
    const html = renderToStaticMarkup(
      <UpcomingEventsSchema
        events={[{ id: 'x', title, start: new Date('2026-10-08T19:00:00-05:00') }]}
      />,
    );

    expect(html.match(/<script/g)).toHaveLength(1);
    const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    expect(JSON.parse(json)[0].name).toBe(title);
  });
});
