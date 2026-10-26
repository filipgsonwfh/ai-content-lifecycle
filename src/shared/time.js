// Virtual demo clock. Seed data is anchored to Tue 17 Mar 2026 09:42 local time;
// new events happen at DEMO_NOW + elapsed-since-page-load so relative times stay believable.
export const DEMO_NOW = new Date(2026, 2, 17, 9, 42).getTime();
const loadedAt = Date.now();
export const vnow = () => DEMO_NOW + (Date.now() - loadedAt);
export const minsAgo = (m) => DEMO_NOW - m * 60_000;
export const hoursAgo = (h) => minsAgo(h * 60);
export const daysAgo = (d) => hoursAgo(d * 24);

export function relativeTime(ts, now = vnow()) {
  const diff = Math.max(0, now - ts);
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d} days ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const DEMO_DATE_LABEL = 'Tuesday · 17 Mar 2026';
