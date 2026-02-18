export type ClassBlock = {
  time: string;
  program: string;
  coach: string;
};

export type WeeklySchedule = {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  classes: ClassBlock[];
};

export const classDescriptions: Record<string, string> = {
  'Brazilian Jiu Jitsu (Gi/Gi-less)':
    'Technique-focused BJJ class covering positions, transitions, and submissions for both gi and no-gi training.',
  'Brazilian Jiu Jitsu No-Gi':
    'No-gi focused BJJ session with takedown entries, positional control, and live grappling rounds.',
  "Brazilian Jiu Jitsu Women's Only":
    "Women-only BJJ class with a supportive training environment focused on fundamentals and confidence building.",
  "Kids Brazilian Jiu Jitsu (BJJ Gi) Ages 5-13":
    'Youth BJJ gi class that builds discipline, coordination, and safe grappling habits through structured drills.',
  'Muay Thai/Muay Lao/Boxing/Kick-Boxing':
    'Striking class featuring fundamentals, pad/bag work, movement, and conditioning.',
  'Filipino Martial Arts & JKD (Equipment)':
    'Equipment-based Arnis, Escrido, and Kali class with Jeet Kune Do concepts and controlled partner training.',
  'Teen/Adult TKD Korean Karate - Weapons':
    'Teen/adult TKD weapons class emphasizing forms, control, and practical weapon-handling fundamentals.',
  'Teen/Adult TKD Korean Karate - Sparring':
    'Teen/adult TKD sparring session focused on timing, distance, and controlled live exchange.',
  'Teen/Adult Haganah (Israeli Self Defense)':
    'Israeli self-defense training with scenario-based drills, situational awareness, and practical responses.',
  'I.P.T.T. Handgun (Adult Only)':
    'Adult-only tactical handgun session under supervised instruction with safety-first protocols.',
  "Beginner Lil' Dragons (Ages 4-7)":
    'Foundational youth class for ages 4-7 focusing on focus, balance, coordination, and respect.',
  "Advanced Lil' Dragons (Ages 4-7)":
    'Progressive youth class for ages 4-7 introducing more advanced combinations and partner drills.',
  "Advanced Lil' Dragons Sparring (Ages 4-7)":
    'Light, supervised sparring progression for advanced Lil’ Dragons with emphasis on control and confidence.',
  'Beginner Juniors BTC (Ages 7-13)':
    'Beginner junior karate class developing core stances, strikes, and movement patterns.',
  'Beginner Juniors BBTC Weapons (Ages 7-13)':
    'Beginner junior weapons-focused class introducing safe handling and structured combinations.',
  'Beginner Juniors BBTC Sparring (Ages 7-13)':
    'Beginner junior sparring progression emphasizing timing, defense, and partner respect.',
  'Advanced Juniors Weapons (Ages 7-13)':
    'Advanced junior weapons class with refined combinations, accuracy, and control drills.',
  'Advanced Juniors Sparring (Ages 7-13)':
    'Advanced junior sparring training focused on distance management, counters, and tactical decisions.',
  'Junior Black Belts Weapons (Ages 10-13)':
    'Junior black belt weapons training with advanced technique refinement and discipline standards.',
  'Junior Black Belts Sparring (Ages 10-13)':
    'Junior black belt sparring class with advanced tactical rounds and coach-guided feedback.',
};

