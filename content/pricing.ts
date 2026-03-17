export const plans = [
  {
    name: 'Essentials',
    price: '$120/mo',
    notes: '2 classes per week',
    features: ['Adult class access', 'Flexible scheduling', 'Month-to-month billing'],
  },
  {
    name: 'Unlimited',
    price: '$150/mo',
    notes: 'Most popular',
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
] as const;
