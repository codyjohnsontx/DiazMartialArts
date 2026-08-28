/** Shared Playwright waits for React hydration. No Next.js imports. */

import type { Page } from '@playwright/test';

/**
 * These specs run against `next dev`, where hydration trails the load event.
 * Playwright's actionability checks cover visibility and stability but not
 * whether React has attached a handler yet, so an interaction that arrives
 * first is swallowed with nothing to retry - which is how `pressing Enter on
 * toggle opens menu` flaked in CI, `focus()` and `keyboard.press()` having no
 * actionability check at all. React tags each host node it hydrates with its
 * own `__react*` keys, so their arrival on this button is the moment its
 * onClick exists.
 */
export async function waitForMenuToggleHydration(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('button[aria-label="Toggle menu"]');
    return Boolean(el && Object.keys(el).some((key) => key.startsWith('__react')));
  });
}
