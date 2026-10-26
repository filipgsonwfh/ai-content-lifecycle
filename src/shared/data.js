// Seed data for AI Content Lifecycle Platform — Stena-realistic mock content.
import { minsAgo, hoursAgo, daysAgo } from './time.js';

export const USER = { name: 'Julia Bergström', role: 'Content editor · UK/IE', initials: 'JB' };

const act = (who, what, when, icon, color) => ({ id: `${who}-${when}-${Math.random().toString(36).slice(2, 7)}`, who, what, when, icon, color });

// ---------- Website content ----------
const WEBSITE_CONTENT = {
  seoTargets: [
    { keyword: 'ferry holyhead to dublin', current: 6, projected: 3, traffic: '12.4k', volume: '49.5k' },
    { keyword: 'spring ferry dublin', current: 19, projected: 8, traffic: '850', volume: '4.4k' },
    { keyword: 'cheap ferry to ireland', current: 14, projected: 9, traffic: '2.1k', volume: '22k' },
    { keyword: 'stena line spring offers', current: 4, projected: 2, traffic: '1.6k', volume: '2.9k' },
    { keyword: 'family ferry holyhead dublin', current: 22, projected: 11, traffic: '410', volume: '1.8k' },
  ],
  seoSummary: { position: '11.4 → 6.6', positionDelta: '↑ 4.8', clicks: '17.4k → 24.1k', clicksDelta: '+38%' },
  fields: [
    { name: 'Page title (H1)', type: 'single-line', limit: 70, before: 'Holyhead to Dublin Ferry · Stena Line', after: 'Spring sailings to Dublin from Holyhead — from £79' },
    { name: 'Meta description', type: 'single-line', limit: 160, before: 'Sail with Stena Line from Holyhead to Dublin in 3h 30m. Book ferry tickets online and save.', after: 'Spring ferry crossings from Holyhead to Dublin in 3h 30m on the refitted Stena Adventurer. Free changes up to 24h before sailing — fares from £79.' },
    { name: 'Hero headline', type: 'single-line', limit: 80, before: 'Holyhead to Dublin — easy crossings every day', after: 'Sail to Dublin this spring — calm crossings, room to breathe' },
    { name: 'Hero supporting copy', type: 'multi-line', limit: 280, before: 'Five sailings a day from Holyhead to Dublin Port. The crossing takes 3h 30m and you can take your car, your dog, or your bike.', after: 'Five daily sailings from Holyhead to Dublin Port — now with an earlier 06:55 departure Monday to Friday. Bring the car, the dog, the bike, or just yourself. The crossing takes 3h 30m on the refitted Stena Adventurer, with new family lounges and Hygge Recline seating.' },
    { name: 'Body — Why sail with us', type: 'rich-text', limit: 1200, before: 'Stena Line has been sailing the Irish Sea for over 50 years. Our ships are comfortable, our crew is friendly, and our timetables are reliable.', after: 'Half a century of crossings between Wales and Ireland — and this spring, a quieter way to do it. The newly refitted Stena Adventurer brings Hygge Recline cabins, refreshed family lounges, and a Café Lagom serving Swedish smörgåsbord every afternoon. Spring fares start from £79 each way and you can change your booking free of charge up to 24 hours before sailing.' },
    { name: 'CTA label', type: 'single-line', limit: 20, before: 'Book ferry now', after: 'Find spring sailings' },
  ],
  previewUrl: 'stenaline.co.uk/uk/routes/holyhead-dublin/spring-sailings',
  fragment: { path: 'route-landing/holyhead-dublin-spring', model: 'stena/route-landing-v3', langs: ['en', 'nl', 'de', 'sv'], published: '12 Mar 2026 · 09:14 UTC' },
};

const CAIRNRYAN_CONTENT = {
  seoTargets: [
    { keyword: 'cairnryan belfast ferry', current: 3, projected: 2, traffic: '18.1k', volume: '40.5k' },
    { keyword: 'easter ferry to belfast', current: 15, projected: 7, traffic: '620', volume: '3.6k' },
    { keyword: 'scotland to northern ireland ferry', current: 5, projected: 4, traffic: '4.4k', volume: '12.1k' },
  ],
  seoSummary: { position: '7.7 → 4.3', positionDelta: '↑ 3.4', clicks: '23.1k → 27.9k', clicksDelta: '+21%' },
  fields: [
    { name: 'Page title (H1)', type: 'single-line', limit: 70, before: 'Cairnryan to Belfast Ferry · Stena Line', after: 'Cairnryan to Belfast this Easter — extra sailings, 2h 15m crossing' },
    { name: 'Meta description', type: 'single-line', limit: 160, before: 'Sail from Cairnryan to Belfast with Stena Line. Up to six sailings a day.', after: 'Easter timetable: up to seven daily sailings from Cairnryan to Belfast in 2h 15m on Stena Superfast VII and VIII. Fares from £89 with the car.' },
    { name: 'Hero headline', type: 'single-line', limit: 80, before: 'Cairnryan to Belfast — the short way across', after: 'Easter in Northern Ireland starts on deck' },
    { name: 'Hero supporting copy', type: 'multi-line', limit: 280, before: 'Six sailings a day between Scotland and Belfast in 2h 15m.', after: 'Seven sailings a day over the Easter weekend, including a late 23:30 departure on Good Friday. Two hours fifteen on the Superfast, then straight onto the M2.' },
    { name: 'CTA label', type: 'single-line', limit: 20, before: 'Book now', after: 'See Easter sailings' },
  ],
  previewUrl: 'stenaline.co.uk/uk/routes/cairnryan-belfast/easter',
  fragment: { path: 'route-landing/cairnryan-belfast-easter', model: 'stena/route-landing-v3', langs: ['en', 'nl', 'de', 'sv'], published: '09 Mar 2026 · 15:40 UTC' },
};

