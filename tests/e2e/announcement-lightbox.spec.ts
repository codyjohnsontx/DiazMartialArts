import { test, expect, type Page } from '@playwright/test';

import { waitForHydration } from '../fixtures/hydration';

/**
 * The flyer lightbox, driven the way a visitor who does not use a mouse has to
 * drive it.
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

test.describe('Announcement flyer lightbox - keyboard', () => {
  test.beforeEach(async ({ page }) => {
    // Not the default `waitUntil: 'load'`: this feed puts three flyers through
    // the on-request image optimizer, and `load` waits for all of them, which
    // makes the navigation cost the box's rather than the page's. See the note
    // at the top of tests/e2e/home.spec.ts. Hydration is the readiness these
    // tests actually need, and it is waited for by name on the next line.
    await page.goto('/announcements', { waitUntil: 'domcontentloaded' });
    // `focus()` and `keyboard.press()` carry no actionability check, so without
    // this a press can land before React has attached the handler and be
    // swallowed with nothing to retry.
    await waitForHydration(page, TRIGGER);
  });

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
