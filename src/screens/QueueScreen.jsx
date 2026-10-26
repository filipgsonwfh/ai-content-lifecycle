import { useMemo, useState } from 'react';
import { useStore } from '../store/store.jsx';
import { useToast } from '../shared/toast.jsx';
import { navigate } from '../shared/router.js';
import { PageShell, Button, StatTile, Tabs, ChannelChip, StatusPill, Avatar, Icon, SectionHeader, EmptyState, ConfirmDialog, TextField } from '../shared/ui.jsx';
import { SL, CHANNELS, CHANNEL_KEYS } from '../shared/theme.js';
import { relativeTime, DEMO_DATE_LABEL } from '../shared/time.js';
import { USER } from '../shared/data.js';

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

export default function QueueScreen() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [sort, setSort] = useState('updated'); // updated | priority | id
  const [selected, setSelected] = useState([]);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const items = useMemo(() => {
    const list = state.items.filter(i => (filter === 'all' || i.state === filter) && (channelFilter === 'all' || i.channel === channelFilter));
    return list.sort((a, b) => sort === 'updated' ? b.updatedAt - a.updatedAt : sort === 'priority' ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.updatedAt - a.updatedAt : a.id.localeCompare(b.id));
  }, [state.items, filter, channelFilter, sort]);

  const counts = useMemo(() => {
    const c = { all: state.items.length };
    for (const k of ['pending', 'iterating', 'translating', 'approved', 'rejected', 'queued', 'generating']) c[k] = state.items.filter(i => i.state === k).length;
    return c;
  }, [state.items]);

  const firstName = USER.name.split(' ')[0];
  const summary = [
    counts.pending ? `${counts.pending} brief${counts.pending === 1 ? '' : 's'} need${counts.pending === 1 ? 's' : ''} your review` : 'Nothing waiting for review',
    counts.translating ? `${counts.translating} translating` : null,
    counts.iterating ? `${counts.iterating} iterating with marketing` : null,
    counts.generating ? `${counts.generating} generating now` : null,
  ].filter(Boolean).join(' · ');

  const selectedItems = state.items.filter(i => selected.includes(i.id));
  const reviewable = selectedItems.filter(i => ['pending', 'iterating'].includes(i.state));
  const toggle = (id) => setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const allVisibleSelected = items.length > 0 && items.every(i => selected.includes(i.id));

  const bulkApprove = () => {
    reviewable.forEach(i => dispatch({ type: 'ITEM_APPROVE', id: i.id }));
    toast(`${reviewable.length} brief${reviewable.length === 1 ? '' : 's'} approved and sent to translation.`, { kind: 'success' });
    setSelected([]);
  };
  const bulkReject = () => {
    reviewable.forEach(i => dispatch({ type: 'ITEM_REJECT', id: i.id, reason: reason || 'Rejected from queue' }));
    toast(`${reviewable.length} brief${reviewable.length === 1 ? '' : 's'} rejected — requesters notified in Monday.com.`);
    setSelected([]); setRejecting(false); setReason('');
  };

  const pipeline = [
    { stage: 'Brief picked up', count: state.items.filter(i => i.state !== 'queued').length, sub: 'from Monday.com', icon: 'webhook', color: SL.ui600, filter: 'all' },
    { stage: 'AI generated', count: state.items.filter(i => i.iter > 0).length, sub: 'avg 1m 24s', icon: 'sparkles', color: SL.modernBlue, filter: 'all' },
    { stage: 'In review', count: counts.pending + counts.iterating, sub: 'awaiting editor', icon: 'eye', color: SL.orange500, filter: 'pending' },
    { stage: 'Translating', count: counts.translating, sub: 'up to 8 languages', icon: 'languages', color: SL.turq500, filter: 'translating' },
    { stage: 'Delivered', count: counts.approved, sub: 'to AEM / DAM', icon: 'check-circle-2', color: SL.green600, filter: 'approved' },
  ];

  return (
    <PageShell>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: SL.coreBlue, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{DEMO_DATE_LABEL}</div>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: SL.ui900, letterSpacing: '-.01em' }}>Good morning, {firstName}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 15, color: SL.ui600 }}>{summary}.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" icon="external-link" onClick={() => toast('Would open the Monday.com "Content briefs" board in a new tab.', { icon: 'external-link' })}>Open Monday.com</Button>
          <Button variant="primary" icon="sparkles" onClick={() => navigate('brief')}>New brief</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatTile label="Avg brief → content" value="34 min" delta="−74% vs Q4" deltaTone="green" icon="zap"/>
        <StatTile label="First-pass approval" value="78%" delta="+12pp" deltaTone="green" icon="check-circle-2"/>
        <StatTile label="Active in pipeline" value={String(state.items.filter(i => !['approved', 'rejected'].includes(i.state)).length)} sublabel={`across ${new Set(state.items.map(i => i.channel)).size} channels`} icon="layers"/>
        <StatTile label="Translated this week" value="47" sublabel="into 8 languages" icon="languages"/>
        <StatTile label="WCAG pass rate" value="98%" delta="+3pp" deltaTone="green" icon="accessibility"/>
      </div>

      <div style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '0 4px', borderBottom: `1px solid ${SL.ui300}` }}>
          <Tabs
            tabs={[
              { key: 'all', label: 'All', icon: 'inbox', count: counts.all },
              { key: 'pending', label: 'In review', icon: 'clock', count: counts.pending },
              { key: 'iterating', label: 'Iterating', icon: 'refresh-cw', count: counts.iterating },
              { key: 'translating', label: 'Translating', icon: 'languages', count: counts.translating },
              { key: 'approved', label: 'Approved', icon: 'check-circle-2', count: counts.approved },
              { key: 'rejected', label: 'Rejected', icon: 'x-circle', count: counts.rejected },
              ...(counts.queued + counts.generating ? [{ key: 'queued', label: 'Queued', icon: 'inbox', count: counts.queued + counts.generating }] : []),
            ]}
            active={filter} onChange={(k) => { setFilter(k); setSelected([]); }} style={{ borderBottom: 'none' }}
          />
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${SL.ui300}`, background: SL.ui100 }}>
          <span style={{ fontSize: 12, color: SL.ui600, marginRight: 4 }}>Channel:</span>
          {['all', ...CHANNEL_KEYS].map(c => (
            <button key={c} className={`pill-btn ${channelFilter === c ? 'active' : ''}`} onClick={() => { setChannelFilter(c); setSelected([]); }}>{c === 'all' ? 'All' : CHANNELS[c].label}</button>
          ))}
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 12, color: SL.ui600 }}>Sort:</span>
          <select value={sort} onChange={e => { setSort(e.target.value); setSelected([]); }} style={{ border: `1px solid ${SL.ui300}`, borderRadius: 9999, padding: '4px 10px', fontSize: 12, background: '#fff', color: SL.ui700 }}>
            <option value="updated">Last updated</option>
            <option value="priority">Priority</option>
            <option value="id">Brief ID</option>
          </select>
        </div>

        {selected.length > 0 && (
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: SL.himmelLighter, borderBottom: `1px solid ${SL.himmelLight}` }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: SL.coreBlue }}>{selected.length} selected</span>
            <span style={{ fontSize: 12, color: SL.ui600 }}>· {reviewable.length} can be actioned (in review / iterating)</span>
            <div style={{ flex: 1 }}/>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
            <Button size="sm" variant="secondary" icon="x" disabled={!reviewable.length} onClick={() => setRejecting(true)}>Reject</Button>
            <Button size="sm" variant="primary" icon="check" disabled={!reviewable.length} onClick={bulkApprove}>Approve & translate</Button>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState icon="inbox" title="No briefs match" body="Try another status or channel filter." action={<Button variant="ghost" size="sm" onClick={() => { setFilter('all'); setChannelFilter('all'); }}>Clear filters</Button>}/>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" aria-label="Select all" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? [] : items.map(i => i.id))}/></th>
                <th>Brief</th><th>Channel</th><th>Type</th><th>Status</th><th>Requester</th><th>Priority</th><th>Iter.</th><th>Languages</th><th>Updated</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} className="row-hover" onClick={() => navigate(`review/${it.id}`)} style={{ cursor: 'pointer', background: selected.includes(it.id) ? '#f7fafe' : undefined }}>
                  <td onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${it.id}`} checked={selected.includes(it.id)} onChange={() => toggle(it.id)}/></td>
                  <td>
                    <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, display: 'flex', gap: 6, alignItems: 'center' }}>{it.id}{it.createdInSession && <span style={{ background: SL.himmelLighter, color: SL.coreBlue, borderRadius: 9999, padding: '0 6px', fontSize: 10 }}>new</span>}</div>
                    <div style={{ fontSize: 14, color: SL.ui900, fontWeight: 500 }}>{it.title}</div>
                  </td>
                  <td><ChannelChip channel={it.channel} size="sm"/></td>
                  <td><span style={{ fontSize: 12, color: SL.ui700 }}>{it.type === 'update' ? 'Update' : 'New'}</span></td>
                  <td><StatusPill state={it.state}/></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={it.requester.name} size={24}/>
                      <span style={{ fontSize: 13, color: SL.ui800, whiteSpace: 'nowrap' }}>{it.requester.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 12, fontWeight: 500, color: it.priority === 'High' ? SL.sjobod : it.priority === 'Medium' ? SL.orange900 : SL.ui600 }}>{it.priority}</span></td>
                  <td style={{ fontSize: 13, color: SL.ui700 }}>{it.iter ? `v${it.iter}` : '—'}</td>
                  <td style={{ fontSize: 13, color: SL.ui700, whiteSpace: 'nowrap' }}>{it.langs} lang{it.langs === 1 ? '' : 's'}</td>
                  <td style={{ fontSize: 12, color: SL.ui600, whiteSpace: 'nowrap' }}>{relativeTime(it.updatedAt)}</td>
                  <td><Icon name="chevron-right" size={14} color={SL.ui500}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 32 }}>
        <SectionHeader eyebrow="This week" title="Pipeline at a glance" description="From brief picked up to content delivered. The AI never publishes — every step waits for human approval. Click a stage to filter the queue."/>
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {pipeline.map((s, i) => (
            <button key={i} onClick={() => { setFilter(s.filter); setChannelFilter('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, padding: 16, position: 'relative', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9999, background: SL.ui100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={14} color={s.color}/>
                </div>
                <span style={{ fontSize: 12, color: SL.ui600, fontWeight: 500 }}>{s.stage}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: SL.ui900, marginTop: 8, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 12, color: SL.ui600, marginTop: 4 }}>{s.sub}</div>
              {i < 4 && <Icon name="chevron-right" size={16} color={SL.ui400} style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', background: SL.molnigare, padding: 2, zIndex: 1 }}/>}
            </button>
          ))}
        </div>
      </div>

      {rejecting && (
        <ConfirmDialog title={`Reject ${reviewable.length} brief${reviewable.length === 1 ? '' : 's'}?`} icon="x-circle" danger confirmLabel="Reject" onClose={() => setRejecting(false)} onConfirm={bulkReject}
          body="The requesters are notified in Monday.com and the briefs return to them for refinement.">
          <TextField label="Reason (shared with requester)" rows={3} value={reason} onChange={setReason} placeholder="e.g. Key messages changed — campaign on hold until April." autoFocus/>
        </ConfirmDialog>
      )}
    </PageShell>
  );
}
