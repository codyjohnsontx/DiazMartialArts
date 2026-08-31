'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export type FlyerCategory = 'Events' | 'Promos' | 'Testings' | 'Closures';

export type AnnouncementFlyer = {
  id: string;
  src: string;
  alt: string;
  title: string;
  tag: string;
  date: string;
  category: FlyerCategory;
  /**
   * The flyer file's true intrinsic pixel size, not a layout hint: next/image
   * reserves the box from these, so a wrong pair ships a layout shift.
   * `tests/e2e/public-pages.spec.ts` reads each flyer's own header bytes and
   * fails, naming the file, when the two disagree.
   */
  width: number;
  height: number;
};

type AnnouncementFlyerGalleryProps = {
  flyers: AnnouncementFlyer[];
};

// The order the filter row shows categories in, independent of the order the
// feed happens to list them. Only the ones the feed actually carries are
// rendered, so the row never advertises a button whose only content is the
// empty state, and a feed that carries a single category renders no row at all
// - every button there would select the whole feed.
const categoryOrder: FlyerCategory[] = ['Events', 'Promos', 'Testings', 'Closures'];

export function AnnouncementFlyerGallery({ flyers }: AnnouncementFlyerGalleryProps) {
  const [filter, setFilter] = useState<'All' | FlyerCategory>('All');
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const filters = useMemo<('All' | FlyerCategory)[]>(
    () => ['All', ...categoryOrder.filter((c) => flyers.some((f) => f.category === c))],
    [flyers],
  );

  const visible = useMemo(
    () => (filter === 'All' ? flyers : flyers.filter((f) => f.category === filter)),
    [filter, flyers],
  );

  const activeFlyer = flyers.find((flyer) => flyer.id === activeId);

  function openFlyer(id: string) {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActiveId(id);
  }

  // Stable so the effect below can list it and still run only when a flyer
  // opens or closes, rather than on every render.
  const closeFlyer = useCallback(() => setActiveId(null), []);

  useEffect(() => {
    if (!activeFlyer) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    /**
     * Bound to the document, not to the overlay, and handling both keys in one
     * place because they answer the same question - where focus happens to be -
     * and used to get it wrong in the same way.
     *
     * A handler on the overlay only runs while focus is inside it, and focus is
     * not guaranteed to be. Clicking the flyer is the one click in here that
     * deliberately does not close the lightbox, and Chrome gives that click to
     * the nearest focusable ancestor - the overlay's own `tabIndex={0}` root.
     * The trap enumerates the overlay's focusable DESCENDANTS, so the root is
     * neither its first stop nor its last; a Tab from there fell through to the
     * browser and landed focus on the card behind an opaque scrim, where an
     * overlay-bound Escape reached nothing and the lightbox could not be closed
     * from the keyboard at all.
     *
     * So the trap wraps from any position that is not one of its own stops, and
     * Escape no longer depends on the trap being perfect.
     * `tests/e2e/announcement-lightbox.spec.ts` reproduces both halves in a real
     * browser and owns the rest of that reasoning.
     */
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeFlyer();
        return;
      }

      if (event.key !== 'Tab') return;

      const stops = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

      if (!stops.length) return;

      const active = document.activeElement;
      const at = active instanceof HTMLElement ? stops.indexOf(active) : -1;

      // -1 is the overlay root and anything on the page behind it alike: from
      // either, the browser's own next stop is outside the lightbox.
      const leaving = event.shiftKey ? at === 0 || at === -1 : at === stops.length - 1 || at === -1;

      if (leaving) {
        event.preventDefault();
        (event.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [activeFlyer, closeFlyer]);

  return (
    <>
      {/* FILTERS */}
      {filters.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((t) => {
            const active = filter === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(t)}
                className={cn(
                  'rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition',
                  active
                    ? 'border border-ink bg-ink text-sand'
                    : 'border border-black/20 bg-transparent text-black/70 hover:border-black/40',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-8 md:grid-cols-2">
        {visible.map((flyer, i) => {
          const featured = i === 0 && filter === 'All';
          return (
            <article
              key={flyer.id}
              className={cn(
                'flex flex-col overflow-hidden border border-black/10 bg-white shadow-[0_20px_70px_-45px_rgba(16,18,20,0.45)]',
                featured && 'md:col-span-2',
              )}
            >
              <button
                type="button"
                aria-label={`Enlarge ${flyer.title}`}
                aria-describedby={`${flyer.id}-description`}
                onClick={() => openFlyer(flyer.id)}
                className="group relative block w-full cursor-zoom-in overflow-hidden bg-white"
              >
                {featured ? (
                  <Image
                    src={flyer.src}
                    alt={flyer.alt}
                    width={flyer.width}
                    height={flyer.height}
                    loading="eager"
                    className="h-auto w-full transition group-hover:scale-[1.01]"
                  />
                ) : (
                  <span className="flex aspect-[4/3] items-center justify-center bg-white">
                    <Image
                      src={flyer.src}
                      alt={flyer.alt}
                      width={flyer.width}
                      height={flyer.height}
                      loading="lazy"
                      className="h-full w-full object-contain transition group-hover:scale-[1.01]"
                    />
                  </span>
                )}
                <span className="absolute left-3.5 top-3.5 bg-sand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-ember">
                  {flyer.tag}
                </span>
              </button>
              <p id={`${flyer.id}-description`} className="sr-only">
                {flyer.alt}
              </p>
              <div className="border-t border-black/10 p-4">
                <h3
                  className={cn(
                    'font-extrabold tracking-tight',
                    featured ? 'text-2xl' : 'text-base',
                  )}
                >
                  {flyer.title}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-black/60">{flyer.date}</span>
                  <button
                    type="button"
                    onClick={() => openFlyer(flyer.id)}
                    className="text-xs font-bold uppercase tracking-[0.06em] text-ember hover:text-[#941f15]"
                  >
                    View →
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-sm text-black/60">
          No announcements in this category.
        </p>
      )}

      {activeFlyer && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeFlyer.title}
          // Keeps a click on the flyer inside the dialog subtree - without it
          // that click drops focus to <body>, outside the modal context
          // `aria-modal` promises. The keys are handled on the document above.
          tabIndex={0}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={closeFlyer}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-soft sm:right-6 sm:top-6"
            onClick={closeFlyer}
          >
            Close
          </button>
          <Image
            src={activeFlyer.src}
            alt={activeFlyer.alt}
            width={activeFlyer.width}
            height={activeFlyer.height}
            loading="eager"
            className="max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