const EMAIL_CONTENT = {
  fields: [
    { name: 'Subject line', limit: 60, value: 'Last cabins on the May Bank Holiday boat to Dublin' },
    { name: 'Preheader', limit: 110, value: 'Bring the car for £79 each way — the 240 cabins left will go fast.' },
    { name: 'Headline', limit: 70, value: 'Three days in Dublin, the car for the trip, £79 each way.' },
    { name: 'Body paragraph', limit: 600, value: "It's been a while, and the May Bank Holiday weekend has snuck up on us. We've held back 240 cabins on the Holyhead to Dublin sailings on Friday 1 May and Monday 4 May — and they're yours for £79 each way when you bring the car. Three and a half hours of Irish Sea, then three days wherever you fancy. We'll have a Hygge Recline seat and a coffee waiting." },
    { name: 'Primary CTA', limit: 24, value: 'Book by 5 May from £79' },
    { name: 'Secondary link', limit: 32, value: 'See all spring sailings' },
  ],
  perfRefs: [
    { subject: 'Empty cabins on the Friday boat to Dublin', openRate: 38.2, ctr: 6.4, delta: '+11pp open' },
    { subject: '£79 each way · car included · this weekend only', openRate: 31.7, ctr: 5.1, delta: 'Top CTR Q1' },
    { subject: "You haven't sailed with us in a while — here's £20", openRate: 29.4, ctr: 4.2, delta: 'Lapsed segment' },
  ],
};

const SOCIAL_CONTENT = {
  posts: [
    { platform: 'Instagram', limit: 2200, color: '#E1306C', caption: 'Three and a half hours of Irish Sea, then Dublin.\n\nThe new Hygge Recline seats on Stena Estrid are out — calmer light, less noise, more horizon. Spring fares from £79 each way with the car.\n\nLink in bio for spring sailings.', hashtags: '#StenaLine #HolyheadDublin #IrishSea #FerryTravel #SpringTravel #VisitIreland' },
    { platform: 'LinkedIn', limit: 3000, color: '#0A66C2', caption: "Stena Estrid is back in service this week with a refit focused on one thing: quieter crossings.\n\nNew Hygge Recline cabins, refreshed family lounges, and a Café Lagom that's been wanting to happen for a while. The result is a crossing that gives you 3h 30m of usable time — work, read, sleep, watch the sea — instead of 3h 30m to be endured.\n\nSpring fares on the Holyhead–Dublin route start from £79 each way." },
    { platform: 'Facebook', limit: 63206, color: '#1877F2', caption: 'New Hygge Recline cabins are sailing on Stena Estrid from this week 🌊\n\nCalmer crossings between Holyhead and Dublin — from £79 each way with the car. Five sailings a day, with the new earlier 06:55 departure on weekdays.\n\nFind spring sailings → stenaline.co.uk' },
    { platform: 'X / Twitter', limit: 280, color: '#000000', caption: 'New Hygge Recline cabins on Stena Estrid this week. Holyhead → Dublin in 3h 30m, from £79 each way with the car.\n\nstenaline.co.uk/onboard/hygge' },
  ],
  perfRefs: [
    { platform: 'Instagram', metric: 'Carousel posts', value: '+34% saves vs static' },
    { platform: 'LinkedIn', metric: 'Long captions', value: '+18% dwell time' },
    { platform: 'X', metric: 'One-link tweets', value: '+22% CTR' },
  ],
};

const HOEK_SOCIAL_CONTENT = {
  posts: [
    { platform: 'Instagram', limit: 2200, color: '#E1306C', caption: 'Harwich to Hoek van Holland, but make it premium.\n\nThe new Stena Plus lounge opens 1 April: quieter seating, barista coffee, and a window seat for the whole North Sea.\n\nLink in bio.', hashtags: '#StenaLine #StenaPlus #NorthSea #HarwichHoek' },
    { platform: 'LinkedIn', limit: 3000, color: '#0A66C2', caption: 'From 1 April, Stena Britannica and Stena Hollandica sail with a redesigned Stena Plus lounge — a dedicated quiet deck for people who want to work or rest across the North Sea.' },
  ],
  perfRefs: [
    { platform: 'Instagram', metric: 'Lounge reveals', value: '+41% reach' },
    { platform: 'LinkedIn', metric: 'B2B travel posts', value: '+9% follows' },
  ],
};

