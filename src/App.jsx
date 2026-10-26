import { useEffect, useMemo, useRef, useState } from 'react';
import { StoreProvider, useStore, resetDemo } from './store/store.jsx';
import { ToastProvider, useToast } from './shared/toast.jsx';
import { useRoute, navigate } from './shared/router.js';
import { Icon, Avatar, Badge, ConfirmDialog, ChannelChip, StatusPill } from './shared/ui.jsx';
import { SL, CHANNELS, asset } from './shared/theme.js';
import { USER } from './shared/data.js';
import { relativeTime } from './shared/time.js';
import QueueScreen from './screens/QueueScreen.jsx';
import ReviewScreen from './screens/ReviewScreen.jsx';
import BriefAssistantScreen from './screens/BriefAssistantScreen.jsx';
import ImageGenScreen from './screens/ImageGenScreen.jsx';
import AdminScreen from './screens/AdminScreen.jsx';

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Shell/>
      </ToastProvider>
    </StoreProvider>
  );
}

const NAV = [
  { key: 'queue', label: 'Review queue', icon: 'inbox' },
  { key: 'brief', label: 'New brief', icon: 'sparkles' },
  { key: 'images', label: 'Image generation', icon: 'image' },
  { key: 'admin', label: 'Admin', icon: 'settings' },
];

function Shell() {
  const route = useRoute();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(o => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeNav = route.page === 'review' ? 'queue' : route.page;

  return (
    <>
      <AppBar active={activeNav} onSearch={() => setPaletteOpen(true)}/>
      {route.page === 'queue' && <QueueScreen/>}
      {route.page === 'review' && <ReviewScreen id={route.id}/>}
      {route.page === 'brief' && <BriefAssistantScreen key={route.params.channel || 'new'} initialChannel={route.params.channel}/>}
      {route.page === 'images' && <ImageGenScreen fromReview={route.params.from}/>}
      {route.page === 'admin' && <AdminScreen section={route.id || 'channels'}/>}
      {!['queue', 'review', 'brief', 'images', 'admin'].includes(route.page) && <QueueScreen/>}
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)}/>}
    </>
  );
}

