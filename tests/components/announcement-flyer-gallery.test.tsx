import { render, screen, within } from '@testing-library/react';
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
});
