import { getPublicEnv } from '@/lib/env';
import { formatOpeningHours, type OpeningHoursRule } from '@/lib/openingHours';

const publicEnv = getPublicEnv();

const openingHours: OpeningHoursRule[] = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    label: 'Mon-Fri',
    opens: '07:00',
    closes: '21:00',
  },
  { days: ['Saturday'], label: 'Sat', opens: '08:00', closes: '13:00' },
  { days: ['Sunday'], label: 'Sun', opens: null, closes: null },
];

export const site = {
  name: 'Diaz Martial Arts',
  tagline: 'Martial arts training for kids, teens, and adults in a disciplined, welcoming gym.',
  description:
    'Diaz Martial Arts offers Brazilian Jiu Jitsu, Muay Thai, Karate, self-defense, and youth programs focused on confidence, skill, and community.',
  url: publicEnv.siteUrl,
  phone: '(512) 392-4763',
  phoneHref: 'tel:+15123924763',
  email: 'diazmartialarts@gmail.com',
  address: {
    street: '2061 Clovis Barker Rd Suite 13a',
    city: 'San Marcos',
    state: 'TX',
    zip: '78666',
    country: 'US',
  },
  geo: {
    latitude: '29.8833',
    longitude: '-97.9414',
  },
  serviceArea: ['San Marcos', 'Kyle', 'Buda', 'New Braunfels'],
  socials: {
    instagram: 'https://www.instagram.com/diazmasm/',
    facebook: 'https://www.facebook.com/diazmasm',
    youtube: '',
  },
  // The lines a reader sees. `openingHours` is the same information as data,
  // for the markup; both come from the one list above.
  hours: formatOpeningHours(openingHours),
  openingHours,
  ctas: {
    primary: {
      label: 'Book a Free Trial',
      href: '/contact',
    },
    secondary: {
      label: 'View Schedule',
      href: '/schedule',
    },
    coaches: {
      label: 'Meet the Coaches',
      href: '/coaches',
    },
  },
};

export type Site = typeof site;
