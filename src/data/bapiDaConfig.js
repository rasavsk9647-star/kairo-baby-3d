export const MOOD_META = {
  neutral: {
    key: 'neutral',
    label: 'Neutral',
    chipLabel: 'Neutral',
    sampleLine: 'Hii! Kairo reporting for snack duty!'
  },
  pout: {
    key: 'pout',
    label: 'Pout',
    chipLabel: 'Pout',
    sampleLine: 'Hmph! Those chubby cheeks are studio property!'
  },
  giggle: {
    key: 'giggle',
    label: 'Giggle',
    chipLabel: 'Giggle',
    sampleLine: 'Hehe… okay, that cheek squish tickled!'
  },
  shocked: {
    key: 'shocked',
    label: 'Shocked',
    chipLabel: 'Shocked',
    sampleLine: 'Gasp! Did you just tug the top swirl?!'
  },
  sleepy: {
    key: 'sleepy',
    label: 'Sleepy',
    chipLabel: 'Sleepy',
    sampleLine: 'Yaaawn… five more minutes on the cloud…'
  },
  tantrum: {
    key: 'tantrum',
    label: 'Tantrum',
    chipLabel: 'Tantrum',
    sampleLine: 'KAIRO SAYS: BAS! NO MORE PINCHES!'
  }
};

export const INTERACTION_STEPS = [
  { mood: 'pout', line: 'Hey! Hands off the chubby cheeks!' },
  { mood: 'giggle', line: 'Hehe… okay, one squishy pinch is cute.' },
  { mood: 'shocked', line: 'Gasp! Careful—the top swirl is load-bearing!' },
  { mood: 'sleepy', line: 'Yaaawn… easy now, it’s almost nap time…' },
  { mood: 'tantrum', line: 'KAIRO SAYS: BAS! NO MORE PINCHES!' }
];

export const CALM_DOWN_LINES = [
  'Deep breath… okay, Kairo forgives you. Mostly.',
  'Hmph. Patience restored. Touch nicely this time!'
];

export const MARQUEE_CLIENTS = [
  'Rasavsk 9647',
  'Cloud9 Baby Co.',
  'Mishti Milk Labs',
  'Pastel Pram Studio',
  'Darjeeling Nap Co.',
  'CottonBall Bytes',
  'Lullaby Press',
  'Tiny Crown Toys'
];
