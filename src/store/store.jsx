import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  INITIAL_ITEMS, INITIAL_GLOSSARY, INITIAL_TONALITY, INITIAL_QUESTIONS, INITIAL_SEO, INITIAL_WCAG,
  INITIAL_ROLES, INITIAL_INTEGRATIONS, CHANNEL_CONFIG, INITIAL_NOTIFICATIONS, TEMPLATE_CONTENT_BY_CHANNEL, USER,
} from '../shared/data.js';
import { vnow, DEMO_NOW } from '../shared/time.js';
import { regenerateContent, contentFieldCount } from './simulate.js';

export const STORAGE_KEY = 'aicl.state.v1';
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_PROMPT = 'Stena Britannica at sea, full broadside view, Stena Line livery clearly visible, calm to lightly choppy water, photographic, editorial, on-brand, no people on deck, 16:9 hero crop.';

export function seedState() {
  return {
    items: INITIAL_ITEMS,
    glossary: INITIAL_GLOSSARY,
    tonality: INITIAL_TONALITY,
    questions: INITIAL_QUESTIONS,
    seo: INITIAL_SEO,
    wcag: INITIAL_WCAG,
    roles: INITIAL_ROLES,
    integrations: INITIAL_INTEGRATIONS,
    channelConfig: CHANNEL_CONFIG,
    notifications: INITIAL_NOTIFICATIONS,
    imageGen: { variant: 1, prompt: DEFAULT_PROMPT, version: 3, order: [0, 1, 2, 3], approved: null, regenerating: false, history: [] },
    nextBriefNo: 2422,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return seedState();
    return hydrate(parsed);
  } catch {
    return seedState();
  }
}

// Merge a persisted snapshot over the seed so older/partial shapes are back-filled,
// and re-arm in-flight transitions with the time they had left (virtual clock restarts on load).
function hydrate(parsed) {
  const seed = seedState();
  const savedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : DEMO_NOW;
  const items = parsed.items.map(it => it.transition
    ? { ...it, transition: { ...it.transition, at: DEMO_NOW + Math.max(600, it.transition.at - savedAt) } }
    : it);
  return {
    ...seed, ...parsed, items,
    questions: { ...seed.questions, ...(parsed.questions || {}) },
    channelConfig: { ...seed.channelConfig, ...(parsed.channelConfig || {}) },
    seo: { ...seed.seo, ...(parsed.seo || {}) },
    imageGen: { ...seed.imageGen, ...(parsed.imageGen || {}), regenerating: false },
    nextBriefNo: Number.isFinite(parsed.nextBriefNo) ? parsed.nextBriefNo : seed.nextBriefNo,
  };
}

const activity = (who, what, icon, color) => ({ id: uid(), who, what, when: vnow(), icon, color });
const notif = (title, body, link) => ({ id: uid(), title, body, at: vnow(), read: false, link });

function updateItem(state, id, fn) {
  return { ...state, items: state.items.map(it => (it.id === id ? fn(it) : it)) };
}

