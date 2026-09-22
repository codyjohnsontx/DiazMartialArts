/**
 * What a flyer's date row says when the flyer prints no start date or expiry.
 * Written once and read by both the feed in `app/announcements/page.tsx` and
 * the card in `components/AnnouncementFlyerGallery.tsx`, so the one place that
 * has to tell a real date from this placeholder compares against it rather
 * than re-spelling it.
 *
 * It lives here rather than beside that card because the card is a
 * `'use client'` module, and every export of one is a client reference on the
 * server: a server component importing this from there holds a proxy rather
 * than a string, so the first server-side read of a flyer's date - sorting the
 * feed, or emitting Event markup the way /schedule does - would throw instead
 * of comparing.
 */
export const NO_END_DATE = 'No end date listed';
