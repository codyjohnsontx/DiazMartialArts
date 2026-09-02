import { test, expect, type Page } from '@playwright/test';

import { waitForHydration } from '../fixtures/hydration';

/**
 * The flyer lightbox, driven the way a visitor actually drives it - by keyboard
 * for the group below, and by a real mouse at a real pixel for the group after
 * it.
 *
 * This matters more here than the same dialog would elsewhere. On
 * /announcements the flyer IS the announcement - the price, what it includes,
 * the ages, the phone number are printed inside the image and exist nowhere
 * else on the page - so the lightbox is the whole of that content at full
 * size, and a dialog that cannot be closed from the keyboard, or that lets
 * focus wander onto the page behind an opaque scrim, is a barrier rather than
 * a missing unit test.
 *
 * What was broken when this spec was written, reproduced in a real browser
 * before anything was changed:
 *
 *   1. Open a flyer, then click the flyer itself. That click deliberately does
 *      not close the lightbox (the image stops the overlay's click), and
 *      Chrome hands focus to the nearest focusable ancestor - which is the
 *      overlay's own `tabIndex={0}` root.
 *   2. The Tab trap listed the dialog's focusable DESCENDANTS and only acted
 *      when `document.activeElement` was the first or the last of them. The
 *      root is neither, so Tab fell through to the browser and one Shift+Tab
 *      put focus on the "View" button of the card behind the scrim.
 *   3. The Escape handler was bound to the dialog element, so with focus
 *      outside it Escape reached nothing. The lightbox was then open, opaque,
 *      and impossible to close from the keyboard at all.
 *
 * Each test below fails against that code, or - where it pins behaviour that
 * already worked - fails when the line it describes is removed. The two
 * belt-and-braces guards are deliberate and named as such: the trap is what
 * keeps focus in, and Escape working from anywhere is what stops a single
 * stray focus from trapping the visitor instead.
 *
 * The second describe block covers the pointer, and was written for a defect
 * with the opposite shape: every keyboard path above passed while the Close
 * button - the one control a visitor with a mouse reaches for - was painted
 * underneath the sticky header and could not be clicked at all. Issue #46 and
 * the portal docblock in `components/AnnouncementFlyerGallery.tsx` own the
 * mechanism.
 */

const TRIGGER = 'button[aria-label^="Enlarge "]';

/**
 * Read straight off `document.activeElement`. Playwright's `toBeFocused` can
 * only ask about an element you already have a locator for, and the failure
 * this spec exists to catch is focus landing somewhere nobody named.
 */
function focusState(page: Page) {
  return page.evaluate(() => {
    const active = document.activeElement;
    return {
      insideDialog: Boolean(active?.closest('[role="dialog"]')),
      label: active?.getAttribute('aria-label') ?? (active?.textContent ?? '').trim(),
      scrollLock: document.body.style.overflow,
    };
  });
}

/**
 * Not the default `waitUntil: 'load'`: this feed puts three flyers through the
 * on-request image optimizer, and `load` waits for all of them, which makes the
 * navigation cost the box's rather than the page's. See the note at the top of
 * tests/e2e/home.spec.ts. Hydration is the readiness these tests actually need,
 * and it is waited for by name below - `focus()` and `keyboard.press()` carry
 * no actionability check, so without it a press can land before React has
 * attached the handler and be swallowed with nothing to retry.
 */
async function openAnnouncements({ page }: { page: Page }) {
  await page.goto('/announcements', { waitUntil: 'domcontentloaded' });
  await waitForHydration(page, TRIGGER);
}

