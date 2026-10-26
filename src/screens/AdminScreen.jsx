import { useMemo, useState } from 'react';
import { useStore } from '../store/store.jsx';
import { useToast } from '../shared/toast.jsx';
import { navigate } from '../shared/router.js';
import { SectionHeader, Button, Badge, Card, Icon, ChannelChip, Toggle, Modal, ConfirmDialog, TextField, Eyebrow, EmptyState, Avatar } from '../shared/ui.jsx';
import { SL, CHANNELS, CHANNEL_KEYS } from '../shared/theme.js';
import { relativeTime } from '../shared/time.js';

const SECTIONS = [
  { key: 'channels', label: 'Channels', icon: 'layers' },
  { key: 'tonality', label: 'Tonality', icon: 'message-circle' },
  { key: 'glossary', label: 'Glossary', icon: 'book-open' },
  { key: 'seo', label: 'SEO rules', icon: 'trending-up' },
  { key: 'wcag', label: 'Accessibility', icon: 'accessibility' },
  { key: 'questions', label: 'Brief questions', icon: 'help-circle' },
  { key: 'roles', label: 'Roles & access', icon: 'users' },
  { key: 'integrations', label: 'Integrations', icon: 'plug' },
];

export default function AdminScreen({ section }) {
  const { state } = useStore();
  const counts = { channels: CHANNEL_KEYS.length, glossary: state.glossary.length, roles: state.roles.reduce((n, r) => n + r.members.length, 0), integrations: state.integrations.filter(i => i.status !== 'Disconnected').length };
  const valid = SECTIONS.some(s => s.key === section) ? section : 'channels';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 56px)' }}>
      <aside style={{ background: '#fff', borderRight: `1px solid ${SL.ui300}`, padding: 20, position: 'sticky', top: 56, alignSelf: 'flex-start', height: 'calc(100vh - 56px)' }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>Configuration</div>
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => navigate(`admin/${s.key}`)} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', borderRadius: 6,
            background: valid === s.key ? SL.himmelLighter : 'transparent', color: valid === s.key ? SL.coreBlue : SL.ui800,
            border: 'none', textAlign: 'left', fontSize: 14, fontWeight: valid === s.key ? 500 : 400, marginBottom: 2,
          }}>
            <Icon name={s.icon} size={15}/><span style={{ flex: 1 }}>{s.label}</span>
            {counts[s.key] !== undefined && <span style={{ fontSize: 11, color: SL.ui600 }}>{counts[s.key]}</span>}
          </button>
        ))}
        <div style={{ marginTop: 20, padding: 12, background: SL.ui100, borderRadius: 8, fontSize: 12, color: SL.ui600, lineHeight: 1.5 }}>
          <Icon name="info" size={12} color={SL.coreBlue}/> Changes here take effect on the next generation. Nothing is re-run retroactively.
        </div>
      </aside>
      <div style={{ padding: 32, background: SL.molnigare, minWidth: 0 }}>
        {valid === 'channels' && <ChannelsAdmin/>}
        {valid === 'glossary' && <GlossaryAdmin/>}
        {valid === 'tonality' && <TonalityAdmin/>}
        {valid === 'seo' && <SEORulesAdmin/>}
        {valid === 'wcag' && <WCAGAdmin/>}
        {valid === 'questions' && <QuestionsAdmin/>}
        {valid === 'roles' && <RolesAdmin/>}
        {valid === 'integrations' && <IntegrationsAdmin/>}
      </div>
    </div>
  );
}

