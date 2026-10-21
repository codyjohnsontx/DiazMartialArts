import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';

describe('LocalBusinessSchema', () => {
  // The gym at 2061 Clovis Barker Rd, per Google Maps (29.8366832, -97.9437645).
  // An earlier value sat about 5 km north of the building.
  it('pins the map to the gym, not a point north of it', () => {
    const html = renderToStaticMarkup(<LocalBusinessSchema />);
    const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');

    expect(JSON.parse(json).geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: '29.83668',
      longitude: '-97.94376',
    });
  });
});
