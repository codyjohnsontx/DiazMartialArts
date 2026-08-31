import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  AnnouncementFlyerGallery,
  type AnnouncementFlyer,
} from '@/components/AnnouncementFlyerGallery';

// The live feed is whatever the gym is currently running, and it is routinely a
// single category - tests/e2e/public-pages.spec.ts can then only walk one filter
// button, which is not enough to tell a working filter from one that stopped
// excluding. This fixture spans three categories on purpose, and lists them in
// an order the filter row is not allowed to inherit.
const flyers: AnnouncementFlyer[] = [
  {
    id: 'holiday-closure',
    src: '/announcements/holiday-closure.jpg',
    alt: 'The gym is closed on Thanksgiving Day.',
    title: 'Holiday Closure',
    tag: 'Closure',
    date: 'November 26',
    category: 'Closures',
    width: 1200,
    height: 900,
  },
  {
    id: 'open-mat-night',
    src: '/announcements/open-mat-night.jpg',
    alt: 'Open mat night, Friday at 7 PM, all belts welcome.',
    title: 'Open Mat Night',
    tag: 'BJJ',
    date: 'Every Friday',
    category: 'Events',
    width: 1200,
    height: 900,
  },
  {
    id: 'summer-special',
    src: '/announcements/summer-special.jpg',
    alt: 'Summer special: $60 to get started.',
    title: 'Summer Special',
    tag: 'Karate',
    date: 'No end date listed',
    category: 'Promos',
    width: 1200,
    height: 900,
  },
  {
    id: 'beginner-special',
    src: '/announcements/beginner-special.jpg',
    alt: 'Beginner special: $130 to get started, gi included.',
    title: 'Beginner Special',
    tag: 'BJJ',
    date: 'No end date listed',
    category: 'Promos',
    width: 1200,
    height: 900,
  },
];

function filterRow() {
  return screen
    .queryAllByRole('button')
    .filter((button) => button.hasAttribute('aria-pressed'))
    .map((button) => button.textContent);
}

