export type ProgramTag =
  | 'Grappling'
  | 'Striking'
  | 'Self-Defense'
  | 'Weapons'
  | 'Tactical'
  | 'Youth';

export type Program = {
  slug: string;
  title: string;
  short: string;
  sub: string;
  description: string;
  age: string;
  level: string;
  tag: ProgramTag;
  image?: string;
  scheduleMatchers: string[];
};

export const programs: Program[] = [
  {
    slug: 'brazilian-jiu-jitsu',
    title: 'Brazilian Jiu Jitsu',
    short: 'Brazilian Jiu Jitsu (Gi/Gi-less)',
    image: '/bjj.jpg',
    sub: 'Gi & No-Gi',
    description:
      'Adult and kids BJJ classes offered in gi and no-gi formats with morning, lunch, evening, and weekend sessions.',
    age: 'Kids and Adults',
    level: 'All levels',
    tag: 'Grappling',
    scheduleMatchers: ['Brazilian Jiu Jitsu', 'BJJ'],
  },
  {
    slug: 'muay-thai-kickboxing',
    title: 'Muay Thai · Boxing · Kickboxing',
    short: 'Muay Thai / Muay Lao / Boxing / Kick-Boxing',
    image: '/muaythai.webp',
    sub: 'Striking',
    description:
      'Striking classes focused on technique, conditioning, and practical pad and bag work in a structured format.',
    age: 'Adults 16+',
    level: 'All levels',
    tag: 'Striking',
    scheduleMatchers: ['Muay Thai'],
  },
  {
    slug: 'haganah',
    title: 'Haganah',
    short: 'Teen/Adult Haganah (Israeli Self Defense System)',
    image: '/haganah.jpg',
    sub: 'Israeli Self-Defense',
    description:
      'Structured self-defense training for teens and adults with practical scenario-based instruction.',
    age: 'Teens and Adults',
    level: 'All levels',
    tag: 'Self-Defense',
    scheduleMatchers: ['Haganah'],
  },
  {
    slug: 'tkd-korean-karate',
    title: 'TKD Korean Karate',
    short: 'Teen/Adult TKD Korean Karate System',
    sub: 'Forms · Weapons · Sparring',
    description:
      'Traditional and modern karate training including weapons and live sparring sessions.',
    age: 'Teens and Adults',
    level: 'All levels',
    tag: 'Striking',
    scheduleMatchers: ['TKD Korean Karate'],
  },
  {
    slug: 'filipino-martial-arts-jkd',
    title: 'Filipino Martial Arts & JKD',
    short: 'Filipino Martial Arts & Jeet Kune Do (JKD)',
    image: '/kali.jpg',
    sub: 'Arnis · Escrido · Kali',
    description:
      'Weapons-focused training in Arnis, Escrido, and Kali with equipment-based classes and JKD principles.',
    age: 'Adults',
    level: 'All levels',
    tag: 'Weapons',
    scheduleMatchers: ['Filipino Martial Arts'],
  },
  {
    slug: 'iptt-tactical',
    title: 'I.P.T.T. Tactical',
    short: 'Israeli Professional Tactical Training Course (I.P.T.T.)',
    sub: 'Israeli Pro Tactical Training',
    description: 'Adult-only handgun and rifle tactical sessions on designated weekly time slots.',
    age: 'Adults only',
    level: 'Intermediate to advanced',
    tag: 'Tactical',
    scheduleMatchers: ['I.P.T.T.'],
  },
  {
    slug: 'kids-lil-dragons-juniors',
    title: "Kids: Lil' Dragons & Juniors",
    short: "Kids Programs (Lil' Dragons, Juniors, Junior Black Belts)",
    image: '/lil-dragon.jpg',
    sub: 'Ages 4–13',
    description:
      'Age-grouped kids karate tracks with BTC/BBTC, weapons, sparring, and kids BJJ sessions.',
    age: 'Ages 4–13',
    level: 'Beginner to advanced',
    tag: 'Youth',
    scheduleMatchers: ["Lil' Dragons", 'Junior'],
  },
];
