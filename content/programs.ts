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
    slug: 'beginner-lil-dragons',
    title: "Beginner Lil' Dragons",
    short: "Beginner Lil' Dragons",
    image: '/youth/beginner-lil-dragons.jpg',
    sub: 'Ages 4-7',
    description:
      'A first martial arts class for younger kids focused on listening, balance, coordination, confidence, and basic karate habits.',
    age: 'Ages 4-7',
    level: 'Beginner',
    tag: 'Youth',
    scheduleMatchers: ["Beginner Lil' Dragons"],
  },
  {
    slug: 'advanced-lil-dragons',
    title: "Advanced Lil' Dragons",
    short: "Advanced Lil' Dragons",
    image: '/youth/advanced-lil-dragons.jpg',
    sub: 'Ages 4-7',
    description:
      'A next-step Lil’ Dragons track for young students ready for more advanced combinations, focus, and supervised sparring days.',
    age: 'Ages 4-7',
    level: 'Intermediate',
    tag: 'Youth',
    scheduleMatchers: ["Advanced Lil' Dragons"],
  },
  {
    slug: 'beginner-juniors',
    title: 'Beginner Juniors',
    short: 'Beginner Juniors BTC and BBTC',
    image: '/youth/beginner-juniors.jpg',
    sub: 'Ages 7-13',
    description:
      'Beginner junior karate for school-age kids, with BTC basics plus BBTC weapons and sparring options as students progress.',
    age: 'Ages 7-13',
    level: 'Beginner',
    tag: 'Youth',
    scheduleMatchers: ['Beginner Juniors'],
  },
  {
    slug: 'advanced-juniors',
    title: 'Advanced Juniors',
    short: 'Advanced Juniors Weapons and Sparring',
    image: '/youth/advanced-juniors.jpg',
    sub: 'Ages 7-13',
    description:
      'Advanced junior karate classes for students building sharper weapons skills, sparring timing, discipline, and confidence.',
    age: 'Ages 7-13',
    level: 'Intermediate to advanced',
    tag: 'Youth',
    scheduleMatchers: ['Advanced Juniors'],
  },
  {
    slug: 'junior-black-belts',
    title: 'Junior Black Belts',
    short: 'Junior Black Belt training',
    image: '/youth/junior-black-belts.jpg',
    sub: 'Ages 10-13',
    description:
      'Higher-level youth training for junior black belts, with advanced weapons and sparring classes for continued growth.',
    age: 'Ages 10-13',
    level: 'Advanced',
    tag: 'Youth',
    scheduleMatchers: ['Junior Black Belts'],
  },
  {
    slug: 'kids-brazilian-jiu-jitsu',
    title: 'Kids Brazilian Jiu Jitsu',
    short: 'Kids BJJ Gi and Gi-less',
    image: '/youth/kids-brazilian-jiu-jitsu.jpg',
    sub: 'Ages 5-13',
    description:
      'Youth Brazilian Jiu Jitsu classes for kids learning safe grappling fundamentals, body control, confidence, and mat discipline.',
    age: 'Ages 5-13',
    level: 'All levels',
    tag: 'Youth',
    scheduleMatchers: ['Kids Brazilian Jiu Jitsu'],
  },
];