function AppBar({ active, onSearch }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [open, setOpen] = useState(null); // 'notifs' | 'help' | 'user'
  const [confirmReset, setConfirmReset] = useState(false);
  const wrapRef = useRef(null);
  const unread = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDown); window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const openNotif = (n) => {
    dispatch({ type: 'NOTIF_READ', id: n.id });
    setOpen(null);
    if (n.link?.type === 'review') navigate(`review/${n.link.id}`);
    else if (n.link?.type === 'images') navigate('images');
  };

  return (
    <div className="appbar">
      <button className="appbar-brand" onClick={() => navigate('queue')} title="Go to review queue">
        <img src={asset('ds/StenaFlag.svg')} alt="Stena Line"/>
        <div>
          <div className="appbar-product">AI Content Lifecycle</div>
          <div className="appbar-product-sub">Marketing platform · prototype</div>
        </div>
      </button>
      <nav className="appbar-nav" aria-label="Primary">
        {NAV.map(t => (
          <button key={t.key} className={active === t.key ? 'active' : ''} onClick={() => navigate(t.key)}>
            <Icon name={t.icon} size={15}/> {t.label}
          </button>
        ))}
      </nav>
      <div className="appbar-actions" ref={wrapRef}>
        <Badge tone="orange" icon="flask-conical" title="All numbers, briefs and integrations are sample data">Sample data</Badge>
        <button className="appbar-search" onClick={onSearch} aria-label="Search (⌘K)">
          <Icon name="search" size={14}/>
          <span className="placeholder">Search briefs, content, fragments…</span>
          <kbd>⌘K</kbd>
        </button>
        <div style={{ position: 'relative' }}>
          <button className={`appbar-icon-btn ${open === 'help' ? 'open' : ''}`} title="Help" onClick={() => setOpen(o => (o === 'help' ? null : 'help'))}><Icon name="help-circle" size={18}/></button>
          {open === 'help' && (
            <div className="popover" style={{ width: 320 }}>
              <div className="popover-head">About this prototype</div>
              <div style={{ padding: '12px 14px', fontSize: 13, color: SL.ui700, lineHeight: 1.55 }}>
                <p style={{ margin: '0 0 8px' }}>Clickable prototype of the AI Content Lifecycle platform. Everything you see is sample data — changes are kept in this browser only.</p>
                <p style={{ margin: '0 0 8px' }}><strong>Try:</strong> open a brief from the queue and press <em>Regenerate</em> with feedback, create a brief with the assistant and watch it enter the queue, or edit a glossary term in Admin.</p>
                <p style={{ margin: 0 }}>Shortcuts: <kbd>⌘K</kbd> search · <kbd>Esc</kbd> close</p>
              </div>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button className={`appbar-icon-btn ${open === 'notifs' ? 'open' : ''}`} title="Notifications" onClick={() => setOpen(o => (o === 'notifs' ? null : 'notifs'))}>
            <Icon name="bell" size={18}/>
            {unread > 0 && <span className="notif-dot">{unread}</span>}
          </button>
          {open === 'notifs' && (
            <div className="popover" style={{ width: 360 }}>
              <div className="popover-head">
                Notifications
                {unread > 0 && <button onClick={() => dispatch({ type: 'NOTIF_READ_ALL' })} style={{ background: 'transparent', border: 'none', color: SL.coreBlue, fontSize: 12, fontWeight: 500 }}>Mark all read</button>}
              </div>
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {state.notifications.length === 0 && <div style={{ padding: 20, fontSize: 13, color: SL.ui600, textAlign: 'center' }}>Nothing yet.</div>}
                {state.notifications.slice(0, 12).map(n => (
                  <button key={n.id} className={`popover-item ${n.read ? '' : 'unread'}`} onClick={() => openNotif(n)}>
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: n.read ? 'transparent' : SL.modernBlue, marginTop: 6, flex: 'none' }}/>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 500, color: SL.ui900 }}>{n.title}</span>
                      <span style={{ display: 'block', color: SL.ui600, fontSize: 12, marginTop: 2 }}>{n.body}</span>
                      <span style={{ display: 'block', color: SL.ui500, fontSize: 11, marginTop: 2 }}>{relativeTime(n.at)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpen(o => (o === 'user' ? null : 'user'))} title={USER.name} style={{ background: 'transparent', border: 'none', padding: 2, borderRadius: 9999, display: 'flex' }}>
            <Avatar name={USER.name} size={32} color={SL.coreBlue}/>
          </button>
          {open === 'user' && (
            <div className="popover" style={{ width: 260 }}>
              <div style={{ padding: '12px 14px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar name={USER.name} size={36} color={SL.coreBlue}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: SL.ui900 }}>{USER.name}</div>
                  <div style={{ fontSize: 11, color: SL.ui600 }}>{USER.role}</div>
                </div>
              </div>
              <button className="menu-item" onClick={() => { setOpen(null); navigate('admin/roles'); }}><Icon name="users" size={14}/> Roles & access</button>
              <button className="menu-item" onClick={() => { setOpen(null); toast('Would open Monday.com board "Content briefs" in a new tab.', { icon: 'external-link' }); }}><Icon name="external-link" size={14}/> Open Monday.com</button>
              <button className="menu-item" onClick={() => { setOpen(null); setConfirmReset(true); }}><Icon name="rotate-ccw" size={14}/> Reset demo data</button>
              <button className="menu-item danger" onClick={() => { setOpen(null); toast('Signed out (prototype — nothing actually happens).', { icon: 'log-out' }); }}><Icon name="log-out" size={14}/> Sign out</button>
            </div>
          )}
        </div>
      </div>
      {confirmReset && (
        <ConfirmDialog title="Reset demo data?" icon="rotate-ccw"
          body="This discards every change made in this browser — approvals, new briefs, glossary edits — and restores the original sample data."
          confirmLabel="Reset" danger onClose={() => setConfirmReset(false)}
          onConfirm={() => { resetDemo(); dispatch({ type: 'RESET' }); setConfirmReset(false); navigate('queue'); toast('Demo data restored.', { kind: 'success' }); }}/>
      )}
    </div>
  );
}

// ---------- Command palette (⌘K) ----------
const ADMIN_SECTIONS = [
  { key: 'channels', label: 'Channels' }, { key: 'tonality', label: 'Tonality' }, { key: 'glossary', label: 'Glossary' }, { key: 'seo', label: 'SEO rules' },
  { key: 'wcag', label: 'Accessibility' }, { key: 'questions', label: 'Brief questions' }, { key: 'roles', label: 'Roles & access' }, { key: 'integrations', label: 'Integrations' },
];

function CommandPalette({ onClose }) {
  const { state } = useStore();
  const [q, setQ] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (...parts) => !needle || parts.filter(Boolean).some(p => String(p).toLowerCase().includes(needle));
    const groups = [];
    const pages = [
      { label: 'Review queue', icon: 'inbox', go: 'queue' }, { label: 'New brief', icon: 'sparkles', go: 'brief' },
      { label: 'Image generation', icon: 'image', go: 'images' }, ...ADMIN_SECTIONS.map(s => ({ label: `Admin · ${s.label}`, icon: 'settings', go: `admin/${s.key}` })),
    ].filter(p => match(p.label));
    if (pages.length) groups.push({ title: 'Pages', items: pages.map(p => ({ key: p.go, label: p.label, icon: p.icon, go: p.go })) });
    const briefs = state.items.filter(i => match(i.id, i.title, i.requester.name, i.brief.fragment, i.brief.pageUrl, CHANNELS[i.channel].label)).slice(0, 8);
    if (briefs.length) groups.push({ title: 'Briefs', items: briefs.map(i => ({ key: i.id, label: i.title, sub: i.id, icon: CHANNELS[i.channel].icon, go: `review/${i.id}`, item: i })) });
    const fields = [];
    if (needle.length >= 3) {
      state.items.forEach(i => {
        (i.content.fields || []).forEach(f => { const v = f.after ?? f.value; if (match(v, f.name)) fields.push({ key: `${i.id}-${f.name}`, label: `${f.name} — ${v.slice(0, 70)}${v.length > 70 ? '…' : ''}`, sub: i.id, icon: 'file-text', go: `review/${i.id}` }); });
        (i.content.posts || []).forEach(p => { if (match(p.caption)) fields.push({ key: `${i.id}-${p.platform}`, label: `${p.platform} — ${p.caption.slice(0, 70)}…`, sub: i.id, icon: 'megaphone', go: `review/${i.id}` }); });
      });
    }
    if (fields.length) groups.push({ title: 'Content', items: fields.slice(0, 6) });
    const terms = state.glossary.filter(g => match(g.en, g.sv, g.de, g.nl, g.notes)).slice(0, 6);
    if (terms.length && needle) groups.push({ title: 'Glossary', items: terms.map(g => ({ key: g.id, label: `${g.en} · ${g.sv} · ${g.de} · ${g.nl}`, sub: g.notes, icon: 'book-open', go: 'admin/glossary' })) });
    return groups;
  }, [q, state]);

  const flat = results.flatMap(g => g.items);
  useEffect(() => { setCursor(0); }, [q]);

  const go = (item) => { if (!item) return; navigate(item.go); onClose(); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { go(flat[cursor]); }
    else if (e.key === 'Escape') onClose();
  };

  let idx = -1;
  return (
    <div className="cmdk" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmdk-panel" role="dialog" aria-label="Search">
        <div className="cmdk-input">
          <Icon name="search" size={18} color={SL.ui600}/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Search briefs, content, glossary, pages…"/>
          <kbd style={{ fontSize: 11, color: SL.ui600, background: SL.ui100, border: `1px solid ${SL.ui300}`, padding: '2px 6px', borderRadius: 4, fontFamily: 'inherit' }}>esc</kbd>
        </div>
        <div className="cmdk-list">
          {flat.length === 0 && <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: SL.ui600 }}>No matches for “{q}”.</div>}
          {results.map(g => (
            <div key={g.title}>
              <div className="cmdk-group">{g.title}</div>
              {g.items.map(it => { idx++; const active = idx === cursor; return (
                <button key={it.key} className={`cmdk-item ${active ? 'active' : ''}`} onMouseEnter={() => setCursor(flat.indexOf(it))} onClick={() => go(it)}>
                  <Icon name={it.icon} size={16} color={active ? SL.coreBlue : SL.ui600}/>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                  {it.item && <StatusPill state={it.item.state}/>}
                  {it.item && <ChannelChip channel={it.item.channel} size="sm"/>}
                  {it.sub && !it.item && <span className="sub">{it.sub}</span>}
                  {it.item && <span className="sub">{it.sub}</span>}
                </button>
              ); })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
