import { site } from '@/content/site';

export function AnnouncementBar() {
  const announcement = site.announcement;

  if (!announcement.enabled) return null;

  return (
    <div className="bg-ink text-sand">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] sm:px-6 lg:px-8">
        <span className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
          <span>{announcement.message}</span>
        </span>
        <span className="hidden items-center gap-6 text-white/65 md:flex">
          <a href={site.phoneHref} className="hover:text-white">
            {site.phone}
          </a>
        </span>
      </div>
    </div>
  );
}
