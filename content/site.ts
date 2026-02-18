export const site = {
  name: 'Diaz Martial Arts',
  tagline: 'Martial arts training for kids, teens, and adults in a disciplined, welcoming gym.',
  description:
    'Diaz Martial Arts offers Brazilian Jiu Jitsu, Muay Thai, Karate, self-defense, and youth programs focused on confidence, skill, and community.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  phone: '(512) 392-4763',
  email: 'diazmartialarts@gmail.com',
  address: {
    street: '2061 Clovis Barker Rd Suite 13a',
    city: 'San Marcos',
    state: 'TX',
    zip: '78666',
    country: 'US',
  },
  socials: {
    instagram: 'https://www.instagram.com/diazmartialarts_/',
    facebook: 'https://www.facebook.com/diazmasm',
    youtube: '',
  },
  hours: [
    'Mon-Fri: 7:00 AM - 9:00 PM',
    'Sat: 8:00 AM - 1:00 PM',
    'Sun: Closed',
  ],
  ctas: {
    primary: {
      label: 'Book a Free Trial',
      href: '/contact',
    },
    secondary: {
      label: 'View Schedule',
      href: '/schedule',
    },
  },
  announcement: {
    enabled: true,
    message: 'Two months free with purchase of GI.',
    link: '/pricing',
    linkLabel: 'See pricing',
  },
};

export type Site = typeof site;
