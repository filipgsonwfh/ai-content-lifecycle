// Stena Line design tokens (mirrors ds.css) + channel metadata.
export const SL = {
  coreBlue: '#004a93',
  mussla: '#122f66',
  modernBlue: '#1178df',
  himmel: '#b4d4f9',
  himmelLight: '#cae2fb',
  himmelLighter: '#e1edfd',
  hav: 'rgb(26, 90, 154)',
  blue700: '#18518a',
  blue900: '#0f304d',
  sand: '#faf6eb',
  molnigare: '#fafaf8',
  sjobod: '#b00f2e',
  tang: '#80091b',
  snackskal: '#fbd4cd',
  snackskalLight: '#fce1db',
  green600: '#509e27',
  green700: '#407e1f',
  green100: '#d1efc1',
  green50: '#f4fbf0',
  orange400: '#ffb633',
  orange500: '#ffa400',
  orange100: '#ffe184',
  orange50: '#fff8eb',
  orange900: '#895800',
  red500: '#d70029',
  red100: '#fce1db',
  red50: '#fff1f4',
  turq500: '#28d2b9',
  turq700: '#1c9280',
  turq100: '#daf8f4',
  ui50: '#ffffff',
  ui100: '#fafafb',
  ui200: '#f4f4f4',
  ui300: '#ebebeb',
  ui400: '#c9c9c9',
  ui500: '#949494',
  ui600: '#5c6171',
  ui700: '#424551',
  ui800: '#282931',
  ui900: '#000000',
  white: '#ffffff',
};

export const CHANNELS = {
  website: { label: 'Website', icon: 'globe', tone: 'blue', color: SL.modernBlue },
  app: { label: 'App', icon: 'smartphone', tone: 'turq', color: SL.turq500 },
  email: { label: 'Email', icon: 'mail', tone: 'orange', color: SL.orange500 },
  social: { label: 'Social', icon: 'megaphone', tone: 'red', color: SL.sjobod },
  onboard: { label: 'Onboard', icon: 'ship', tone: 'dark', color: SL.mussla },
};

export const CHANNEL_KEYS = Object.keys(CHANNELS);

export const STATES = {
  queued: { tone: 'neutral', label: 'Queued', icon: 'inbox' },
  generating: { tone: 'blue', label: 'Generating', icon: 'sparkles' },
  pending: { tone: 'orange', label: 'In review', icon: 'clock' },
  iterating: { tone: 'blue', label: 'Iterating', icon: 'refresh-cw' },
  translating: { tone: 'turq', label: 'Translating', icon: 'languages' },
  approved: { tone: 'green', label: 'Approved', icon: 'check-circle-2' },
  rejected: { tone: 'red', label: 'Rejected', icon: 'x-circle' },
};

// Public-dir asset helper (GitHub Pages base-path safe)
export const asset = (p) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

export const FERRY_IMAGES = [
  asset('ds/images/ferry-2.jpg'), // golden hour
  asset('ds/images/ferry-3.jpg'), // soft dawn
  asset('ds/images/ferry-1.jpg'), // overcast
  asset('ds/images/ferry-4.jpg'), // daylight
];
