import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import {
  AnnouncementFlyerGallery,
  NO_END_DATE,
  type AnnouncementFlyer,
} from '@/components/AnnouncementFlyerGallery';
import { site } from '@/content/site';

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
    date: NO_END_DATE,
    category: 'Promos',
    width: 1200,
    height: 900,
  },
  {
    id: 'beginner-special',
    src: '/announcements/beginner-special.jpg',
    alt: 'Two students grappling in blue and white gis.',
    title: 'Beginner Special',
    tag: 'BJJ',
    date: NO_END_DATE,
    category: 'Promos',
    width: 1200,
    height: 900,
    priceUsd: 130,
    priceNote: 'to get started',
    includes: ['a jiu jitsu gi', 'two private lessons'],
    ages: ['Adults, ages 16 and up'],
    callForAppointment: true,
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

  /**
   * The lightbox is `aria-modal="true"`, so while it is open the card behind it
   * - offer text and all - is outside the accessibility tree, and the flyer's
   * `alt` describes the picture rather than the offer. Without a description on
   * the dialog itself a screen-reader user reaches the full-size view of an
   * image of text and is told only what the photograph looks like: the price,
   * what it includes, the ages and the phone line are unreachable until they
   * close it. Read through the accessibility tree rather than off the DOM,
   * because that is the thing under test - the words are present either way.
   */
  it('describes the enlarged flyer with the same offer the card shows', async () => {
    const user = userEvent.setup();
    render(<AnnouncementFlyerGallery flyers={flyers} />);

    await user.click(screen.getByRole('button', { name: 'Enlarge Beginner Special' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Beginner Special');
    // This flyer names no expiry, and "No end date listed" states no fact, so
    // the description carries the offer and stops there.
    expect(dialog).toHaveAccessibleDescription(
      `$130 to get started. Includes a jiu jitsu gi and two private lessons. Adults, ages 16 and up. Call to make an appointment: ${site.phone}`,
    );
  });

  /**
   * A dated flyer's day is the one actionable fact on it, and the date row that
   * carries it on the card is behind the modal like the rest of the card. The
   * live Cleber Luciano seminar is this shape: a real date, and before this
   * change its alt spelled the date, place, time and cost out.
   */
  it('carries a real date into the enlarged view, and the no-expiry placeholder not at all', async () => {
    const user = userEvent.setup();
    const dated = { ...flyers[3], id: 'seminar', title: 'Seminar', date: 'Thursday, October 8' };
    render(<AnnouncementFlyerGallery flyers={[dated, flyers[2]]} />);

    await user.click(screen.getByRole('button', { name: 'Enlarge Seminar' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/Thursday, October 8$/);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Enlarge Summer Special' }));

    // Nothing to say and no date worth saying: no description element at all,
    // rather than an empty one for a screen reader to stop on.
    const undated = screen.getByRole('dialog');
    expect(undated).not.toHaveAttribute('aria-describedby');
    expect(undated).toHaveAccessibleDescription('');
  });

  /**
   * The offer itself - price, what it includes, ages, the phone line - is page
   * text under the title, so what a card says depends on the fields the flyer
   * was transcribed into: a field the flyer does not print is left off, and
   * the card must then render nothing in its place rather than a bare label,
   * an empty line or a stray "Includes". The number is the one value not
   * transcribed - it comes from content/site.ts, so the card cannot spell the
   * gym's own line differently from the footer or dial a different target.
   */
  describe('the offer as page text', () => {
    function card(title: string) {
      return within(screen.getByRole('heading', { name: title }).closest('article')!);
    }

    it('renders the qualified price, what it includes, the ages and a callable phone number', () => {
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const special = card('Beginner Special');

      // The amount never stands alone when the flyer qualifies it: "$130" on
      // its own reads as a monthly rate for a martial arts class, and the alt
      // text that used to carry "to get started" now describes the picture.
      expect(special.getByText('$130 to get started')).toBeVisible();
      expect(special.queryByText('$130')).not.toBeInTheDocument();
      expect(special.getByText('Includes a jiu jitsu gi and two private lessons')).toBeVisible();
      expect(special.getByText('Adults, ages 16 and up')).toBeVisible();
      const phone = special.getByRole('link', { name: site.phone });
      expect(phone).toHaveAttribute('href', site.phoneHref);
      // The whole offer reads as ordinary text, in order, before the date row.
      const body = special.getByRole('heading', { name: 'Beginner Special' }).parentElement!;
      expect(body).toHaveTextContent(
        new RegExp(
          `^Beginner Special\\$130 to get startedIncludes a jiu jitsu gi and two private lessonsAdults, ages 16 and upCall to make an appointment: ${site.phone.replace(/[()]/g, '\\$&')}No end date listedView`,
        ),
      );
    });

    it('renders a flyer with no offer fields cleanly, with nothing empty or dangling', () => {
      render(<AnnouncementFlyerGallery flyers={flyers} />);
      const closure = card('Holiday Closure');

      expect(closure.queryByText(/\$\d/)).not.toBeInTheDocument();
      expect(closure.queryByText(/Includes/)).not.toBeInTheDocument();
      expect(closure.queryByText(/^Call/)).not.toBeInTheDocument();
      expect(closure.queryByRole('link')).not.toBeInTheDocument();
      // The title is followed directly by the date row: no empty block between.
      const heading = closure.getByRole('heading', { name: 'Holiday Closure' });
      expect(heading.nextElementSibling).toContainElement(closure.getByText('November 26'));
      const body = heading.parentElement!;
      expect(body.querySelectorAll('p, li, dd')).toHaveLength(0);
      expect(body).toHaveTextContent(/^Holiday ClosureNovember 26View/);
    });

    // The shape the live Cleber Luciano flyer has: it prints "Cost: $125" and
    // no qualifier, so the amount is the whole fee and the line must not grow
    // wording the image does not carry - nor a trailing space where the note
    // would have been.
    it('renders the price bare when the flyer prints no words beside it', () => {
      render(
        <AnnouncementFlyerGallery
          flyers={[{ ...flyers[0], id: 'seminar', title: 'Seminar', priceUsd: 125 }]}
        />,
      );
      const seminar = card('Seminar');

      expect(seminar.getByText('$125', { exact: true })).toBeVisible();
      expect(seminar.queryByText(/Includes/)).not.toBeInTheDocument();
      expect(seminar.queryByText(/^Call/)).not.toBeInTheDocument();
    });
  });

  // The two halves below have to hold together. An `aria-label` wins the
  // accessible name outright and assistive technology presents a button as a
  // single node, so the alt on the nested image is not announced: naming the
  // control after the flyer without describing it elsewhere silently drops
  // the picture's description from the card. The offer itself is page text
  // now, so the alt describes the image and nothing depends on it carrying
  // the price.
  it('keeps the enlarge control short-named while still describing the image', () => {
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
      // Asserted with no `waitFor`, deliberately. Focus has to cross at all -
      // left on the trigger it is behind the scrim, and every key the lightbox
      // listens for is aimed at it - but it also has to cross in the same
      // commit that puts the dialog in the DOM. This used to be a
      // `requestAnimationFrame` inside a `useEffect`, which left a frame in
      // which the dialog was open with focus still behind it, and an
      // unconditional grab that then took focus back from anything that moved
      // it during that frame. That flaked
      // `tests/e2e/announcement-lightbox.spec.ts` from both sides (issue #44).
      // `act()` flushes React's effects but not a frame, so a synchronous
      // assertion here fails on any return to a deferred focus, which a
      // `waitFor` would have gone on passing through.
      expect(close).toHaveFocus();

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
      // Synchronous for the reason `openFlyer` above is: a focus assertion
      // wrapped in `waitFor` cannot fail for a focus that arrives a frame late,
      // which is the exact regression this file guards. This test builds its
      // own open path, so without this it would be the one lightbox test that
      // kept passing against a reintroduced `requestAnimationFrame`.
      expect(
        within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }),
      ).toHaveFocus();

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
