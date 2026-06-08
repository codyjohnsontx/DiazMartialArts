'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  width: number;
  height: number;
};

type AnnouncementFlyerGalleryProps = {
  flyers: AnnouncementFlyer[];
};

const filters: ('All' | FlyerCategory)[] = [
  'All',
  'Events',
  'Promos',
  'Testings',
  'Closures',
];

export function AnnouncementFlyerGallery({ flyers }: AnnouncementFlyerGalleryProps) {
  const [filter, setFilter] = useState<'All' | FlyerCategory>('All');
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

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

  function closeFlyer() {
    setActiveId(null);
  }

  useEffect(() => {
    if (!activeFlyer) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [activeFlyer]);

  function onDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFlyer();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      {/* FILTERS */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filters.map((t) => {
          const active = filter === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={cn(
                'rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-[0.06em] transition',
                active
                  ? 'border border-ink bg-ink text-sand'
                  : 'border border-black/18 bg-transparent text-black/70 hover:border-black/40',
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

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
                aria-label={`Enlarge ${flyer.alt}`}
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
                  <span className="text-xs font-semibold text-black/60">
                    {flyer.date}
                  </span>
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
          aria-label={activeFlyer.alt}
          tabIndex={0}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 sm:p-8"
          onClick={closeFlyer}
          onKeyDown={onDialogKeyDown}
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