// ---------- Channels ----------
function ChannelsAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  return (
    <>
      <SectionHeader eyebrow="Admin" title="Channel configurations" description="Each channel has its own tone, constraints, context sources, and brief questions. Marketing and SMEs configure these once — the AI applies them automatically."
        actions={<Button variant="primary" icon="plus" onClick={() => toast('New channels are added by the platform team — the five current channels cover the roadmap scope.', { icon: 'info' })}>New channel</Button>}/>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {CHANNEL_KEYS.map(key => {
          const c = CHANNELS[key]; const meta = state.channelConfig[key]; const qs = state.questions[key]; const tone = state.tonality.find(t => t.channel === key);
          return (
            <Card key={key} padding={0} hoverable>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${SL.ui200}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: c.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={c.color}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: SL.ui900 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: SL.ui600 }}>{qs.length} questions ({qs.filter(q => q.mandatory).length} mandatory) · v{meta.version} · {tone ? tone.do.length + tone.dont.length : 0} tonality rules</div>
                </div>
                <Badge tone="green" dot>Live</Badge>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <Row label="Optimizers" items={meta.optimizers}/>
                <Row label="Data sources" items={meta.data}/>
                <Row label="Owners" items={meta.owners}/>
              </div>
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${SL.ui200}`, background: SL.ui100, display: 'flex', gap: 8 }}>
                <Button variant="ghost" size="sm" icon="edit-2" onClick={() => setEditing(key)}>Edit</Button>
                <Button variant="ghost" size="sm" icon="message-circle" onClick={() => navigate('admin/tonality')}>Tonality</Button>
                <Button variant="ghost" size="sm" icon="help-circle" onClick={() => navigate(`admin/questions?channel=${key}`)}>Questions</Button>
                <div style={{ flex: 1 }}/>
                <Button variant="flat" size="sm" iconRight="arrow-right" onClick={() => navigate(`brief?channel=${key}`)}>Try a brief</Button>
              </div>
            </Card>
          );
        })}
      </div>
      {editing && <ChannelEditModal channel={editing} onClose={() => setEditing(null)} onSave={(patch) => { dispatch({ type: 'CHANNEL_CONFIG_UPDATE', channel: editing, patch }); setEditing(null); toast(`${CHANNELS[editing].label} configuration saved · v${patch.version}.`, { kind: 'success' }); }}/>}
    </>
  );
}

function ChannelEditModal({ channel, onClose, onSave }) {
  const { state } = useStore();
  const meta = state.channelConfig[channel];
  const [optimizers, setOptimizers] = useState(meta.optimizers.join(', '));
  const [data, setData] = useState(meta.data.join(', '));
  const [owners, setOwners] = useState(meta.owners.join(', '));
  const split = (s) => s.split(',').map(x => x.trim()).filter(Boolean);
  const bump = (v) => { const [a, b] = v.split('.').map(Number); return `${a}.${b + 1}`; };
  return (
    <Modal title={`Edit ${CHANNELS[channel].label} channel`} subtitle="Comma-separated lists. Saving bumps the configuration version." icon={CHANNELS[channel].icon} onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" onClick={() => onSave({ optimizers: split(optimizers), data: split(data), owners: split(owners), version: bump(meta.version) })}>Save · v{bump(meta.version)}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField label="Optimizers" value={optimizers} onChange={setOptimizers} helper="Automatic post-processing applied to every generation"/>
        <TextField label="Data sources" value={data} onChange={setData} helper="Context the AI reads before generating"/>
        <TextField label="Owners" value={owners} onChange={setOwners}/>
      </div>
    </Modal>
  );
}

function Row({ label, items }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 11, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500, width: 110, flex: 'none', marginTop: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {items.map(i => <span key={i} style={{ fontSize: 12, color: SL.ui800, background: SL.ui100, border: `1px solid ${SL.ui300}`, padding: '3px 8px', borderRadius: 9999 }}>{i}</span>)}
      </div>
    </div>
  );
}

// ---------- Glossary ----------
const EMPTY_TERM = { en: '', sv: '', de: '', nl: '', notes: '', protected: false };
function GlossaryAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // 'new' | term
  const [deleting, setDeleting] = useState(null);
  const [menu, setMenu] = useState(null);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return state.glossary.filter(t => !n || [t.en, t.sv, t.de, t.nl, t.notes].some(v => v?.toLowerCase().includes(n)));
  }, [state.glossary, q]);
  const save = (term) => {
    if (editing === 'new') { dispatch({ type: 'GLOSSARY_ADD', term }); toast(`"${term.en}" added — applied from the next generation.`, { kind: 'success' }); }
    else { dispatch({ type: 'GLOSSARY_UPDATE', id: editing.id, patch: term }); toast(`"${term.en}" updated.`, { kind: 'success' }); }
    setEditing(null);
  };
  return (
    <>
      <SectionHeader eyebrow="Admin · Glossary" title={`${state.glossary.length} terms · 4 languages shown of 8`} description="The AI applies these consistently across every channel and every translation. Brand names are protected from translation."
        actions={<>
          <Button variant="ghost" icon="upload" onClick={() => toast('CSV import accepts: en, sv, de, nl, da, no, pl, ga, notes. Duplicates are merged by EN term.', { icon: 'upload' })}>Import CSV</Button>
          <Button variant="primary" icon="plus" onClick={() => setEditing('new')}>New term</Button>
        </>}/>
      <Card padding={0} style={{ marginTop: 20 }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 8, background: SL.ui100 }}>
          <Icon name="search" size={14} color={SL.ui600}/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter terms in any language…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }}/>
          <span style={{ fontSize: 12, color: SL.ui600 }}>{list.length} of {state.glossary.length}</span>
        </div>
        {list.length === 0 ? <EmptyState icon="book-open" title="No terms match" action={<Button size="sm" variant="primary" icon="plus" onClick={() => setEditing('new')}>Add “{q}”</Button>}/> : (
          <table className="table">
            <thead><tr>{['Term (EN)', 'Swedish', 'German', 'Dutch', 'Notes', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map(t => (
                <tr key={t.id} className="row-hover">
                  <td style={{ fontWeight: 500, color: SL.ui900 }}>{t.en} {t.protected && <Badge tone="blue" icon="lock" style={{ marginLeft: 6 }}>Protected</Badge>}</td>
                  <td style={{ color: SL.ui800 }}>{t.sv}</td><td style={{ color: SL.ui800 }}>{t.de}</td><td style={{ color: SL.ui800 }}>{t.nl}</td>
                  <td style={{ fontSize: 12, color: SL.ui600 }}>{t.notes}</td>
                  <td style={{ position: 'relative', width: 40 }}>
                    <button onClick={() => setMenu(menu === t.id ? null : t.id)} aria-label="Actions" style={{ background: 'transparent', border: 'none', color: SL.ui600, padding: 4, borderRadius: 4 }}><Icon name="more-horizontal" size={14}/></button>
                    {menu === t.id && (
                      <div className="popover" style={{ top: 32, minWidth: 160 }} onMouseLeave={() => setMenu(null)}>
                        <button className="menu-item" onClick={() => { setEditing(t); setMenu(null); }}><Icon name="pencil" size={13}/> Edit</button>
                        <button className="menu-item" onClick={() => { dispatch({ type: 'GLOSSARY_UPDATE', id: t.id, patch: { protected: !t.protected } }); setMenu(null); }}><Icon name={t.protected ? 'unlock' : 'lock'} size={13}/> {t.protected ? 'Allow translation' : 'Protect from translation'}</button>
                        <button className="menu-item danger" onClick={() => { setDeleting(t); setMenu(null); }}><Icon name="trash-2" size={13}/> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {editing && <TermModal initial={editing === 'new' ? { ...EMPTY_TERM, en: q } : editing} onClose={() => setEditing(null)} onSave={save}/>}
      {deleting && <ConfirmDialog title={`Delete "${deleting.en}"?`} danger confirmLabel="Delete" icon="trash-2" body="Future generations and translations stop applying this term. Existing content is not changed." onClose={() => setDeleting(null)} onConfirm={() => { dispatch({ type: 'GLOSSARY_DELETE', id: deleting.id }); toast(`"${deleting.en}" deleted.`); setDeleting(null); }}/>}
    </>
  );
}
function TermModal({ initial, onClose, onSave }) {
  const [t, setT] = useState(initial);
  const set = (k) => (v) => setT(x => ({ ...x, [k]: v }));
  const valid = t.en.trim() && (t.protected || (t.sv.trim() && t.de.trim() && t.nl.trim()));
  return (
    <Modal title={initial.id ? 'Edit term' : 'New glossary term'} subtitle="Protected terms are copied verbatim into every language." icon="book-open" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" disabled={!valid} onClick={() => onSave({ ...t, sv: t.protected ? t.en : t.sv, de: t.protected ? t.en : t.de, nl: t.protected ? t.en : t.nl })}>Save term</Button></>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextField label="English" value={t.en} onChange={set('en')} required autoFocus/>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, fontSize: 13, color: SL.ui800 }}><Toggle on={!!t.protected} onChange={set('protected')} label="Protected"/> Brand name — never translate</label>
        {!t.protected && <>
          <TextField label="Swedish" value={t.sv} onChange={set('sv')} required/>
          <TextField label="German" value={t.de} onChange={set('de')} required/>
          <TextField label="Dutch" value={t.nl} onChange={set('nl')} required/>
        </>}
        <TextField label="Notes" value={t.notes} onChange={set('notes')} style={{ gridColumn: '1 / -1' }} helper="Guidance the AI sees when choosing this term"/>
      </div>
    </Modal>
  );
}

// ---------- Tonality ----------
function TonalityAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [adding, setAdding] = useState(null); // {channel, kind}
  const [text, setText] = useState('');
  const add = () => { if (!text.trim()) return; dispatch({ type: 'TONALITY_ADD', channel: adding.channel, kind: adding.kind, text: text.trim() }); toast(`Rule added to ${CHANNELS[adding.channel].label} · ${adding.kind === 'do' ? 'Do' : "Don't"}.`, { kind: 'success' }); setAdding(null); setText(''); };
  return (
    <>
      <SectionHeader eyebrow="Admin · Tonality" title="Voice rules per channel" description="The AI uses these as the first context layer for every generation. Adjust the rules — the next brief picks up the change."/>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {state.tonality.map(t => (
          <Card key={t.channel} padding={0}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui200}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChannelChip channel={t.channel}/><span style={{ fontSize: 12, color: SL.ui600 }}>· UK market</span>
              <Badge tone="neutral" style={{ marginLeft: 'auto' }}>{t.do.length + t.dont.length} rules</Badge>
            </div>
            <div style={{ padding: 18 }}>
              {['do', 'dont'].map(kind => (
                <div key={kind} style={{ marginBottom: kind === 'do' ? 12 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: kind === 'do' ? SL.green700 : SL.sjobod, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6 }}>{kind === 'do' ? 'Do' : "Don't"}</div>
                  {t[kind].map(d => (
                    <div key={d} className="rule-row" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: SL.ui800, padding: '4px 0' }}>
                      <Icon name={kind === 'do' ? 'check' : 'x'} size={12} color={kind === 'do' ? SL.green600 : SL.sjobod}/>
                      <span style={{ flex: 1 }}>{d}</span>
                      <button title="Remove rule" onClick={() => { dispatch({ type: 'TONALITY_REMOVE', channel: t.channel, kind, text: d }); toast(`Removed "${d}".`, { action: { label: 'Undo', onClick: () => dispatch({ type: 'TONALITY_ADD', channel: t.channel, kind, text: d }) } }); }} style={{ background: 'transparent', border: 'none', color: SL.ui400, padding: 2, borderRadius: 4, display: 'inline-flex' }}><Icon name="x" size={12}/></button>
                    </div>
                  ))}
                  {adding?.channel === t.channel && adding?.kind === kind ? (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input autoFocus value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(null); }} placeholder={kind === 'do' ? 'e.g. Use metric and imperial' : 'e.g. Exclamation marks'} style={{ flex: 1, border: `1px solid ${SL.modernBlue}`, borderRadius: 6, padding: '5px 8px', fontSize: 13, outline: 'none' }}/>
                      <Button size="sm" variant="primary" onClick={add} disabled={!text.trim()}>Add</Button>
                    </div>
                  ) : (
                    <button className="pill-btn" style={{ marginTop: 4 }} onClick={() => { setAdding({ channel: t.channel, kind }); setText(''); }}><Icon name="plus" size={11}/> Add rule</button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

// ---------- SEO ----------
function SEORulesAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [kw, setKw] = useState('');
  const [vol, setVol] = useState('');
  const ALL_SD = ['TravelAction', 'BreadcrumbList', 'FAQPage', 'Organization', 'Event', 'Offer'];
  const tone = { Primary: 'blue', Secondary: 'orange', 'Long-tail': 'neutral' };
  return (
    <>
      <SectionHeader eyebrow="Admin · SEO" title="Search optimization rules" description="Maintained by SEO specialists. Applied automatically to every website brief — content editors never see these settings."/>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <Eyebrow color={SL.coreBlue}>Keyword strategy · UK route landing</Eyebrow>
          {state.seo.keywords.map((k, i) => (
            <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${SL.ui200}`, fontSize: 13 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: SL.ui900, fontWeight: 500 }}>{k.kw}</div>
                <div style={{ fontSize: 11, color: SL.ui600 }}>{k.vol}/mo</div>
              </div>
              <button onClick={() => dispatch({ type: 'SEO_KW_CYCLE', id: k.id })} title="Click to change priority" style={{ background: 'transparent', border: 'none', padding: 0 }}><Badge tone={tone[k.priority]}>{k.priority}</Badge></button>
              <button onClick={() => { dispatch({ type: 'SEO_KW_DELETE', id: k.id }); toast(`Removed "${k.kw}".`); }} title="Remove" style={{ background: 'transparent', border: 'none', color: SL.ui400, padding: 2, display: 'inline-flex' }}><Icon name="x" size={12}/></button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <input value={kw} onChange={e => setKw(e.target.value)} placeholder="New keyword" onKeyDown={e => { if (e.key === 'Enter' && kw.trim()) { dispatch({ type: 'SEO_KW_ADD', kw: kw.trim(), vol: vol || '—' }); setKw(''); setVol(''); } }} style={{ flex: 1, border: `1px solid ${SL.ui400}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none' }}/>
            <input value={vol} onChange={e => setVol(e.target.value)} placeholder="vol/mo" style={{ width: 80, border: `1px solid ${SL.ui400}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none' }}/>
            <Button size="sm" variant="primary" icon="plus" disabled={!kw.trim()} onClick={() => { dispatch({ type: 'SEO_KW_ADD', kw: kw.trim(), vol: vol || '—' }); setKw(''); setVol(''); toast(`"${kw.trim()}" added as Secondary — click the badge to change priority.`, { kind: 'success' }); }}>Add</Button>
          </div>
        </Card>
        <Card>
          <Eyebrow color={SL.coreBlue}>Heading hierarchy</Eyebrow>
          <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: SL.ui800, background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: 12, lineHeight: 1.7 }}>
            <div><span style={{ color: SL.modernBlue }}>H1</span> · primary keyword · 50–70 chars</div>
            <div><span style={{ color: SL.modernBlue }}>H2</span> · 2–4 per page · question form preferred</div>
            <div><span style={{ color: SL.modernBlue }}>H3</span> · scannable · contains location modifier</div>
            <div><span style={{ color: SL.modernBlue }}>meta</span> · {state.seo.metaPattern}</div>
          </div>
          <Eyebrow color={SL.coreBlue} style={{ marginTop: 16, marginBottom: 8 }}>Structured data · click to toggle</Eyebrow>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ALL_SD.map(s => { const on = state.seo.structuredData.includes(s); return <button key={s} onClick={() => dispatch({ type: 'SEO_SD_TOGGLE', name: s })} style={{ background: 'transparent', border: 'none', padding: 0 }}><Badge tone={on ? 'blue' : 'neutral'} icon={on ? 'check' : 'plus'}>{s}</Badge></button>; })}
          </div>
        </Card>
      </div>
      <Card style={{ marginTop: 16 }}>
        <Eyebrow color={SL.coreBlue} icon="bar-chart-3">Performance feedback loop</Eyebrow>
        <div style={{ fontSize: 13, color: SL.ui800, lineHeight: 1.6, marginBottom: 12 }}>The platform snapshots Google Search Console rankings before each publish, then tracks them for 30 days. Patterns that move rankings feed back into this configuration.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MiniStatBlock label="Tracked URLs" value="847"/>
          <MiniStatBlock label="Avg position lift" value="+3.2" tone="green"/>
          <MiniStatBlock label="Organic traffic Δ" value="+24%" tone="green"/>
          <MiniStatBlock label="Last sync" value={relativeTime(state.integrations.find(i => i.id === 'gsc')?.lastSync || 0)}/>
        </div>
      </Card>
    </>
  );
}
function MiniStatBlock({ label, value, tone }) {
  const colors = { green: SL.green700, red: SL.sjobod };
  return (
    <div style={{ background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: 12 }}>
      <div style={{ fontSize: 11, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: colors[tone] || SL.ui900, marginTop: 4 }}>{value}</div>
    </div>
  );
}

