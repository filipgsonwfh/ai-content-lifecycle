import { useEffect, useState } from 'react';

// Minimal hash router: #/queue · #/review/BRF-2417 · #/brief · #/images · #/admin/glossary
export function parseHash(hash = window.location.hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [path, query = ''] = clean.split('?');
  const segs = path.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query));
  return { page: segs[0] || 'queue', id: segs[1] || null, params };
}

export function navigate(path) {
  const next = `#/${path.replace(/^#?\/?/, '')}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onChange = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