const APP_CONTENT = {
  fields: [
    { name: 'screen.headline', type: 'single-line', limit: 32, value: 'Your deck is on its way' },
    { name: 'screen.body', type: 'multi-line', limit: 120, value: "We assign vehicle decks 2 hours before sailing. We'll let you know — no need to refresh." },
    { name: 'screen.cta_primary', type: 'single-line', limit: 16, value: 'Got it' },
    { name: 'screen.cta_secondary', type: 'single-line', limit: 16, value: 'Set a reminder' },
    { name: 'screen.illustration_alt', type: 'a11y', limit: 120, value: 'Illustration of a ferry icon with a ticket badge, indicating boarding details are pending.' },
  ],
  translations: {
    SV: ['Ditt däck är på väg', 'Vi tilldelar fordonsdäck 2 timmar före avgång. Vi hör av oss — du behöver inte uppdatera.', 'Uppfattat', 'Påminn mig', 'Illustration av en färja med en biljettsymbol som visar att ombordstigning väntar.'],
    DE: ['Dein Deck ist unterwegs', 'Fahrzeugdecks werden 2 Stunden vor Abfahrt zugewiesen. Wir melden uns — kein Aktualisieren nötig.', 'Verstanden', 'Erinnerung setzen', 'Illustration einer Fähre mit Ticketsymbol, das auf ausstehende Boarding-Details hinweist.'],
    NL: ['Je dek is onderweg', 'We wijzen voertuigdekken 2 uur voor vertrek toe. We laten het weten — niet verversen nodig.', 'Begrepen', 'Herinnering instellen', 'Illustratie van een veerboot met ticketbadge die aangeeft dat boarding-details volgen.'],
  },
  fragment: { path: 'app/check-in/vehicle-deck-empty', model: 'stena/app-screen-v2', langs: ['en', 'sv', 'de', 'nl', 'da', 'no', 'pl', 'ga'], published: '02 Mar 2026 · 11:02 UTC' },
};

const ONBOARD_CONTENT = {
  fields: [
    { name: 'EN — Headline', limit: 30, value: 'Smörgås hour · until 16:30' },
    { name: 'EN — Body', limit: 90, value: 'Hot soup, sourdough, and Swedish coffee at Café Lagom · Deck 8 · £12' },
    { name: 'CY — Headline (Welsh)', limit: 30, value: 'Awr y smörgås · tan 16:30' },
    { name: 'CY — Body', limit: 90, value: 'Cawl, bara surdoes, a choffi Swedaidd yng Nghaffi Lagom · Dec 8 · £12' },
    { name: 'GA — Headline (Irish)', limit: 30, value: 'Uair an smörgås · go dtí 16:30' },
    { name: 'GA — Body', limit: 90, value: 'Anraith, arán géar, agus caife Sualainnis ag Café Lagom · Deic 8 · £12' },
  ],
  screenLabel: 'Café Lagom · Deck 8',
  loopLabel: '15s loop · 14:00–16:30',
};

const SUMMER_MENU_CONTENT = {
  fields: [
    { name: 'EN — Headline', limit: 30, value: 'Summer menu · now serving' },
    { name: 'EN — Body', limit: 90, value: 'Grilled hake, new potatoes and elderflower pressé at Café Lagom · Deck 8' },
    { name: 'CY — Headline (Welsh)', limit: 30, value: "Bwydlen yr haf · ar gael nawr" },
    { name: 'CY — Body', limit: 90, value: 'Cegddu wedi grilio, tatws newydd a pressé ysgawen yng Nghaffi Lagom · Dec 8' },
    { name: 'GA — Headline (Irish)', limit: 30, value: 'Biachlár an tsamhraidh' },
    { name: 'GA — Body', limit: 90, value: 'Colmóir gríosctha, prátaí nua agus pressé trom ag Café Lagom · Deic 8' },
  ],
  screenLabel: 'Café Lagom · Deck 8',
  loopLabel: '10s loop · 11:30–14:30',
};

