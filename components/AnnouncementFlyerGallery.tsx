'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type AnnouncementFlyer = {
  id: string;
  src: string;
  alt: string;
};

type AnnouncementFlyerGalleryProps = {
  flyers: AnnouncementFlyer[];
};

export function AnnouncementFlyerGallery({ flyers }: AnnouncementFlyerGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

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
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {flyers.map((flyer) => (
          <button
            key={flyer.id}
            type="button"
            aria-label={`Enlarge ${flyer.alt}`}
            className="block cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-white p-0 text-left shadow-[0_20px_70px_-45px_rgba(16,18,20,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-48px_rgba(16,18,20,0.55)]"
            onClick={() => openFlyer(flyer.id)}
          >
            <Image
              src={flyer.src}
              alt={flyer.alt}
              width={1650}
              height={1275}
              loading="eager"
              className="h-auto w-full"
            />
          </button>
        ))}
      </div>

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
            width={1650}
            height={1275}
            loading="eager"
            className="max-h-full w-auto max-w-full rounded-lg bg-white object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