// ---------- WCAG ----------
function WCAGAdmin() {
  const { state, dispatch } = useStore();
  const on = state.wcag.filter(w => w.on).length;
  return (
    <>
      <SectionHeader eyebrow="Admin · Accessibility" title={`WCAG 2.2 AA · ${on} of ${state.wcag.length} rules enforced`} description="Embedded in the AI's generation logic. Applied to every website and app brief. Configured by accessibility experts."/>
      <Card style={{ marginTop: 20 }}>
        {state.wcag.map((r, i, arr) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${SL.ui200}` : 'none', opacity: r.on ? 1 : .6 }}>
            <Icon name={r.icon} size={18} color={r.on ? SL.turq500 : SL.ui400}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{r.rule}</div>
              <div style={{ fontSize: 12, color: SL.ui600 }}>{r.desc}</div>
            </div>
            <span style={{ fontSize: 12, color: r.on ? SL.green700 : SL.ui600, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name={r.on ? 'check-circle-2' : 'minus-circle'} size={14} color={r.on ? SL.green600 : SL.ui400}/> {r.on ? 'Applied to website + app' : 'Off'}
            </span>
            <Toggle on={r.on} onChange={() => dispatch({ type: 'WCAG_TOGGLE', id: r.id })} label={r.rule}/>
          </div>
        ))}
      </Card>
    </>
  );
}

// ---------- Brief questions ----------
function QuestionsAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const initial = new URLSearchParams(window.location.hash.split('?')[1] || '').get('channel');
  const [channel, setChannel] = useState(CHANNELS[initial] ? initial : 'website');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const list = state.questions[channel];
  return (
    <>
      <SectionHeader eyebrow={`Admin · Brief questions · ${CHANNELS[channel].label}`} title="What the assistant asks" description="Marketing decides which questions are mandatory. The assistant validates completeness before submitting to Monday.com. Changes apply to the next brief immediately."
        actions={<><Button variant="ghost" icon="sparkles" onClick={() => navigate(`brief?channel=${channel}`)}>Try it</Button><Button variant="primary" icon="plus" onClick={() => setAdding(true)}>Add question</Button></>}/>
      <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
        {CHANNEL_KEYS.map(c => <button key={c} className={`pill-btn ${channel === c ? 'active' : ''}`} onClick={() => setChannel(c)}>{CHANNELS[c].label} <span style={{ opacity: .7 }}>· {state.questions[c].length}</span></button>)}
      </div>
      <Card style={{ marginTop: 14 }} padding={0}>
        {list.length === 0 && <EmptyState icon="help-circle" title="No questions" body="The assistant will submit the brief with channel defaults only." action={<Button size="sm" variant="primary" icon="plus" onClick={() => setAdding(true)}>Add question</Button>}/>}
        {list.map((q, i) => (
          <div key={q.id} style={{ padding: '14px 20px', borderBottom: i < list.length - 1 ? `1px solid ${SL.ui200}` : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button disabled={i === 0} onClick={() => dispatch({ type: 'QUESTION_MOVE', channel, id: q.id, dir: -1 })} title="Move up" style={{ background: 'transparent', border: 'none', color: i === 0 ? SL.ui300 : SL.ui600, padding: 0, display: 'inline-flex' }}><Icon name="chevron-up" size={14}/></button>
              <button disabled={i === list.length - 1} onClick={() => dispatch({ type: 'QUESTION_MOVE', channel, id: q.id, dir: 1 })} title="Move down" style={{ background: 'transparent', border: 'none', color: i === list.length - 1 ? SL.ui300 : SL.ui600, padding: 0, display: 'inline-flex' }}><Icon name="chevron-down" size={14}/></button>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: SL.ui100, color: SL.ui600, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{q.q}</div>
              {q.helper && <div style={{ fontSize: 12, color: SL.ui600, marginTop: 2 }}>{q.helper}</div>}
              {q.conditional && <div style={{ fontSize: 11, color: SL.modernBlue, marginTop: 2 }}>{q.conditional}</div>}
            </div>
            <button onClick={() => dispatch({ type: 'QUESTION_UPDATE', channel, id: q.id, patch: { mandatory: !q.mandatory } })} title="Toggle required" style={{ background: 'transparent', border: 'none', padding: 0 }}><Badge tone={q.mandatory ? 'red' : 'neutral'}>{q.mandatory ? 'Required' : 'Optional'}</Badge></button>
            <Button size="sm" variant="ghost" icon="pencil" onClick={() => setEditing(q)}>Edit</Button>
            <button onClick={() => { dispatch({ type: 'QUESTION_DELETE', channel, id: q.id }); toast(`Question removed.`, { action: { label: 'Undo', onClick: () => dispatch({ type: 'QUESTION_ADD', channel, question: q }) } }); }} title="Delete" style={{ background: 'transparent', border: 'none', color: SL.ui400, padding: 4, display: 'inline-flex' }}><Icon name="trash-2" size={14}/></button>
          </div>
        ))}
      </Card>
      {(adding || editing) && <QuestionModal initial={editing || { q: '', helper: '', mandatory: true }} onClose={() => { setAdding(false); setEditing(null); }}
        onSave={(qq) => { if (editing) dispatch({ type: 'QUESTION_UPDATE', channel, id: editing.id, patch: qq }); else dispatch({ type: 'QUESTION_ADD', channel, question: qq }); setAdding(false); setEditing(null); toast(editing ? 'Question updated.' : `Question added — the ${CHANNELS[channel].label} assistant now asks ${list.length + 1} questions.`, { kind: 'success' }); }}/>}
    </>
  );
}
function QuestionModal({ initial, onClose, onSave }) {
  const [q, setQ] = useState(initial.q); const [helper, setHelper] = useState(initial.helper || ''); const [mandatory, setMandatory] = useState(initial.mandatory);
  return (
    <Modal title={initial.id ? 'Edit question' : 'Add question'} subtitle="Asked by the Brief Assistant in this order." icon="help-circle" onClose={onClose}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" icon="check" disabled={!q.trim()} onClick={() => onSave({ q: q.trim(), helper: helper.trim() || undefined, mandatory })}>Save</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextField label="Question" value={q} onChange={setQ} autoFocus required placeholder="e.g. Which fare types should be mentioned?"/>
        <TextField label="Helper text" value={helper} onChange={setHelper} placeholder="Shown under the question"/>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: SL.ui800 }}><Toggle on={mandatory} onChange={setMandatory} label="Required"/> Required before the brief can be submitted</label>
      </div>
    </Modal>
  );
}

// ---------- Roles ----------
function RolesAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [invite, setInvite] = useState(false);
  const [name, setName] = useState(''); const [roleId, setRoleId] = useState(state.roles[0].id);
  const [expanded, setExpanded] = useState(null);
  return (
    <>
      <SectionHeader eyebrow="Admin · Roles" title="Roles & access" description="Role-based access extended for the new content creation workflow. Roles are mirrored from Azure AD groups." actions={<Button variant="primary" icon="user-plus" onClick={() => setInvite(true)}>Invite</Button>}/>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {state.roles.map(r => (
          <Card key={r.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: SL.ui900 }}>{r.name}</div>
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} style={{ background: 'transparent', border: 'none', padding: 0 }}><Badge tone="neutral" icon={expanded === r.id ? 'chevron-up' : 'chevron-down'}>{r.members.length} users</Badge></button>
            </div>
            {r.perms.map(p => <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: SL.ui800, padding: '3px 0' }}><Icon name="check" size={12} color={SL.green600}/> {p}</div>)}
            <div style={{ display: 'flex', marginTop: 10, gap: 4, flexWrap: 'wrap' }}>
              {(expanded === r.id ? r.members : r.members.slice(0, 6)).map(m => (
                <span key={m} title={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 9999, padding: '2px 8px 2px 2px', fontSize: 12 }}>
                  <Avatar name={m} size={18}/>{expanded === r.id ? m : m.split(' ')[0]}
                  {expanded === r.id && <button onClick={() => { dispatch({ type: 'ROLE_REMOVE', roleId: r.id, name: m }); toast(`${m} removed from ${r.name}.`, { action: { label: 'Undo', onClick: () => dispatch({ type: 'ROLE_INVITE', roleId: r.id, name: m }) } }); }} title="Remove" style={{ background: 'transparent', border: 'none', color: SL.ui500, padding: 0, display: 'inline-flex' }}><Icon name="x" size={11}/></button>}
                </span>
              ))}
              {expanded !== r.id && r.members.length > 6 && <span style={{ fontSize: 12, color: SL.ui600, alignSelf: 'center' }}>+{r.members.length - 6}</span>}
            </div>
          </Card>
        ))}
      </div>
      {invite && (
        <Modal title="Invite user" subtitle="Adds the person to the role's Azure AD group and sends an invitation email." icon="user-plus" onClose={() => setInvite(false)}
          footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancel</Button><Button variant="primary" icon="send-horizontal" disabled={!name.trim()} onClick={() => { dispatch({ type: 'ROLE_INVITE', roleId, name: name.trim() }); toast(`${name.trim()} invited as ${state.roles.find(r => r.id === roleId).name}.`, { kind: 'success' }); setInvite(false); setName(''); }}>Send invite</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <TextField label="Name" value={name} onChange={setName} autoFocus required placeholder="e.g. Maja Lindgren"/>
            <label className="field"><span>Role</span><select value={roleId} onChange={e => setRoleId(e.target.value)}>{state.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
          </div>
        </Modal>
      )}
    </>
  );
}

// ---------- Integrations ----------
function IntegrationsAdmin() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [testing, setTesting] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const test = (i) => { setTesting(i.id); setTimeout(() => { setTesting(null); dispatch({ type: 'INT_SYNC', id: i.id }); toast(`${i.name}: connection OK · 212 ms.`, { kind: 'success' }); }, 1200); };
  return (
    <>
      <SectionHeader eyebrow="Admin · Integrations" title="Connected systems" description="The platform sits between Monday.com, AEM, and the data sources. None of these own content — they feed context to the AI."/>
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {state.integrations.map(i => {
          const off = i.status === 'Disconnected';
          return (
            <Card key={i.id} style={{ opacity: off ? .75 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: i.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={i.icon} size={18} color={off ? SL.ui400 : i.color}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: SL.ui900 }}>{i.name}</span>
                    <Badge tone={i.status === 'Connected' ? 'green' : off ? 'red' : 'neutral'} dot>{i.status}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: SL.ui600, marginTop: 2 }}>{i.desc}</div>
                  <div style={{ fontSize: 11, color: SL.ui500, marginTop: 4 }}>{off ? 'Not syncing' : `Last sync ${relativeTime(i.lastSync)}`}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button size="sm" variant="ghost" icon="plug-zap" loading={testing === i.id} disabled={off} onClick={() => test(i)}>Test connection</Button>
                <Button size="sm" variant={off ? 'primary' : 'ghost'} icon={off ? 'plug' : 'unplug'} onClick={() => (off ? (dispatch({ type: 'INT_TOGGLE', id: i.id }), toast(`${i.name} reconnected.`, { kind: 'success' })) : setConfirm(i))}>{off ? 'Reconnect' : 'Disconnect'}</Button>
                <div style={{ flex: 1 }}/>
                <Button size="sm" variant="flat" iconRight="external-link" onClick={() => toast(`Would open ${i.name} admin console.`, { icon: 'external-link' })}>Console</Button>
              </div>
            </Card>
          );
        })}
      </div>
      {confirm && <ConfirmDialog title={`Disconnect ${confirm.name}?`} danger confirmLabel="Disconnect" icon="unplug" body={confirm.id === 'monday' ? 'Briefs stop flowing in — the webhook is removed. Existing briefs stay in the queue.' : confirm.id === 'aem' ? 'Approved content can no longer be written to fragments or DAM until reconnected.' : 'The AI loses this context source for new generations.'} onClose={() => setConfirm(null)} onConfirm={() => { dispatch({ type: 'INT_TOGGLE', id: confirm.id }); toast(`${confirm.name} disconnected.`); setConfirm(null); }}/>}
    </>
  );
}
