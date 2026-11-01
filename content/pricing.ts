type Plan = {
  name: string;
  price: string;
  /** A fact about the plan shown under its price; left off when there is none. */
  notes?: string;
  features: readonly string[];
};

export const plans: readonly Plan[] = [
  {
    name: 'Essentials',
    price: '$120/mo',
    notes: '2 classes per week',
    features: ['Adult class access', 'Flexible scheduling', 'Month-to-month billing'],
  },
  {
    name: 'Unlimited',
    price: '$150/mo',
    features: [
      'Unlimited class access',
      'Open mat access',
      'Access to Diaz on Demand',
      'Priority workshop registration',
    ],
  },
  {
    name: 'Kids Program',
    price: '$120/mo',
    notes: 'Ages 6-14',
    features: ['2-3 youth classes weekly', 'Progress tracking', 'Belt promotion support'],
  },
];
