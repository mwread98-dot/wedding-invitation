export type WeddingEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
};

export type TimelineItem = { time: string; title: string; note?: string };

export const wedding = {
  partners: ['Max', 'Harriet'] as const,
  date: '2027-07-17T13:30:00+01:00',
  displayDate: 'Saturday, 17 July 2027',
  venue: 'Low Osgoodby Grange',
  address: 'Low Osgoodby Grange, Thirsk YO7 2AL',
  location: 'Thirsk, North Yorkshire',
  contactEmail: 'HTMR1998@outlook.com',
  rsvpDeadline: '2027-04-10T23:59:59+01:00',
  introduction:
    'We would be delighted if you would join us for a day of good food, happy tears and dancing beneath the summer sky.',
  heroImage:
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2000&q=85',
  events: [
    {
      title: 'The ceremony',
      date: 'Saturday, 17 July 2027',
      time: '1.30 pm',
      location: 'Low Osgoodby Grange',
      description: 'Please arrive from 12.45 pm and be seated by 1.15 pm.',
    },
    {
      title: 'The reception',
      date: 'Saturday, 17 July 2027',
      time: '2.15 pm – 11.30 pm',
      location: 'Low Osgoodby Grange',
      description: 'Drinks, dinner and dancing will follow in the garden and main house.',
    },
  ] satisfies WeddingEvent[],
  timeline: [
    { time: '12.45', title: 'Guest arrival', note: 'Drinks on the terrace' },
    { time: '13.30', title: 'Ceremony' },
    { time: '14.15', title: 'Garden drinks & photographs' },
    { time: '16.00', title: 'Wedding breakfast' },
    { time: '18.30', title: 'Speeches' },
    { time: '20.00', title: 'Evening reception' },
    { time: '20.30', title: 'First dance' },
    { time: '22.00', title: 'Late-night food' },
    { time: '00.00', title: 'Carriages' },
  ] satisfies TimelineItem[],
  travel: {
    rail: 'The nearest station is Thirsk, around 15 minutes away by taxi.',
    parking: 'Complimentary parking is available at the venue from 12.30 pm until noon on Sunday.',
    taxis:
      'Please pre-book your taxi.',
  },
  accommodation: [
    { name: 'The Bell at Stow', detail: 'Boutique inn · 12 minutes by taxi' },
    { name: 'The Old Stocks Inn', detail: 'Town-centre hotel · 14 minutes by taxi' },
    { name: 'Cotswold House Hotel', detail: 'Hotel and spa · 18 minutes by taxi' },
  ],
  faq: [
    {
      question: 'What should I wear?',
      answer:
        'Morning dress or lounge suits, and summer dresses. The ceremony and drinks may be outside, so choose shoes with grass in mind.',
    },
    {
      question: 'Can I bring children?',
      answer:
        'Your invitation lists everyone included. If your children are named, we would love them to join us.',
    },
    {
      question: 'Can I bring a plus one?',
      answer: 'If a plus one is included, you will see the option when you RSVP.',
    },
    {
      question: 'What time should I arrive?',
      answer: 'Please arrive from 12.45 pm and take your seat by 1.15 pm.',
    },
    {
      question: 'Is there parking?',
      answer: 'Yes. Follow signs for wedding parking when you enter the estate.',
    },
    {
      question: 'When should I RSVP?',
      answer: 'Please reply by 10 April 2027 using your personal invitation link.',
    },
    {
      question: 'Who should I contact?',
      answer: 'Email hello@example-wedding.co.uk and we will be happy to help.',
    },
  ],
} as const;

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${wedding.venue}, ${wedding.address}`)}`;