function reducer(state, action) {
  const a = action;
  switch (a.type) {
    case 'RESET':
      return seedState();
    case 'HYDRATE':
      return hydrate(a.state);

    // ---------- Review flow ----------
    case 'ITEM_APPROVE': {
      const it = state.items.find(i => i.id === a.id);
      if (!it) return state;
      const translating = it.langs > 1;
      const s1 = updateItem(state, a.id, i => ({
        ...i,
        state: translating ? 'translating' : 'approved',
        updatedAt: vnow(),
        transition: translating ? { to: 'approved', at: vnow() + 7000 } : undefined,
        iterations: i.iterations.map((v, idx) => (idx === 0 ? { ...v, state: 'approved' } : v)),
        activity: [activity(USER.name, translating ? `approved · sent to translation (${i.langs - 1} languages)` : 'approved · delivered to AEM', 'check', '#509e27'), ...i.activity],
      }));
      return { ...s1, notifications: [notif(`${it.id} approved`, translating ? `Translation into ${it.langs - 1} languages started.` : 'Delivered to AEM.', { type: 'review', id: it.id }), ...s1.notifications] };
    }
    case 'ITEM_REJECT': {
      const it = state.items.find(i => i.id === a.id);
      if (!it) return state;
      const s1 = updateItem(state, a.id, i => ({
        ...i, state: 'rejected', updatedAt: vnow(), transition: undefined,
        iterations: i.iterations.map((v, idx) => (idx === 0 ? { ...v, state: 'rejected' } : v)),
        activity: [activity(USER.name, `rejected: "${a.reason}"`, 'x-circle', '#b00f2e'), ...i.activity],
        comments: a.reason ? [{ id: uid(), who: USER.name, text: a.reason, at: vnow(), kind: 'rejection' }, ...i.comments] : i.comments,
      }));
      return { ...s1, notifications: [notif(`${it.id} rejected`, `Sent back to ${it.requester.name} in Monday.com.`, { type: 'review', id: it.id }), ...s1.notifications] };
    }
    case 'ITEM_REOPEN':
      return updateItem(state, a.id, i => ({
        ...i, state: 'pending', updatedAt: vnow(), transition: undefined,
        iterations: i.iterations.map((v, idx) => (idx === 0 ? { ...v, state: 'pending' } : v)),
        activity: [activity(USER.name, 'reopened for review', 'rotate-ccw', '#1178df'), ...i.activity],
      }));
    case 'ITEM_COMMENT':
      return updateItem(state, a.id, i => ({
        ...i, updatedAt: vnow(),
        comments: [{ id: uid(), who: USER.name, text: a.text, at: vnow(), kind: 'comment' }, ...i.comments],
        activity: [activity(USER.name, `comment: "${a.text}"`, 'message-square', '#ffa400'), ...i.activity],
      }));
    case 'ITEM_FIELD_EDIT':
      return updateItem(state, a.id, i => {
        const fields = i.content.fields.map((f, idx) => (idx === a.index ? { ...f, [f.after !== undefined ? 'after' : 'value']: a.value, editedBy: USER.name } : f));
        return { ...i, updatedAt: vnow(), content: { ...i.content, fields }, activity: [activity(USER.name, `edited "${fields[a.index].name}" manually`, 'pencil', '#5c6171'), ...i.activity] };
      });
    case 'ITEM_REGEN_START':
      return updateItem(state, a.id, i => ({
        ...i, state: 'iterating', regenerating: true, updatedAt: vnow(),
        transition: { to: 'regen-done', at: vnow() + 2200, feedback: a.feedback },
        activity: [activity(USER.name, `feedback: "${a.feedback}"`, 'message-square', '#ffa400'), ...i.activity],
      }));
    case 'ITEM_TRANSITION': {
      const it = state.items.find(i => i.id === a.id);
      if (!it || !it.transition) return state;
      const t = it.transition;
      if (t.to === 'regen-done') {
        const { content, summary, changedFields } = regenerateContent(it.content, t.feedback, it.iter + 1);
        const prevSnapshot = it.content;
        const s1 = updateItem(state, a.id, i => ({
          ...i, state: 'pending', regenerating: false, transition: undefined, iter: i.iter + 1, updatedAt: vnow(),
          content, changedFields,
          iterations: [{ v: i.iter + 1, at: vnow(), state: 'pending', summary, author: 'AI · gpt-4 · v2.4', feedback: t.feedback, prev: prevSnapshot, generated: content, unchanged: changedFields.length === 0 }, ...i.iterations.map((v, idx) => (idx === 0 && ['pending', 'iterating'].includes(v.state) ? { ...v, state: 'rejected' } : v))],
          activity: [activity('AI Content Service', changedFields.length ? `generated ${contentFieldCount(content)} · v${i.iter + 1}` : `re-validated ${contentFieldCount(content)} · v${i.iter + 1} · no copy changes`, 'sparkles', '#1178df'), ...i.activity],
        }));
        return { ...s1, notifications: [notif(`${it.id} regenerated (v${it.iter + 1})`, summary, { type: 'review', id: it.id }), ...s1.notifications] };
      }
      if (t.to === 'generating') {
        return updateItem(state, a.id, i => ({
          ...i, state: 'generating', updatedAt: vnow(), transition: { to: 'generated', at: vnow() + 3200 },
          activity: [activity('Monday.com webhook', 'brief picked up', 'webhook', '#5c6171'), ...i.activity],
        }));
      }
      if (t.to === 'generated') {
        const s1 = updateItem(state, a.id, i => ({
          ...i, state: 'pending', iter: 1, updatedAt: vnow(), transition: undefined,
          iterations: [{ v: 1, at: vnow(), state: 'pending', summary: 'First generation — tonality, glossary and channel constraints applied.', author: 'AI · gpt-4 · v2.4' }],
          activity: [activity('AI Content Service', `generated ${contentFieldCount(i.content)} · v1`, 'sparkles', '#1178df'), ...i.activity],
        }));
        return { ...s1, notifications: [notif(`${it.id} ready for review`, `${it.title} — first generation complete.`, { type: 'review', id: it.id }), ...s1.notifications] };
      }
      if (t.to === 'approved') {
        const s1 = updateItem(state, a.id, i => ({
          ...i, state: 'approved', updatedAt: vnow(), transition: undefined,
          activity: [activity('Translation service', `${i.langs - 1} languages delivered to AEM`, 'languages', '#28d2b9'), ...i.activity],
        }));
        return { ...s1, notifications: [notif(`${it.id} translations delivered`, `${it.langs - 1} language versions written to AEM.`, { type: 'review', id: it.id }), ...s1.notifications] };
      }
      return state;
    }

    // ---------- Brief assistant ----------
    case 'BRIEF_SUBMIT': {
      const id = `BRF-${state.nextBriefNo}`;
      const tpl = TEMPLATE_CONTENT_BY_CHANNEL[a.channel];
      const item = {
        id, title: a.title, channel: a.channel, type: a.briefType || 'new', state: 'queued', priority: a.priority || 'Medium', iter: 0,
        langs: a.langs || 1, requester: { name: USER.name, role: USER.role }, createdAt: vnow(), updatedAt: vnow(),
        brief: { ...a.brief, mondayId: `${7800 + state.nextBriefNo - 2400} · #${a.channel}` },
        content: (() => { const c = JSON.parse(JSON.stringify(tpl)); if ((a.briefType || 'new') === 'new' && c.fields) c.fields = c.fields.map(({ before, ...f }) => f); return c; })(),
        iterations: [], comments: [],
        activity: [activity(USER.name, 'created via Brief Assistant · set status: Ready to be picked up', 'check', '#509e27')],
        transition: { to: 'generating', at: vnow() + 1800 },
        createdInSession: true,
      };
      return { ...state, items: [item, ...state.items], nextBriefNo: state.nextBriefNo + 1 };
    }

    // ---------- Notifications ----------
    case 'NOTIF_READ':
      return { ...state, notifications: state.notifications.map(n => (n.id === a.id ? { ...n, read: true } : n)) };
    case 'NOTIF_READ_ALL':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    // ---------- Admin: glossary ----------
    case 'GLOSSARY_ADD':
      return { ...state, glossary: [{ id: uid(), ...a.term }, ...state.glossary] };
    case 'GLOSSARY_UPDATE':
      return { ...state, glossary: state.glossary.map(g => (g.id === a.id ? { ...g, ...a.patch } : g)) };
    case 'GLOSSARY_DELETE':
      return { ...state, glossary: state.glossary.filter(g => g.id !== a.id) };

    // ---------- Admin: tonality ----------
    case 'TONALITY_ADD':
      return { ...state, tonality: state.tonality.map(t => (t.channel === a.channel ? { ...t, [a.kind]: [...t[a.kind], a.text] } : t)) };
    case 'TONALITY_REMOVE':
      return { ...state, tonality: state.tonality.map(t => (t.channel === a.channel ? { ...t, [a.kind]: t[a.kind].filter(x => x !== a.text) } : t)) };

    // ---------- Admin: brief questions ----------
    case 'QUESTION_ADD':
      return { ...state, questions: { ...state.questions, [a.channel]: [...state.questions[a.channel], { id: uid(), ...a.question }] } };
    case 'QUESTION_UPDATE':
      return { ...state, questions: { ...state.questions, [a.channel]: state.questions[a.channel].map(q => (q.id === a.id ? { ...q, ...a.patch } : q)) } };
    case 'QUESTION_DELETE':
      return { ...state, questions: { ...state.questions, [a.channel]: state.questions[a.channel].filter(q => q.id !== a.id) } };
    case 'QUESTION_MOVE': {
      const list = [...state.questions[a.channel]];
      const idx = list.findIndex(q => q.id === a.id);
      const to = idx + a.dir;
      if (idx < 0 || to < 0 || to >= list.length) return state;
      [list[idx], list[to]] = [list[to], list[idx]];
      return { ...state, questions: { ...state.questions, [a.channel]: list } };
    }

    // ---------- Admin: SEO / WCAG ----------
    case 'SEO_KW_ADD':
      return { ...state, seo: { ...state.seo, keywords: [...state.seo.keywords, { id: uid(), kw: a.kw, priority: a.priority || 'Secondary', vol: a.vol || '—' }] } };
    case 'SEO_KW_DELETE':
      return { ...state, seo: { ...state.seo, keywords: state.seo.keywords.filter(k => k.id !== a.id) } };
    case 'SEO_KW_CYCLE': {
      const order = ['Primary', 'Secondary', 'Long-tail'];
      return { ...state, seo: { ...state.seo, keywords: state.seo.keywords.map(k => (k.id === a.id ? { ...k, priority: order[(order.indexOf(k.priority) + 1) % order.length] } : k)) } };
    }
    case 'SEO_SD_TOGGLE': {
      const has = state.seo.structuredData.includes(a.name);
      return { ...state, seo: { ...state.seo, structuredData: has ? state.seo.structuredData.filter(s => s !== a.name) : [...state.seo.structuredData, a.name] } };
    }
    case 'WCAG_TOGGLE':
      return { ...state, wcag: state.wcag.map(w => (w.id === a.id ? { ...w, on: !w.on } : w)) };

    // ---------- Admin: roles / integrations / channels ----------
    case 'ROLE_INVITE':
      return { ...state, roles: state.roles.map(r => (r.id === a.roleId ? { ...r, members: [...r.members, a.name] } : r)) };
    case 'ROLE_REMOVE':
      return { ...state, roles: state.roles.map(r => (r.id === a.roleId ? { ...r, members: r.members.filter(m => m !== a.name) } : r)) };
    case 'INT_TOGGLE':
      return { ...state, integrations: state.integrations.map(i => (i.id === a.id ? { ...i, status: i.status === 'Disconnected' ? (i.id === 'socials' ? 'Read-only' : 'Connected') : 'Disconnected', lastSync: vnow() } : i)) };
    case 'INT_SYNC':
      return { ...state, integrations: state.integrations.map(i => (i.id === a.id ? { ...i, lastSync: vnow() } : i)) };
    case 'CHANNEL_CONFIG_UPDATE':
      return { ...state, channelConfig: { ...state.channelConfig, [a.channel]: { ...state.channelConfig[a.channel], ...a.patch } } };

    // ---------- Image generation ----------
    case 'IMG_SET':
      return { ...state, imageGen: { ...state.imageGen, ...a.patch } };
    case 'IMG_REGEN_START':
      return { ...state, imageGen: { ...state.imageGen, regenerating: true, approved: null } };
    case 'IMG_REGEN_DONE': {
      const order = [...state.imageGen.order].sort(() => Math.random() - 0.5);
      return { ...state, imageGen: { ...state.imageGen, regenerating: false, version: state.imageGen.version + 1, order, history: [{ v: state.imageGen.version, prompt: state.imageGen.prompt, at: vnow() }, ...state.imageGen.history] } };
    }
    case 'IMG_APPROVE': {
      const approved = { variant: state.imageGen.variant, version: state.imageGen.version, at: vnow(), path: `vessels/stena-britannica/2026-spring/stena-britannica-route-hero-${state.imageGen.variant + 1}.jpg` };
      return { ...state, imageGen: { ...state.imageGen, approved }, notifications: [notif('Hero image sent to DAM', approved.path, { type: 'images' }), ...state.notifications] };
    }
    default:
      return state;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load);

  // Persist (skip transient flags)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, savedAt: vnow() })); } catch { /* quota or private mode: ignore */ }
  }, [state]);

  // Another tab wrote state: adopt it (last writer wins, same as a real backend would).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try { const parsed = JSON.parse(e.newValue); if (parsed && Array.isArray(parsed.items)) dispatch({ type: 'HYDRATE', state: parsed }); } catch { /* ignore */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Simulation clock: advance due transitions. One interval for the app's lifetime; reads the latest items via a ref.
  const itemsRef = useRef(state.items);
  itemsRef.current = state.items;
  useEffect(() => {
    const due = () => {
      if (document.visibilityState !== 'visible') return; // only the visible tab advances the simulation
      const now = vnow();
      itemsRef.current.forEach(it => { if (it.transition && it.transition.at <= now) dispatch({ type: 'ITEM_TRANSITION', id: it.id }); });
    };
    const id = setInterval(due, 400);
    return () => clearInterval(id);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}

export function useItem(id) {
  const { state } = useStore();
  return state.items.find(i => i.id === id);
}

export function resetDemo() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}
