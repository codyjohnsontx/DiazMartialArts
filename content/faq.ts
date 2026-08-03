export type FaqItem = { question: string; answer: string };
export type FaqGroup = { name: string; items: FaqItem[] };

export const faqGroups: FaqGroup[] = [
  {
    name: 'Getting started',
    items: [
      {
        question: 'Do I need prior experience to start?',
        answer:
          'No. Most new students begin in our Fundamentals classes where we cover everything step by step.',
      },
      {
        question: 'What should I bring to my trial class?',
        answer:
          'Wear comfortable athletic clothing, bring water, and arrive 15 minutes early for check-in.',
      },
      {
        question: 'How long is a typical class?',
        answer:
          'Adult classes run 50–60 minutes. Kids classes range from 30–45 minutes depending on age group.',
      },
    ],
  },
  {
    name: 'Membership',
    items: [
      {
        question: 'Is there a contract?',
        answer:
          'We offer both month-to-month and annual plans. Contact the front desk for current options.',
      },
      {
        question: 'Can I freeze my membership?',
        answer:
          'Yes. Short freezes are supported for travel, illness, or injury. Contact the front desk to arrange.',
      },
      {
        question: 'Do you offer family discounts?',
        answer:
          '20% off the second family member, 30% off the third+. Speak with the front desk to set it up.',
      },
    ],
  },
  {
    name: 'Kids program',
    items: [
      {
        question: 'Do you offer classes for kids?',
        answer:
          'Yes. Our youth program serves ages 4–13 with age-grouped classes and clear progression tracks.',
      },
      {
        question: 'When can my child test for belt promotion?',
        answer:
          'Promotions happen quarterly based on attendance, technique benchmarks, and coach approval.',
      },
    ],
  },
];

export const faq: FaqItem[] = faqGroups.flatMap((g) => g.items);