describe('AnnouncementFlyerGallery', () => {
  it('offers a filter only for the categories the feed carries', () => {
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    expect(filterRow()).toEqual(['All', 'Events', 'Promos', 'Closures']);
    expect(screen.queryByRole('button', { name: 'Testings' })).not.toBeInTheDocument();
  });

  it('shows every flyer until a category is picked', () => {
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    for (const flyer of flyers) {
      expect(screen.getByRole('heading', { name: flyer.title })).toBeVisible();
    }
  });

  it('renders only the selected category and excludes the rest', async () => {
    const user = userEvent.setup();
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    await user.click(screen.getByRole('button', { name: 'Promos' }));

    expect(screen.getByRole('heading', { name: 'Summer Special' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Beginner Special' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Open Mat Night' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Holiday Closure' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Events' }));

    expect(screen.getByRole('heading', { name: 'Open Mat Night' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Summer Special' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Beginner Special' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Holiday Closure' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All' }));

    for (const flyer of flyers) {
      expect(screen.getByRole('heading', { name: flyer.title })).toBeVisible();
    }
  });

  it('keeps the empty state away while the selection has flyers', async () => {
    const user = userEvent.setup();
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    expect(screen.queryByText(/No announcements in this category/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Closures' }));

    expect(screen.getByRole('heading', { name: 'Holiday Closure' })).toBeVisible();
    expect(screen.queryByText(/No announcements in this category/i)).not.toBeInTheDocument();
  });

  it('falls back to the empty state when the selected category loses its flyers', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AnnouncementFlyerGallery flyers={flyers} />);

    await user.click(screen.getByRole('button', { name: 'Closures' }));
    rerender(<AnnouncementFlyerGallery flyers={flyers.filter((f) => f.category !== 'Closures')} />);

    expect(screen.getByText(/No announcements in this category/i)).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Holiday Closure' })).not.toBeInTheDocument();
  });

  it('offers no filter row at all when the feed carries a single category', () => {
    const promos = flyers.filter((f) => f.category === 'Promos');
    render(<AnnouncementFlyerGallery flyers={promos} />);

    // Every button such a row could offer - All, and the one category - selects
    // the whole feed, so the row would advertise a choice that changes nothing.
    expect(filterRow()).toEqual([]);
    for (const flyer of promos) {
      expect(screen.getByRole('heading', { name: flyer.title })).toBeVisible();
    }
    expect(screen.queryByText(/No announcements in this category/i)).not.toBeInTheDocument();
  });

  it('offers no filter row, and says so, when the feed is empty', () => {
    render(<AnnouncementFlyerGallery flyers={[]} />);

    expect(filterRow()).toEqual([]);
    expect(screen.getByText(/No announcements in this category/i)).toBeVisible();
  });

  it('names the enlarge control and the lightbox after the flyer, not its alt text', async () => {
    const user = userEvent.setup();
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    await user.click(screen.getByRole('button', { name: 'Enlarge Open Mat Night' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label', 'Open Mat Night');
    expect(within(dialog).getByAltText(flyers[1].alt)).toBeVisible();
  });

  // The two halves below have to hold together. An `aria-label` wins the
  // accessible name outright and assistive technology presents a button as a
  // single node, so the alt on the nested image is not announced: naming the
  // control after the flyer without describing it elsewhere silently drops the
  // offer - the price, what it includes, the ages, the phone number - from the
  // card, and these flyers ARE the announcement.
  it('keeps the enlarge control short-named while still describing the offer', () => {
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    for (const flyer of flyers) {
      const enlarge = screen.getByRole('button', { name: `Enlarge ${flyer.title}` });
      expect(enlarge).toHaveAccessibleName(`Enlarge ${flyer.title}`);
      expect(enlarge).toHaveAccessibleDescription(flyer.alt);
    }
  });

  it('leaves the description visually hidden rather than out of the accessibility tree', () => {
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    const description = document.getElementById(`${flyers[0].id}-description`);

    expect(description).not.toBeNull();
    expect(description).toHaveTextContent(flyers[0].alt);
    // `sr-only` clips the node without leaving the accessibility tree; `hidden`,
    // `display: none` and `aria-hidden` would each announce nothing at all.
    expect(description).toHaveClass('sr-only');
    expect(description).not.toHaveAttribute('aria-hidden');
    expect(description).toBeVisible();
  });
  /**
   * The lightbox is the only route to a flyer at full size, and on this page
   * the flyer IS the announcement, so these are not optional polish: a dialog
   * that cannot be closed from the keyboard, or that lets focus wander onto
   * the page behind it, is the whole content put out of reach.
   *
   * These run in jsdom, which models focus but not a browser's own focus
   * rules, so they pin the component's side of each path and leave the real
   * ones to `tests/e2e/announcement-lightbox.spec.ts`, which drives the same
   * paths with a real keyboard in a real browser.
   */
  describe('the lightbox keyboard paths', () => {
    async function openFlyer(user: ReturnType<typeof userEvent.setup>) {
      const trigger = screen.getByRole('button', { name: 'Enlarge Open Mat Night' });
      await user.click(trigger);

      const dialog = screen.getByRole('dialog');
      const close = within(dialog).getByRole('button', { name: 'Close' });
      // Focus crosses on the next frame, so it is waited for rather than
      // assumed - and it has to cross at all: left on the trigger, focus is
      // behind the scrim and every key the lightbox listens for is aimed at it.
      await waitFor(() => expect(close).toHaveFocus());

      return { trigger, dialog, close };
    }

    it('closes on Escape, hands focus back, and releases the page scroll', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const { trigger } = await openFlyer(user);

      expect(document.body.style.overflow).toBe('hidden');

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(document.body.style.overflow).toBe('');
    });

    it('closes from its own Close control and hands focus back', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const { trigger } = await openFlyer(user);

      // Focus is already on Close, so this is the visible control activated
      // the way a keyboard visitor activates it.
      await user.keyboard('{Enter}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(trigger).toHaveFocus());
    });

    it('hands focus back to whichever control opened it', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);

      // Two controls open the same flyer. A restore hard-coded to the enlarge
      // button would silently move a reader up the card on every close from
      // the second one.
      const view = within(
        screen.getByRole('heading', { name: 'Open Mat Night' }).closest('article')!,
      ).getByRole('button', { name: /^View/ });
      await user.click(view);
      await waitFor(() =>
        expect(
          within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }),
        ).toHaveFocus(),
      );

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(view).toHaveFocus());
    });

    it('keeps Tab and Shift+Tab inside it', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const { dialog } = await openFlyer(user);

      for (let i = 1; i <= 3; i++) {
        await user.tab();
        expect(dialog, `Tab ${i} left the lightbox`).toContainElement(
          document.activeElement as HTMLElement,
        );
      }
      for (let i = 1; i <= 3; i++) {
        await user.tab({ shift: true });
        expect(dialog, `Shift+Tab ${i} left the lightbox`).toContainElement(
          document.activeElement as HTMLElement,
        );
      }
    });

    it('keeps Tab inside it from the overlay itself, which is not one of its stops', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const { dialog } = await openFlyer(user);

      // The state a click on the flyer leaves behind in a browser: that click
      // deliberately does not close the lightbox, and Chrome hands it to the
      // nearest focusable ancestor, which is the overlay root. The trap lists
      // the overlay's focusable DESCENDANTS, so the root is neither its first
      // stop nor its last and Tab used to fall straight through to the page
      // behind. jsdom does not model that focus rule, so the position is set
      // directly here; the e2e spec performs the click itself.
      dialog.focus();
      expect(dialog).toHaveFocus();

      await user.tab({ shift: true });
      expect(dialog, 'Shift+Tab escaped the lightbox').toContainElement(
        document.activeElement as HTMLElement,
      );
      await user.tab();
      expect(dialog, 'Tab escaped the lightbox').toContainElement(
        document.activeElement as HTMLElement,
      );
    });

    it('closes on Escape from wherever focus is, not only from inside', async () => {
      const user = userEvent.setup();
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const { dialog } = await openFlyer(user);

      // Deliberately belt and braces, and the state is a real one - it is
      // where the Shift+Tab above used to land. The trap is what keeps focus
      // in; this keeps "Escape closes it" true when something else has taken
      // focus out. Bound to the overlay, that promise held only while the trap
      // was perfect.
      const behind = screen.getAllByRole('button', { name: /^View/ })[0]!;
      behind.focus();
      expect(dialog).not.toContainElement(behind);

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