export const weeklySchedule: WeeklySchedule[] = [
  {
    day: 'Monday',
    classes: [
      { time: '7:00-8:00 AM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: '10:00-10:50 AM', program: 'Filipino Martial Arts & JKD (Equipment)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: '12:00-1:00 PM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: "5:00-5:30 PM", program: "Beginner Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '5:00-5:30 PM', program: 'Beginner Juniors BTC (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:00-5:45 PM', program: 'Beginner Juniors BBTC Weapons (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:20-5:50 PM', program: "Advanced Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '6:00-6:45 PM', program: 'Advanced Juniors Weapons (Ages 7-13)', coach: 'Kids Class' },
      { time: '6:00-6:50 PM', program: 'Teen/Adult TKD Korean Karate - Weapons', coach: 'Adult Class' },
      { time: '6:00-6:55 PM', program: 'Junior Black Belts Weapons (Ages 10-13)', coach: 'Kids Class' },
      { time: '7:00-8:00 PM', program: 'Teen/Adult Haganah (Israeli Self Defense)', coach: 'Adult Class' },
      { time: '8:10-9:10 PM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      { time: '7:00-8:00 AM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: "5:00-5:45 PM", program: 'Advanced Juniors Weapons (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:00-5:50 PM', program: 'Teen/Adult TKD Korean Karate - Weapons', coach: 'Adult Class' },
      { time: '5:00-5:55 PM', program: 'Junior Black Belts Weapons (Ages 10-13)', coach: 'Kids Class' },
      { time: "6:00-6:30 PM", program: "Beginner Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '6:00-6:30 PM', program: 'Beginner Juniors BTC (Ages 7-13)', coach: 'Kids Class' },
      { time: '6:00-6:45 PM', program: 'Beginner Juniors BBTC Weapons (Ages 7-13)', coach: 'Kids Class' },
      { time: "6:25-6:55 PM", program: "Advanced Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '7:00-8:00 PM', program: 'Teen/Adult Haganah (Israeli Self Defense)', coach: 'Adult Class' },
      { time: '8:10-9:10 PM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { time: '7:00-8:00 AM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: '10:00-10:50 AM', program: 'Filipino Martial Arts & JKD (Equipment)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: '12:00-1:00 PM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: "5:00-5:30 PM", program: "Beginner Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '5:00-5:30 PM', program: 'Beginner Juniors BTC (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:00-5:45 PM', program: 'Beginner Juniors BBTC Sparring (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:20-5:50 PM', program: "Advanced Lil' Dragons Sparring (Ages 4-7)", coach: 'Kids Class' },
      { time: '6:00-6:45 PM', program: 'Advanced Juniors Sparring (Ages 7-13)', coach: 'Kids Class' },
      { time: '6:00-6:50 PM', program: 'Teen/Adult TKD Korean Karate - Sparring', coach: 'Adult Class' },
      { time: '6:00-6:55 PM', program: 'Junior Black Belts Sparring (Ages 10-13)', coach: 'Kids Class' },
      { time: '7:00-8:00 PM', program: 'Teen/Adult Haganah (Israeli Self Defense)', coach: 'Adult Class' },
      { time: '8:10-9:10 PM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      { time: '7:00-8:00 AM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: "5:00-5:45 PM", program: 'Advanced Juniors Sparring (Ages 7-13)', coach: 'Kids Class' },
      { time: '5:00-5:50 PM', program: 'Teen/Adult TKD Korean Karate - Weapons', coach: 'Adult Class' },
      { time: '5:00-5:55 PM', program: 'Junior Black Belts Sparring (Ages 10-13)', coach: 'Kids Class' },
      { time: "6:00-6:30 PM", program: "Beginner Lil' Dragons (Ages 4-7)", coach: 'Kids Class' },
      { time: '6:00-6:30 PM', program: 'Beginner Juniors BTC (Ages 7-13)', coach: 'Kids Class' },
      { time: '6:00-6:45 PM', program: 'Beginner Juniors BBTC Sparring (Ages 7-13)', coach: 'Kids Class' },
      { time: "6:25-6:55 PM", program: "Advanced Lil' Dragons Sparring (Ages 4-7)", coach: 'Kids Class' },
      { time: '7:00-8:00 PM', program: 'Teen/Adult Haganah (Israeli Self Defense)', coach: 'Adult Class' },
      { time: '8:10-9:10 PM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Friday',
    classes: [
      { time: '7:00-8:00 AM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: '12:00-1:00 PM', program: 'Brazilian Jiu Jitsu No-Gi', coach: 'Adult Class' },
      { time: '5:00-5:45 PM', program: "Kids Brazilian Jiu Jitsu (BJJ Gi) Ages 5-13", coach: 'Kids Class' },
      { time: '6:00-6:50 PM', program: 'Filipino Martial Arts & JKD (Equipment)', coach: 'Adult Class' },
      { time: "6:00-7:00 PM", program: "Brazilian Jiu Jitsu Women's Only", coach: 'Adult Class' },
      { time: '7:00-7:50 PM', program: 'I.P.T.T. Handgun (Adult Only)', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Saturday',
    classes: [
      { time: '9:00-9:50 AM', program: 'I.P.T.T. Handgun (Adult Only)', coach: 'Adult Class' },
      { time: "10:00-10:45 AM", program: "Kids Brazilian Jiu Jitsu (BJJ Gi) Ages 5-13", coach: 'Kids Class' },
      { time: '10:00-10:50 AM', program: 'Filipino Martial Arts & JKD (Equipment)', coach: 'Adult Class' },
      { time: '11:00-11:50 AM', program: 'Muay Thai/Muay Lao/Boxing/Kick-Boxing', coach: 'Adult Class' },
      { time: '12:00-1:00 PM', program: 'Brazilian Jiu Jitsu (Gi/Gi-less)', coach: 'Adult Class' },
    ],
  },
  {
    day: 'Sunday',
    classes: [],
  },
];