test.describe('Announcement flyer lightbox - keyboard', () => {
  test.beforeEach(openAnnouncements);

  test('a Tab walk reaches a flyer, and opening it moves focus into the lightbox', async ({
    page,
  }) => {
    const trigger = page.locator(TRIGGER).first();
    const triggerLabel = await trigger.getAttribute('aria-label');

    // Walk rather than call focus(): reaching the control at all is part of
    // what is being checked, and the number of stops before it differs between
    // the two viewport projects, so it is discovered rather than hard-coded.
    let hops = 0;
    for (; hops < 40; hops++) {
      await page.keyboard.press('Tab');
      if ((await focusState(page)).label === triggerLabel) break;
    }
    expect(hops, 'no Tab press in 40 reached a flyer').toBeLessThan(40);

    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Focus has to cross into the dialog by itself. Left on the trigger it is
    // behind the scrim, and every key the dialog listens for is aimed at it.
    expect(await focusState(page)).toMatchObject({ insideDialog: true, label: 'Close' });
  });

  test('Escape closes it, hands focus back, and releases the page scroll', async ({ page }) => {
    const trigger = page.locator(TRIGGER).first();
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect((await focusState(page)).scrollLock, 'the page still scrolls behind the flyer').toBe(
      'hidden',
    );

    await page.keyboard.press('Escape');

    await expect(dialog).toHaveCount(0);
    expect(
      await trigger.evaluate((el) => el === document.activeElement),
      'focus did not return to the control that opened the lightbox',
    ).toBe(true);
    expect((await focusState(page)).scrollLock, 'the page scroll lock outlived the flyer').toBe('');
  });

  test('Tab and Shift+Tab stay inside it', async ({ page }) => {
    await page.locator(TRIGGER).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // More presses than the dialog has stops, in both directions, so a trap
    // that only holds for one cycle fails here.
    for (let i = 1; i <= 5; i++) {
      await page.keyboard.press('Tab');
      expect((await focusState(page)).insideDialog, `Tab ${i} left the lightbox`).toBe(true);
    }
    for (let i = 1; i <= 5; i++) {
      await page.keyboard.press('Shift+Tab');
      expect((await focusState(page)).insideDialog, `Shift+Tab ${i} left the lightbox`).toBe(true);
    }
  });

  test('a click on the flyer leaves it trapped and still closable', async ({ page }) => {
    await page.locator(TRIGGER).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // The reproduction. Clicking the flyer is an ordinary thing to do once it
    // is open - it is the one click inside the overlay that does not close it -
    // and it leaves focus on the overlay root, which is not one of the stops
    // the trap enumerates.
    await dialog.locator('img').click();
    expect(
      (await focusState(page)).insideDialog,
      'a click inside the lightbox put focus outside it',
    ).toBe(true);

    await page.keyboard.press('Shift+Tab');
    expect((await focusState(page)).insideDialog, 'Shift+Tab escaped the lightbox').toBe(true);
    await page.keyboard.press('Tab');
    expect((await focusState(page)).insideDialog, 'Tab escaped the lightbox').toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('Escape closes it from wherever focus is, not only from inside', async ({ page }) => {
    await page.locator(TRIGGER).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Deliberately belt and braces, and the state is a real one: it is exactly
    // where the Shift+Tab above used to land. The trap is what should keep
    // focus in; this is what keeps "Escape closes it" true when something else
    // has taken focus out - a browser-chrome round trip, an extension, a
    // future control added outside the overlay. Bound to the dialog element,
    // that promise held only while the trap was perfect.
    await page
      .locator('main article')
      .first()
      .getByRole('button', { name: /View/ })
      .evaluate((el: HTMLElement) => el.focus());
    expect((await focusState(page)).insideDialog).toBe(false);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('hands focus back to whichever control opened it', async ({ page }) => {
    // Two controls open the same flyer, and the visitor has to land back on
    // the one they used - a restore hard-coded to the enlarge button would
    // silently move a reader up the card on every close from here.
    const view = page.locator('main article').first().getByRole('button', { name: /View/ });
    await view.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    expect(
      await view.evaluate((el) => el === document.activeElement),
      'focus did not return to the "View" control that opened the lightbox',
    ).toBe(true);
  });
});

/**
 * The pointer half, and the assertion whose absence let issue #46 ship.
 *
 * A `z-index` is only ever compared with siblings in the same stacking
 * context, so "the overlay declares 100 and the header declares 40" is not a
 * statement about what a visitor can click. `main { isolation: isolate }` in
 * `app/globals.css` made `<main>` a stacking context of its own, the lightbox
 * was rendered inside it, and the header - a positioned sibling at the root -
 * painted over the whole of it. Every keyboard test above passed the entire
 * time: Escape closed the dialog and so did a backdrop click, so the only
 * symptom was that the X did nothing.
 *
 * Nothing that reads the DOM can see it. The button is in the tree, visible,
 * enabled, correctly named, and at the right coordinates; only the pixel is
 * wrong. `document.elementFromPoint` at the button's own centre is the cheapest
 * question that has the right answer, and it is asked here rather than left to
 * Playwright's hit-target check so that a failure names what is covering the
 * button instead of reporting an unstable click.
 *
 * Both Playwright projects run this file, so each test below is really two: a
 * desktop width, where the covering element was the `<header>` itself, and a
 * 390px width, where it was the header's "Toggle menu" button. The two differ
 * because the header's own contents differ across `min-[1035px]`, so covering
 * one width would have left the other unguarded.
 */
test.describe('Announcement flyer lightbox - pointer', () => {
  test.beforeEach(openAnnouncements);

  /** What a real cursor at the centre of `locator` would actually hit. */
  async function topmostAtCentre(locator: ReturnType<Page['locator']>) {
    return locator.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        isTheElement: top === el || el.contains(top),
        // Named on failure, because "something covers it" is the finding and
        // which something it is is the whole of the diagnosis.
        covering: top
          ? `${top.tagName.toLowerCase()}${top.className ? `.${String(top.className).trim().split(/\s+/).join('.')}` : ''}`
          : 'nothing (outside the viewport)',
      };
    });
  }

  test('nothing is painted over the Close button at its own centre', async ({ page }) => {
    await page.locator(TRIGGER).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const close = dialog.getByRole('button', { name: 'Close' });
    const hit = await topmostAtCentre(close);

    expect(
      hit.isTheElement,
      `the Close button is painted under ${hit.covering}, so a click never reaches it`,
    ).toBe(true);
  });

  test('a real click at the pixel the Close button occupies closes it', async ({ page }) => {
    await page.locator(TRIGGER).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const box = await dialog.getByRole('button', { name: 'Close' }).boundingBox();
    expect(box, 'the Close button has no box to click').not.toBeNull();

    // Dispatched at the coordinate rather than through the locator: a click
    // aimed at a pixel is what a visitor performs, and it is the only kind that
    // can be swallowed by whatever else is painted there.
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);

    await expect(dialog).toHaveCount(0);
    expect((await focusState(page)).scrollLock, 'the page scroll lock outlived the flyer').toBe('');
  });

  test('a click on the flyer keeps it open, and a click on the scrim closes it', async ({
    page,
  }) => {
    const trigger = page.locator(TRIGGER).first();
    const dialog = page.getByRole('dialog');

    await trigger.click();
    await expect(dialog).toBeVisible();

    // The flyer stops the overlay's click on purpose: it is the content, and
    // reading it is not a request to close. Asserted first so the scrim clicks
    // below are proof of the overlay's own handler rather than of any click
    // anywhere closing the dialog.
    await dialog.locator('img').click();
    await expect(dialog).toBeVisible();

    // Two scrim pixels, not one, because they were not equally broken. The
    // flyer is centred and Close is top-right, so both corners of the overlay
    // are scrim - but only the lower one was reachable before the portal. The
    // upper one sits inside the sticky header's own band and was swallowed by
    // exactly the paint order that swallowed the Close button, so the pair
    // covers the behaviour this move must not regress and the behaviour it
    // fixes. Playwright's hit-target check makes either click fail rather than
    // pass silently if something else is painted there.
    const box = await dialog.boundingBox();
    expect(box, 'the lightbox has no box to click').not.toBeNull();

    for (const [where, y] of [
      ['below the header', box!.height - 5],
      ['inside the header band', 5],
    ] as const) {
      await expect(dialog, `the lightbox was not open before the click ${where}`).toBeVisible();
      await dialog.click({ position: { x: 5, y } });
      await expect(dialog, `a scrim click ${where} did not close the lightbox`).toHaveCount(0);
      await trigger.click();
    }

    // The reopen at the end of the last pass leaves it open; close it the way
    // the rest of the suite does so the test ends on a closed dialog.
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