// ---------- Queue items (brief + content + history in one record) ----------
export const INITIAL_ITEMS = [
  {
    id: 'BRF-2417', title: 'Holyhead → Dublin — Spring sailings landing page', channel: 'website', type: 'update', state: 'pending', priority: 'High', iter: 2, langs: 4,
    requester: { name: 'Sara Lindqvist', role: 'Marketing Manager · UK/IE' }, updatedAt: minsAgo(12), createdAt: minsAgo(35),
    brief: {
      market: 'United Kingdom', deadline: '24 Mar 2026', mondayId: '7821 · #content-uk',
      pageUrl: '/uk/routes/holyhead-dublin/spring-sailings', fragment: 'route-landing/holyhead-dublin-spring', pageType: 'Route landing page',
      audience: 'UK families and couples planning spring breaks to Dublin and the east coast of Ireland',
      keyMessages: ['New Stena Adventurer refit — refreshed family lounges and Hygge Recline seating', 'Earlier 06:55 sailing now operating Mon–Fri', 'Free changes up to 24h before departure for spring fares'],
      goal: 'Increase organic clicks on "spring ferry to Dublin" cluster and lift conversion on the route landing page.',
      notes: "Keep the existing FAQ section unless tone reads stale. Don't mention the Cairnryan refit — separate campaign.",
    },
    content: WEBSITE_CONTENT,
    iterations: [
      { v: 2, at: minsAgo(2), state: 'pending', summary: 'Tightened hero, removed 06:55 from meta, restored "spring fares".', author: 'AI · gpt-4 · v2.4' },
      { v: 1, at: minsAgo(32), state: 'rejected', summary: 'First generation — used "deals" instead of "fares" (glossary violation).', author: 'AI · gpt-4 · v2.4' },
    ],
    activity: [
      act('AI Content Service', 'generated 6 fields · v2', minsAgo(2), 'sparkles', '#1178df'),
      act('Sara Lindqvist', 'feedback: "tighten hero, drop 06:55 from meta"', minsAgo(14), 'message-square', '#ffa400'),
      act('AI Content Service', 'generated 6 fields · v1', minsAgo(32), 'sparkles', '#1178df'),
      act('Monday.com webhook', 'brief picked up', minsAgo(34), 'webhook', '#5c6171'),
      act('Sara Lindqvist', 'set status: Ready to be picked up', minsAgo(35), 'check', '#509e27'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2418', title: 'May Bank Holiday late-availability email', channel: 'email', type: 'new', state: 'pending', priority: 'High', iter: 1, langs: 3,
    requester: { name: "Niamh O'Connor", role: 'CRM Lead' }, updatedAt: minsAgo(34), createdAt: minsAgo(50),
    brief: {
      market: 'United Kingdom & Ireland', deadline: '02 May 2026', mondayId: '7822 · #email-campaigns', campaignType: 'Promotional · time-limited',
      audience: 'Lapsed customers (last booked > 18 months) in NW England, Manchester radius', cta: 'Book by 5 May for £79 each way',
      keyMessage: 'Last 240 cabins on the May Bank Holiday weekend — 22% off when you bring the car.',
      subjectGuidance: 'Curiosity-led, mention the route, avoid "deal" or "save big" wording.',
    },
    content: EMAIL_CONTENT,
    iterations: [{ v: 1, at: minsAgo(34), state: 'pending', summary: 'First generation — subject line tested against 3 top performers.', author: 'AI · gpt-4 · v2.4' }],
    activity: [
      act('AI Content Service', 'generated 6 fields · v1', minsAgo(34), 'sparkles', '#1178df'),
      act('Monday.com webhook', 'brief picked up', minsAgo(36), 'webhook', '#5c6171'),
      act("Niamh O'Connor", 'set status: Ready to be picked up', minsAgo(50), 'check', '#509e27'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2419', title: 'Stena Estrid — Hygge Recline launch posts', channel: 'social', type: 'new', state: 'iterating', priority: 'Medium', iter: 3, langs: 1,
    requester: { name: 'Tomás Berg', role: 'Social Lead' }, updatedAt: hoursAgo(1), createdAt: hoursAgo(5),
    brief: {
      market: 'United Kingdom & Ireland', deadline: '18 Mar 2026', mondayId: '7823 · #social', platforms: ['Instagram', 'LinkedIn', 'Facebook', 'X / Twitter'],
      visualDirection: 'Wide ferry-at-sea hero + close-up of new Hygge seating with morning light through windows',
      hashtags: '#StenaLine #IrishSea #FerryTravel #HolyheadDublin', link: 'stenaline.co.uk/onboard/hygge',
      message: 'New Hygge Recline cabins on Stena Estrid — calmer crossings, fewer screens, more sea.',
    },
    content: SOCIAL_CONTENT,
    iterations: [
      { v: 3, at: hoursAgo(1), state: 'iterating', summary: 'Removed emoji from LinkedIn, shortened X post to one link.', author: 'AI · gpt-4 · v2.4' },
      { v: 2, at: hoursAgo(2), state: 'rejected', summary: 'LinkedIn copy reused Instagram caption verbatim.', author: 'Tomás Berg' },
      { v: 1, at: hoursAgo(4), state: 'rejected', summary: 'Hashtags on LinkedIn — tonality violation.', author: 'AI · gpt-4 · v2.4' },
    ],
    activity: [
      act('AI Content Service', 'generated 4 posts · v3', hoursAgo(1), 'sparkles', '#1178df'),
      act('Tomás Berg', 'feedback: "LinkedIn must not mirror IG caption"', hoursAgo(2), 'message-square', '#ffa400'),
      act('Monday.com webhook', 'brief picked up', hoursAgo(5), 'webhook', '#5c6171'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2420', title: 'Check-in · Vehicle deck empty state', channel: 'app', type: 'new', state: 'pending', priority: 'Medium', iter: 1, langs: 8,
    requester: { name: 'Ravi Patel', role: 'Mobile Product Manager' }, updatedAt: hoursAgo(2), createdAt: hoursAgo(3),
    brief: {
      market: 'Global · all markets', deadline: '11 Mar 2026', mondayId: '7824 · #mobile-app',
      screen: 'Check-in › Vehicle deck (empty state, pre-arrival)', journey: 'User has checked in but vehicle deck is not yet assigned (24h–2h before sailing)',
      desiredFeel: "Reassuring, factual — they have nothing to do yet, that's OK.", constraints: 'Headline ≤ 32 chars · Body ≤ 120 chars · CTA ≤ 16 chars',
    },
    content: APP_CONTENT,
    iterations: [{ v: 1, at: hoursAgo(2), state: 'pending', summary: 'First generation — all five fields under limit, Flesch 71.', author: 'AI · gpt-4 · v2.4' }],
    activity: [
      act('AI Content Service', 'generated 5 fields · v1', hoursAgo(2), 'sparkles', '#1178df'),
      act('Monday.com webhook', 'brief picked up', hoursAgo(3), 'webhook', '#5c6171'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2421', title: 'Café Lagom — Smörgås hour announcement', channel: 'onboard', type: 'new', state: 'translating', priority: 'Low', iter: 1, langs: 3,
    requester: { name: 'Lina Karlsson', role: 'Onboard Experience Manager' }, updatedAt: hoursAgo(3), createdAt: hoursAgo(6),
    brief: {
      market: 'Holyhead ↔ Dublin route', deadline: '20 Mar 2026', mondayId: '7825 · #onboard', route: 'Holyhead ↔ Dublin · Stena Estrid + Adventurer',
      location: 'Deck 8 hallway screens · adjacent to Café Lagom', duration: '15 second loop · plays 14:00–16:30', languages: ['English', 'Welsh', 'Irish'],
      message: 'Two-hour smörgåsbord buffet with sourdough, hot soup, and Swedish coffee. £12 per person.',
    },
    content: ONBOARD_CONTENT,
    iterations: [{ v: 1, at: hoursAgo(4), state: 'approved', summary: 'EN approved by Lina — CY and GA translations in progress.', author: 'AI · gpt-4 · v2.4' }],
    activity: [
      act('Translation service', 'CY ready · GA in progress', hoursAgo(3), 'languages', '#28d2b9'),
      act('Lina Karlsson', 'approved EN master', hoursAgo(3), 'check', '#509e27'),
      act('AI Content Service', 'generated 2 fields · v1', hoursAgo(4), 'sparkles', '#1178df'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2415', title: 'Cairnryan → Belfast — Easter timetable update', channel: 'website', type: 'update', state: 'approved', priority: 'Medium', iter: 2, langs: 4,
    requester: { name: 'Owen Davies', role: 'Marketing Manager · Scotland/NI' }, updatedAt: daysAgo(1), createdAt: daysAgo(2),
    brief: {
      market: 'United Kingdom', deadline: '27 Mar 2026', mondayId: '7819 · #content-uk',
      pageUrl: '/uk/routes/cairnryan-belfast/easter', fragment: 'route-landing/cairnryan-belfast-easter', pageType: 'Route landing page',
      audience: 'Scottish families and NI expats travelling home for Easter',
      keyMessages: ['Seven daily sailings over Easter weekend', 'Late 23:30 Good Friday departure', 'Fares from £89 with the car'],
      goal: 'Communicate the Easter timetable and lift bookings on the Good Friday sailings.',
    },
    content: CAIRNRYAN_CONTENT,
    iterations: [
      { v: 2, at: daysAgo(1), state: 'approved', summary: 'Added the 23:30 sailing to hero copy; shortened meta.', author: 'AI · gpt-4 · v2.4' },
      { v: 1, at: daysAgo(2), state: 'rejected', summary: 'Hero did not mention Easter at all.', author: 'Owen Davies' },
    ],
    activity: [
      act('Julia Bergström', 'approved · sent to translation (NL, DE, SV)', daysAgo(1), 'check', '#509e27'),
      act('AI Content Service', 'generated 5 fields · v2', daysAgo(1), 'sparkles', '#1178df'),
      act('Monday.com webhook', 'brief picked up', daysAgo(2), 'webhook', '#5c6171'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2414', title: 'Hook of Holland — premium lounge teaser', channel: 'social', type: 'new', state: 'rejected', priority: 'Low', iter: 4, langs: 1,
    requester: { name: 'Emma Janssen', role: 'Social Lead · NL' }, updatedAt: daysAgo(1), createdAt: daysAgo(3),
    brief: {
      market: 'Netherlands & United Kingdom', deadline: '28 Mar 2026', mondayId: '7818 · #social', platforms: ['Instagram', 'LinkedIn'],
      visualDirection: 'Lounge interior at dusk, North Sea through the window', hashtags: '#StenaLine #StenaPlus #NorthSea',
      message: 'Stena Plus lounge relaunches 1 April on Harwich ↔ Hoek van Holland.',
    },
    content: HOEK_SOCIAL_CONTENT,
    iterations: [
      { v: 4, at: daysAgo(1), state: 'rejected', summary: 'Brand team: "premium" wording conflicts with Stena Plus naming guidelines.', author: 'Emma Janssen' },
      { v: 3, at: daysAgo(2), state: 'rejected', summary: 'Opening date wrong (said 1 May).', author: 'Emma Janssen' },
    ],
    activity: [
      act('Emma Janssen', 'rejected: "hold until Stena Plus naming is settled"', daysAgo(1), 'x-circle', '#b00f2e'),
      act('AI Content Service', 'generated 2 posts · v4', daysAgo(1), 'sparkles', '#1178df'),
    ],
    comments: [],
  },
  {
    id: 'BRF-2413', title: 'Onboard café summer menu announcement', channel: 'onboard', type: 'new', state: 'queued', priority: 'Low', iter: 0, langs: 3,
    requester: { name: 'Lina Karlsson', role: 'Onboard Experience Manager' }, updatedAt: daysAgo(2), createdAt: daysAgo(2),
    brief: {
      market: 'Holyhead ↔ Dublin route', deadline: '15 May 2026', mondayId: '7817 · #onboard', route: 'Holyhead ↔ Dublin · Stena Estrid + Adventurer',
      location: 'Deck 8 hallway screens', duration: '10 second loop · plays 11:30–14:30', languages: ['English', 'Welsh', 'Irish'],
      message: 'New summer menu at Café Lagom: grilled hake, new potatoes, elderflower pressé.',
    },
    content: SUMMER_MENU_CONTENT,
    iterations: [],
    activity: [act('Monday.com webhook', 'brief queued · waiting for hero image', daysAgo(2), 'webhook', '#5c6171')],
    comments: [],
  },
];

// ---------- Admin seed ----------
export const INITIAL_GLOSSARY = [
  { id: 'g1', en: 'sailing', sv: 'avgång', de: 'Überfahrt', nl: 'overtocht', notes: 'Use for individual departures' },
  { id: 'g2', en: 'crossing', sv: 'överfart', de: 'Überfahrt', nl: 'oversteek', notes: 'Use for the journey itself' },
  { id: 'g3', en: 'route', sv: 'rutt', de: 'Route', nl: 'route', notes: 'Stena Line route between two ports' },
  { id: 'g4', en: 'fare', sv: 'biljett', de: 'Tarif', nl: 'tarief', notes: 'Never "ticket" in marketing copy' },
  { id: 'g5', en: 'Hygge Recline', sv: 'Hygge Recline', de: 'Hygge Recline', nl: 'Hygge Recline', notes: 'Brand name — never translate', protected: true },
  { id: 'g6', en: 'Café Lagom', sv: 'Café Lagom', de: 'Café Lagom', nl: 'Café Lagom', notes: 'Brand name — never translate', protected: true },
  { id: 'g7', en: 'Stena Plus', sv: 'Stena Plus', de: 'Stena Plus', nl: 'Stena Plus', notes: 'Lounge brand — never "premium lounge"', protected: true },
  { id: 'g8', en: 'vehicle deck', sv: 'bildäck', de: 'Fahrzeugdeck', nl: 'autodek', notes: 'App and onboard signage' },
  { id: 'g9', en: 'check-in', sv: 'incheckning', de: 'Check-in', nl: 'inchecken', notes: 'Hyphenated in EN' },
  { id: 'g10', en: 'cabin', sv: 'hytt', de: 'Kabine', nl: 'hut', notes: 'Not "room"' },
];

export const INITIAL_TONALITY = [
  { channel: 'website', do: ['Sentence case headings', 'British English', '3rd-person friendly', 'Lead with the route'], dont: ['Title Case', '"Click here" CTAs', 'Marketing superlatives', 'Emoji'] },
  { channel: 'email', do: ['Conversational opener', 'One clear CTA', 'Sentence case subject', 'Specific numbers'], dont: ['"Hi there"', 'ALL CAPS', '"Don\'t miss out"', 'Multiple CTAs'] },
  { channel: 'social', do: ['Punchy first line', 'Platform-native length', 'Hashtags at the end (IG only)', 'Casual tone'], dont: ['Cross-platform copy-paste', 'Hashtags on LinkedIn', 'Long URLs in tweets', 'Emoji on LinkedIn'] },
  { channel: 'app', do: ['Reassuring, factual', 'Verb-first CTAs', 'Short sentences'], dont: ['Exclamation marks', 'Jargon ("manifest")', 'Apologising for the system'] },
  { channel: 'onboard', do: ['Time and deck always stated', 'Price in local currency', 'All route languages'], dont: ['Abbreviations', 'More than two lines of body', 'Marketing adjectives'] },
];

export const INITIAL_QUESTIONS = {
  website: [
    { id: 'wq1', q: 'Page type? (new / update)', mandatory: true },
    { id: 'wq2', q: 'Page URL (for updates)', mandatory: true, conditional: 'when type = update', hint: 'Resolved to an AEM content fragment' },
    { id: 'wq3', q: 'Target audience', mandatory: true },
    { id: 'wq4', q: 'Key messages', mandatory: true, helper: 'Up to 5 bullet points' },
    { id: 'wq5', q: 'Goal of this page', mandatory: true },
    { id: 'wq6', q: 'Editor notes', mandatory: false, helper: 'Any constraints not covered above' },
  ],
  email: [
    { id: 'eq1', q: 'Campaign type', mandatory: true, helper: 'Promotional, newsletter, transactional' },
    { id: 'eq2', q: 'Audience segment', mandatory: true },
    { id: 'eq3', q: 'Key message', mandatory: true },
    { id: 'eq4', q: 'Primary CTA', mandatory: true },
    { id: 'eq5', q: 'Subject line guidance', mandatory: false },
  ],
  social: [
    { id: 'sq1', q: 'Platforms', mandatory: true, helper: 'Instagram, LinkedIn, Facebook, X' },
    { id: 'sq2', q: 'Core message', mandatory: true },
    { id: 'sq3', q: 'Visual direction', mandatory: true },
    { id: 'sq4', q: 'Link destination', mandatory: false },
    { id: 'sq5', q: 'Hashtag set', mandatory: false },
  ],
  app: [
    { id: 'aq1', q: 'Screen and state', mandatory: true, helper: 'e.g. Check-in › Vehicle deck (empty)' },
    { id: 'aq2', q: 'User journey context', mandatory: true },
    { id: 'aq3', q: 'Desired feel', mandatory: true },
    { id: 'aq4', q: 'Character constraints', mandatory: false, helper: 'Defaults from fragment model' },
  ],
  onboard: [
    { id: 'oq1', q: 'Route and vessels', mandatory: true },
    { id: 'oq2', q: 'Screen location', mandatory: true },
    { id: 'oq3', q: 'Loop duration and schedule', mandatory: true },
    { id: 'oq4', q: 'Message', mandatory: true },
    { id: 'oq5', q: 'Languages', mandatory: false, helper: 'Defaults to route languages' },
  ],
};

export const INITIAL_SEO = {
  keywords: [
    { id: 'k1', kw: 'ferry holyhead to dublin', priority: 'Primary', vol: '49.5k' },
    { id: 'k2', kw: 'spring ferry dublin', priority: 'Primary', vol: '4.4k' },
    { id: 'k3', kw: 'cheap ferry to ireland', priority: 'Secondary', vol: '22k' },
    { id: 'k4', kw: 'family ferry holyhead dublin', priority: 'Long-tail', vol: '1.8k' },
  ],
  structuredData: ['TravelAction', 'BreadcrumbList', 'FAQPage', 'Organization'],
  metaPattern: '140–160 chars · ends with offer/price',
};

export const INITIAL_WCAG = [
  { id: 'w1', rule: 'Heading hierarchy', desc: 'No skipped levels. One H1 per page. Logical nesting.', icon: 'list-tree', on: true },
  { id: 'w2', rule: 'Plain language', desc: 'Flesch reading ease ≥ 60. No jargon. Active voice preferred.', icon: 'sparkles', on: true },
  { id: 'w3', rule: 'Descriptive link text', desc: 'No "click here" or "read more". Link text must describe target.', icon: 'link', on: true },
  { id: 'w4', rule: 'Alt text required', desc: 'Every image gets descriptive alt text. Decorative images: alt="".', icon: 'image', on: true },
  { id: 'w5', rule: 'Color contrast guidance', desc: 'AA: 4.5:1 for body text, 3:1 for large text. Notes added to design pairings.', icon: 'palette', on: true },
  { id: 'w6', rule: 'Action verbs in CTAs', desc: 'CTAs start with a verb. "Find sailings" not "Sailings here".', icon: 'arrow-right-circle', on: true },
  { id: 'w7', rule: 'Form labels', desc: 'Every input gets a visible, associated label.', icon: 'form-input', on: false },
];

export const INITIAL_ROLES = [
  { id: 'r1', name: 'Content editor', members: ['Julia Bergström', 'Anna Eriksson', 'Marcus Holm', 'Priya Nair', 'Owen Davies', 'Sofie Dahl', 'Liam Walsh', 'Hanna Berg', 'Tom Ek', 'Ida Lund', 'Noor Haddad', 'Erik Sand'], perms: ['Review content', 'Approve & translate', 'Provide feedback'] },
  { id: 'r2', name: 'Language reviewer', members: ['Mieke de Vries', 'Jonas Weber', 'Astrid Nilsson', 'Kasia Nowak', 'Mette Jensen', 'Ola Hansen', 'Siobhán Byrne', 'Gwen Pryce'], perms: ['Per-language translation review'] },
  { id: 'r3', name: 'SEO specialist', members: ['Daniel Croft', 'Amira Said', 'Felix Lund'], perms: ['Edit SEO config', 'View ranking data', 'Configure tracking'] },
  { id: 'r4', name: 'Accessibility expert', members: ['Ruth Adeyemi', 'Per Åkesson'], perms: ['Edit WCAG rules', 'View compliance reports'] },
  { id: 'r5', name: 'Marketing manager', members: ['Sara Lindqvist', "Niamh O'Connor", 'Tomás Berg', 'Emma Janssen', 'Lina Karlsson', 'Ravi Patel'], perms: ['Edit channel config', 'Edit tonality', 'Approve briefs'] },
  { id: 'r6', name: 'Administrator', members: ['Filip Gustafsson', 'Karin Ström'], perms: ['All permissions', 'User management', 'Audit logs'] },
];

export const INITIAL_INTEGRATIONS = [
  { id: 'monday', name: 'Monday.com', status: 'Connected', icon: 'kanban', desc: 'Briefs board · webhook on status change · API v2025-04', color: '#004a93', lastSync: minsAgo(3) },
  { id: 'aem', name: 'AEM', status: 'Connected', icon: 'database', desc: 'Content fragments · URL resolver · DAM · v6.5.21', color: '#b00f2e', lastSync: minsAgo(8) },
  { id: 'gsc', name: 'Google Search Console', status: 'Connected', icon: 'trending-up', desc: '847 URLs tracked', color: '#509e27', lastSync: minsAgo(14) },
  { id: 'acs', name: 'Adobe Campaign Standard', status: 'Connected', icon: 'mail', desc: 'Email performance · audience segments', color: '#ffa400', lastSync: minsAgo(41) },
  { id: 'aoai', name: 'Azure OpenAI', status: 'Connected', icon: 'sparkles', desc: 'gpt-4 · 32k context · EU West', color: '#1178df', lastSync: minsAgo(1) },
  { id: 'foundry', name: 'Azure AI Foundry', status: 'Connected', icon: 'image', desc: 'Image generation · grounded in Stena image library', color: '#28d2b9', lastSync: minsAgo(22) },
  { id: 'socials', name: 'Meta · LinkedIn · X', status: 'Read-only', icon: 'megaphone', desc: 'Engagement analytics · 30-day rolling', color: '#b00f2e', lastSync: hoursAgo(2) },
];

export const CHANNEL_CONFIG = {
  website: { version: '3.2', optimizers: ['SEO', 'WCAG', 'Schema', 'OG'], data: ['Google Search Console', 'AEM URL resolver'], owners: ['Marketing UK', 'SEO team', 'Accessibility team'] },
  email: { version: '2.7', optimizers: ['Mobile rendering', 'Subject A/B'], data: ['Adobe Campaign Standard'], owners: ['CRM team', 'Marketing'] },
  social: { version: '4.1', optimizers: ['Per-platform limits', 'Hashtag policy'], data: ['Meta · LinkedIn · X analytics'], owners: ['Social team', 'Brand'] },
  app: { version: '2.0', optimizers: ['WCAG', 'Char limits'], data: ['AEM fragment models'], owners: ['Mobile product', 'Accessibility'] },
  onboard: { version: '1.6', optimizers: ['Display constraints', 'Multi-lang'], data: ['Route timetables'], owners: ['Onboard experience', 'Marketing'] },
};

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'BRF-2417 regenerated (v2)', body: 'Sara\'s feedback applied — ready for review.', at: minsAgo(2), read: false, link: { type: 'review', id: 'BRF-2417' } },
  { id: 'n2', title: 'Translation ready: BRF-2421 (CY)', body: 'Welsh master ready for language review.', at: hoursAgo(3), read: false, link: { type: 'review', id: 'BRF-2421' } },
  { id: 'n3', title: 'Hero image variants ready', body: '4 variants generated for Holyhead → Dublin spring landing.', at: hoursAgo(1), read: false, link: { type: 'images' } },
  { id: 'n4', title: 'BRF-2414 rejected by Emma Janssen', body: 'Hold until Stena Plus naming is settled.', at: daysAgo(1), read: true, link: { type: 'review', id: 'BRF-2414' } },
];

// ---------- Brief assistant: canned answers per channel to make the demo flow fast ----------
export const ASSISTANT_SUGGESTIONS = {
  website: {
    wq1: ['Update', 'New page'],
    wq2: ['/uk/routes/holyhead-dublin/spring-sailings', '/se/rutter/goteborg-kiel'],
    wq3: ['UK families and couples booking spring breaks to Dublin and the east coast.', 'Business travellers commuting Dublin–Holyhead weekly.'],
    wq4: ['Stena Adventurer refit (Hygge Recline + family lounges), the new 06:55 weekday sailing, and free changes up to 24h before.', 'Pet-friendly cabins, onboard Wi-Fi, family fares.'],
    wq5: ['Lift organic clicks on the "spring ferry to Dublin" cluster and improve page conversion.', 'Reduce bounce rate on mobile.'],
    wq6: ["Keep the FAQ. Don't mention the Cairnryan refit.", 'Skip'],
  },
  email: {
    eq1: ['Promotional · time-limited', 'Newsletter'],
    eq2: ['Lapsed customers (last booked > 18 months) in NW England.', 'Stena Extra members · Sweden'],
    eq3: ['Last 240 cabins on the May Bank Holiday weekend — 22% off when you bring the car.'],
    eq4: ['Book by 5 May for £79 each way', 'See spring sailings'],
    eq5: ['Curiosity-led, mention the route, avoid "deal" wording.', 'Skip'],
  },
  social: {
    sq1: ['Instagram, LinkedIn, Facebook, X', 'Instagram and LinkedIn only'],
    sq2: ['New Hygge Recline cabins on Stena Estrid — calmer crossings, fewer screens, more sea.'],
    sq3: ['Wide ferry-at-sea hero + close-up of Hygge seating in morning light.'],
    sq4: ['stenaline.co.uk/onboard/hygge', 'Skip'],
    sq5: ['#StenaLine #IrishSea #FerryTravel', 'Skip'],
  },
  app: {
    aq1: ['Check-in › Vehicle deck (empty state, pre-arrival)', 'Booking › Payment failed'],
    aq2: ['User has checked in but vehicle deck is not yet assigned (24h–2h before sailing).'],
    aq3: ["Reassuring, factual — they have nothing to do yet, that's OK."],
    aq4: ['Headline ≤ 32 · Body ≤ 120 · CTA ≤ 16', 'Use defaults'],
  },
  onboard: {
    oq1: ['Holyhead ↔ Dublin · Stena Estrid + Adventurer', 'Göteborg ↔ Kiel · Stena Germanica'],
    oq2: ['Deck 8 hallway screens · adjacent to Café Lagom'],
    oq3: ['15 second loop · plays 14:00–16:30'],
    oq4: ['Two-hour smörgåsbord buffet with sourdough, hot soup, and Swedish coffee. £12 per person.'],
    oq5: ['English, Welsh, Irish', 'Use route defaults'],
  },
};

export const TEMPLATE_CONTENT_BY_CHANNEL = {
  website: WEBSITE_CONTENT,
  email: EMAIL_CONTENT,
  social: SOCIAL_CONTENT,
  app: APP_CONTENT,
  onboard: ONBOARD_CONTENT,
};
