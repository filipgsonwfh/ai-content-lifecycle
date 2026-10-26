// Simulated "AI" behaviour: deterministic-ish text transforms driven by reviewer feedback.
const SYNONYMS = [
  ['calm crossings', 'quiet crossings'], ['room to breathe', 'time to unwind'], ['refitted', 'newly refitted'],
  ['Bring the car', 'Take the car'], ['Five daily sailings', 'Five sailings a day'], ['this spring', 'this season'],
  ['Hot soup', 'Warm soup'], ['Three days', '72 hours'], ['snuck up on us', 'crept up on us'],
  ['calmer light', 'softer light'], ['more horizon', 'more sea'], ['on its way', 'coming soon'],
];

function firstSentences(text, ratio = 0.6) {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts || parts.length < 2) return text;
  let out = '';
  for (const p of parts) {
    if ((out + p).length > text.length * ratio && out) break;
    out += p;
  }
  return out.trim();
}

function rephrase(text, seed) {
  let out = text;
  let applied = 0;
  for (let i = 0; i < SYNONYMS.length; i++) {
    const [a, b] = SYNONYMS[(i + seed) % SYNONYMS.length];
    if (out.includes(a)) { out = out.replace(a, b); applied++; }
    else if (out.includes(b)) { out = out.replace(b, a); applied++; }
    if (applied >= 2) break;
  }
  return out;
}

const CTA_ALTS = ['Find spring sailings', 'See sailings & fares', 'Check spring fares', 'Plan your crossing', 'Book your crossing'];

// Returns { content, summary, changedFields } without mutating the input.
export function regenerateContent(content, feedback, iter) {
  const fb = (feedback || '').toLowerCase();
  const concise = /concise|short|tight/.test(fb);
  const numbers = /number|specific/.test(fb);
  const cta = /cta|call to action/.test(fb);
  const avoidMatch = fb.match(/avoid\s+"?([a-z0-9' -]+?)"?(?:\s*[·,.]|$)/);
  const avoidWord = avoidMatch ? avoidMatch[1].trim() : null;
  const notes = [];
  const changed = new Set();

  const transform = (text, name) => {
    let t = text;
    if (concise && t.length > 80) { const s = firstSentences(t); if (s !== t) { t = s; notes.push('tightened ' + name.toLowerCase()); } }
    if (avoidWord && t.toLowerCase().includes(avoidWord)) { t = t.replace(new RegExp(avoidWord, 'ig'), 'crossing'); notes.push(`removed "${avoidWord}"`); }
    if (numbers && /sailing|crossing/i.test(t) && !/3h 30m/.test(t) && t.length > 60) { t = t.replace(/\.(\s|$)/, ' — 3h 30m port to port.$1'); notes.push('added crossing time'); }
    if (t === text) t = rephrase(text, iter);
    if (t !== text) changed.add(name);
    return t;
  };

  const next = JSON.parse(JSON.stringify(content));
  if (next.fields) {
    next.fields = next.fields.map((f, i) => {
      const key = f.after !== undefined ? 'after' : 'value';
      if (cta && /cta/i.test(f.name) && !/secondary/i.test(f.name)) {
        const alt = CTA_ALTS[(iter + i) % CTA_ALTS.length];
        if (alt !== f[key]) { changed.add(f.name); notes.push('stronger CTA'); return { ...f, [key]: alt }; }
      }
      if (f.limit && f.limit <= 32) return f; // keep tiny fields stable
      return { ...f, [key]: transform(f[key], f.name) };
    });
  }
  if (next.posts) {
    next.posts = next.posts.map(p => ({ ...p, caption: transform(p.caption, p.platform) }));
  }
  const unique = [...new Set(notes)];
  const summary = unique.length
    ? unique[0][0].toUpperCase() + unique.join(', ').slice(1) + '.'
    : changed.size
      ? 'Rephrased for variety while keeping all key messages and glossary terms.'
      : 'Feedback did not point at any field — copy re-validated against tonality, glossary and limits; no changes made.';
  return { content: next, summary, changedFields: [...changed] };
}

export function contentFieldCount(content) {
  if (content?.fields) return `${content.fields.length} fields`;
  if (content?.posts) return `${content.posts.length} posts`;
  return 'content';
}
