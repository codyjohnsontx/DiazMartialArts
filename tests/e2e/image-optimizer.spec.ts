import { test, expect } from '@playwright/test';

/**
 * That `/_next/image` answers at all.
 *
 * This is the suite's only assertion on the optimizer endpoint itself.
 * Everywhere a page renders an image - the hero in tests/e2e/home.spec.ts, the
 * flyer feed in tests/e2e/public-pages.spec.ts - what gets checked is the file
 * behind the rendered src, because a decode deadline measures how busy the box
 * is rather than whether the page is right. Without this file a 400 or a 500
 * from the optimizer (a future images.localPatterns or images.deviceSizes
 * change, an encoder failure) would leave the hero broken on the live site with
 * the whole suite green.
 *
 * It is a file of its own, modelled on tests/e2e/auth-pages.spec.ts, because
 * that spec is the only one in the suite with no `page.goto` at all: it drives
 * the `request` fixture and never loads a page, so it never waits on a load
 * event and inherits none of the cold-start exposure that comes with one.
 * Keeping that property is the whole reason this is not simply added to
 * tests/e2e/public-pages.spec.ts, which navigates thirteen times, seven of them
 * to /announcements, whose feed already puts three flyers through this same
 * encoder - adding encoder pressure there would move the flake rather than
 * remove it. For the same reason the assertion does not go back into
 * tests/e2e/home.spec.ts: "does the home page render" and "does the optimizer
 * answer" are two questions, and blocking the first on the second is precisely
 * the defect that spec was just fixed for.
 */
test.describe('Next image optimizer', () => {
  test('serves an optimized variant of the hero photo', async ({ request }, testInfo) => {
    // A server-side HTTP assertion with no viewport dependence, so running it
    // under the second project would only pay for the encode twice.
    test.skip(testInfo.project.name === 'Mobile', 'Viewport-independent HTTP assertion.');

    // `w=640` is deliberate: it is the smallest configured deviceSize and a
    // width the hero genuinely serves to phones for its `sizes="100vw"` fill
    // image, so this exercises the real route, its width validation and the
    // encoder at the cheapest encode available - measured cold on this branch
    // at 0.29s idle and 0.58s under 24-way CPU contention, against 4.1s for the
    // w=1920 variant. The residual, stated rather than hidden: the accepted
    // widths come from images.deviceSizes/imageSizes, so a config change that
    // drops 640 fails this test even though the hero still renders. For a smoke
    // assertion that is a loud and correct signal, not a false alarm.
    const response = await request.get('/_next/image?url=%2Fbjj.jpg&w=640&q=75');

    // Status and content type, and nothing else. The bytes are left alone on
    // purpose: tests/fixtures/imageSize.ts already owns that question from the
    // two specs above, and a smoke assertion that grows a decoder becomes its
    // own maintenance problem.
    expect(response.status(), 'the image optimizer does not answer for the hero photo').toBe(200);
    expect(
      response.headers()['content-type'],
      'the image optimizer answers for the hero photo with something that is not an image',
    ).toMatch(/^image\//);
  });
});
