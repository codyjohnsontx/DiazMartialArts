export type UpcomingItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  location?: string;
  notes?: string;
};

// Genuine scheduled events only, or nothing at all. Everything listed here is
// published on /schedule as a real event a member could show up for, so never
// add placeholder or example entries. An empty list is a supported state: the
// "Upcoming events" section renders a deliberate empty state for it.
export const upcomingItems: UpcomingItem[] = [];
