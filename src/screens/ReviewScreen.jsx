import { useEffect, useState } from 'react';
import { useStore } from '../store/store.jsx';
import { useToast } from '../shared/toast.jsx';
import { navigate } from '../shared/router.js';
import { Button, Badge, Card, ChannelChip, StatusPill, Avatar, Icon, Tabs, KV, MiniStat, Eyebrow, Modal, ConfirmDialog, TextField, EmptyState, Spinner } from '../shared/ui.jsx';
import { SL, CHANNELS, asset } from '../shared/theme.js';
import { relativeTime, formatDateTime } from '../shared/time.js';
import { USER } from '../shared/data.js';

const LANGS_BY_CHANNEL = { website: ['EN', 'NL', 'DE', 'SV'], app: ['EN', 'SV', 'DE', 'NL', 'DA', 'NO', 'PL', 'GA'], onboard: ['EN', 'CY', 'GA'], email: ['EN', 'GA', 'CY'], social: ['EN'] };
const FEEDBACK_CHIPS = ['More concise', 'Warmer tone', 'Less repetition', 'Stronger CTA', 'Add specific numbers', 'Avoid "experience"'];

export default function ReviewScreen({ id }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const item = state.items.find(i => i.id === id);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [activeLang, setActiveLang] = useState('EN');
  const [modal, setModal] = useState(null); // 'approve' | 'reject' | 'comment' | {diff: iteration}
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [changedOnly, setChangedOnly] = useState(false);

  useEffect(() => { setActiveTab('content'); setActiveLang('EN'); setFeedback(''); setChangedOnly(false); }, [id]);

  if (!item) {
    return <EmptyState icon="search-x" title={`Brief ${id} not found`} body="It may have been removed when the demo data was reset." action={<Button variant="primary" onClick={() => navigate('queue')}>Back to queue</Button>}/>;
  }

  const { channel, brief, content } = item;
  const reviewable = ['pending', 'iterating'].includes(item.state);
  const terminal = ['approved', 'rejected'].includes(item.state);
  const busy = item.state === 'generating' || item.state === 'queued';
  const langs = LANGS_BY_CHANNEL[channel] || ['EN'];

  const approve = () => {
    dispatch({ type: 'ITEM_APPROVE', id: item.id });
    setModal(null);
    toast(item.langs > 1 ? `${item.id} approved — translating into ${item.langs - 1} languages.` : `${item.id} approved and delivered to AEM.`, { kind: 'success', action: { label: 'Back to queue', onClick: () => navigate('queue') } });
  };
  const reject = () => {
    if (!reason.trim()) return;
    dispatch({ type: 'ITEM_REJECT', id: item.id, reason: reason.trim() });
    setModal(null); setReason('');
    toast(`${item.id} rejected — ${item.requester.name} notified in Monday.com.`, { action: { label: 'Back to queue', onClick: () => navigate('queue') } });
  };
  const addComment = () => {
    if (!comment.trim()) return;
    dispatch({ type: 'ITEM_COMMENT', id: item.id, text: comment.trim() });
    setModal(null); setComment('');
    toast('Comment added and synced to Monday.com.', { kind: 'success' });
  };
  const regenerate = () => {
    if (!feedback.trim()) { toast('Add feedback first — the AI uses it as the next instruction.', { kind: 'error' }); return; }
    dispatch({ type: 'ITEM_REGEN_START', id: item.id, feedback: feedback.trim() });
    setFeedback('');
    setActiveTab('content');
  };

  return (
    <div style={{ background: SL.molnigare, minHeight: 'calc(100vh - 56px)' }}>
      {/* Sub-header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${SL.ui300}`, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 56, zIndex: 40 }}>
        <button onClick={() => navigate('queue')} style={{ background: 'transparent', border: 'none', padding: '6px 10px', borderRadius: 6, color: SL.ui700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrow-left" size={14}/> Review queue
        </button>
        <div style={{ width: 1, height: 24, background: SL.ui300 }}/>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{item.id}</span>
            <ChannelChip channel={channel} size="sm"/>
            <Badge tone="neutral">{item.type === 'update' ? 'Content update' : 'New content'}</Badge>
            <StatusPill state={item.regenerating ? 'generating' : item.state}/>
            {item.iter > 0 && <span style={{ fontSize: 12, color: SL.ui600 }}>v{item.iter}</span>}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: SL.ui900, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {channel === 'website' && <Button variant="ghost" icon="image" onClick={() => navigate(`images?from=${item.id}`)}>Hero image</Button>}
          {!busy && <Button variant="ghost" icon="message-square" onClick={() => setModal('comment')}>Add comment</Button>}
          {reviewable && <Button variant="secondary" icon="x" onClick={() => setModal('reject')} disabled={item.regenerating}>Reject</Button>}
          {reviewable && <Button variant="primary" icon="check" onClick={() => setModal('approve')} disabled={item.regenerating}>Approve{item.langs > 1 ? ' & translate' : ''}</Button>}
          {terminal && <Button variant="secondary" icon="rotate-ccw" onClick={() => { dispatch({ type: 'ITEM_REOPEN', id: item.id }); toast(`${item.id} reopened for review.`); }}>Reopen</Button>}
          {item.state === 'translating' && <Button variant="ghost" icon="loader-2" disabled>Translating…</Button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr) minmax(280px, 350px)', alignItems: 'flex-start' }}>
        <BriefPanel item={item}/>

        <div style={{ padding: 24, minWidth: 0 }}>
          {terminal && <TerminalBanner item={item}/>}
          {item.state === 'translating' && <TranslatingBanner item={item}/>}
          {busy ? <GeneratingSkeleton item={item}/> : (
            <>
              <Tabs
                tabs={[
                  { key: 'content', label: item.type === 'update' ? 'Diff' : 'Generated content', icon: 'file-text' },
                  { key: 'preview', label: 'Channel preview', icon: 'eye' },
                  { key: 'history', label: 'Iterations', icon: 'history', count: item.iterations.length },
                  ...(item.comments.length ? [{ key: 'comments', label: 'Comments', icon: 'message-square', count: item.comments.length }] : []),
                  ...(channel === 'website' || channel === 'app' ? [{ key: 'fragment', label: 'AEM fragment', icon: 'database' }] : []),
                ]}
                active={activeTab} onChange={setActiveTab} style={{ marginBottom: 16 }}
              />

              {item.regenerating && (
                <Card style={{ marginBottom: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, borderColor: SL.himmelLight, background: SL.himmelLighter }}>
                  <Spinner/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>Regenerating v{item.iter + 1} with your feedback…</div>
                    <div style={{ fontSize: 12, color: SL.ui600 }}>Tonality, glossary and channel rules are re-applied. Typically 20–90 seconds.</div>
                  </div>
                </Card>
              )}

              {activeTab === 'content' && (
                channel === 'website' ? <WebsiteDiffPanel item={item} changedOnly={changedOnly} setChangedOnly={setChangedOnly} activeLang={activeLang} setActiveLang={setActiveLang} langs={langs} editable={reviewable && !item.regenerating} dispatch={dispatch}/>
                : channel === 'email' ? <FieldListPanel item={item} icon="mail" color={SL.orange500} title="Generated email" editable={reviewable && !item.regenerating} dispatch={dispatch}/>
                : channel === 'social' ? <SocialContentPanel item={item}/>
                : channel === 'app' ? <AppContentPanel item={item} activeLang={activeLang} setActiveLang={setActiveLang} langs={langs} editable={reviewable && !item.regenerating} dispatch={dispatch}/>
                : <OnboardContentPanel item={item} editable={reviewable && !item.regenerating} dispatch={dispatch}/>
              )}
              {activeTab === 'preview' && <ChannelPreview item={item}/>}
              {activeTab === 'history' && <IterationHistory item={item} onDiff={(it) => setModal({ diff: it })}/>}
              {activeTab === 'comments' && <CommentsPanel item={item}/>}
              {activeTab === 'fragment' && <FragmentInspector item={item}/>}

              {reviewable && (
                <Card style={{ marginTop: 16, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Icon name="sparkles" size={14} color={SL.coreBlue}/>
                    <span style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>Send feedback for regeneration</span>
                    <span style={{ fontSize: 12, color: SL.ui600 }}>· The AI keeps prior feedback in context</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <textarea value={feedback} onChange={e => setFeedback(e.target.value)} disabled={item.regenerating}
                      onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') regenerate(); }}
                      placeholder={'Tighten the hero copy, drop the 06:55 mention from the meta, and use "spring fares" instead of "spring offers"…'}
                      style={{ flex: 1, minHeight: 72, resize: 'vertical', border: `1px solid ${SL.ui400}`, borderRadius: 6, padding: '10px 12px', fontSize: 14, outline: 'none', color: SL.ui900 }}/>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Button variant="primary" icon="refresh-cw" loading={item.regenerating} onClick={regenerate}>Regenerate</Button>
                      <button onClick={() => toast('Attachments (screenshots, briefs, reference copy) would be passed to the AI as context.', { icon: 'paperclip' })} style={{ background: 'transparent', border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: SL.ui700, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <Icon name="paperclip" size={12}/> Attach
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {FEEDBACK_CHIPS.map(q => (
                      <button key={q} className="pill-btn" onClick={() => setFeedback(f => (f ? f + ' · ' + q : q))}>+ {q}</button>
                    ))}
                    <span style={{ fontSize: 11, color: SL.ui500, marginLeft: 'auto' }}>⌘↵ to regenerate</span>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        <div style={{ padding: '24px 24px 24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {channel === 'website' && content.seoTargets && <SEOPanel content={content} state={item.state}/>}
          {channel === 'email' && <EmailContextPanel content={content}/>}
          {channel === 'social' && <SocialContextPanel content={content}/>}
          {channel === 'app' && <AppContextPanel/>}
          {channel === 'onboard' && <OnboardContextPanel brief={brief}/>}
          <RulesPanel channel={channel} glossaryCount={state.glossary.length} seo={state.seo} wcag={state.wcag}/>
          <ActivityPanel item={item}/>
        </div>
      </div>

      {modal === 'approve' && (
        <ConfirmDialog title={item.langs > 1 ? 'Approve and start translation?' : 'Approve and deliver?'} icon="check-circle-2" confirmLabel={item.langs > 1 ? 'Approve & translate' : 'Approve'} onClose={() => setModal(null)} onConfirm={approve}>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: SL.ui800, lineHeight: 1.55 }}>
            Version {item.iter} becomes the {langs[0]} master. {item.langs > 1 ? `The AI translates into ${langs.slice(1).join(', ')} using the glossary, and each language is queued for its reviewer.` : 'The content is written to the AEM fragment as a new unpublished version — nothing goes live without a publish in AEM.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {langs.map((l, i) => <Badge key={l} tone={i === 0 ? 'green' : 'turq'} icon={i === 0 ? 'check' : 'languages'}>{l}{i === 0 ? ' · master' : ''}</Badge>)}
          </div>
          <div style={{ marginTop: 14, padding: 10, background: SL.ui100, borderRadius: 6, fontSize: 12, color: SL.ui700, display: 'flex', gap: 8 }}>
            <Icon name="info" size={14} color={SL.coreBlue}/> Monday.com item {brief.mondayId} moves to <strong style={{ marginLeft: 4 }}>Approved</strong>.
          </div>
        </ConfirmDialog>
      )}
      {modal === 'reject' && (
        <ConfirmDialog title={`Reject ${item.id}?`} icon="x-circle" danger confirmLabel="Reject & notify" onClose={() => setModal(null)} onConfirm={reject}
          body={`${item.requester.name} is notified in Monday.com and the brief returns to them. Your reason is stored with iteration v${item.iter}.`}>
          <TextField label="Reason" rows={3} value={reason} onChange={setReason} autoFocus placeholder="e.g. Campaign scope changed — hold until the Adventurer refit date is confirmed." required/>
        </ConfirmDialog>
      )}
      {modal === 'comment' && (
        <Modal title="Add comment" subtitle="Visible to the requester in Monday.com and kept in the activity log." icon="message-square" onClose={() => setModal(null)}
          footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button variant="primary" icon="send-horizontal" onClick={addComment} disabled={!comment.trim()}>Post comment</Button></>}>
          <TextField rows={4} value={comment} onChange={setComment} autoFocus placeholder={`@${item.requester.name.split(' ')[0]} …`}/>
        </Modal>
      )}
      {modal?.diff && <DiffModal item={item} iteration={modal.diff} onClose={() => setModal(null)}/>}
    </div>
  );
}

// ---------- Banners ----------
function TerminalBanner({ item }) {
  const approved = item.state === 'approved';
  const last = item.activity[0];
  return (
    <Card style={{ marginBottom: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, background: approved ? SL.green50 : SL.red50, borderColor: approved ? SL.green100 : SL.red100 }}>
      <Icon name={approved ? 'check-circle-2' : 'x-circle'} size={24} color={approved ? SL.green600 : SL.sjobod}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: SL.ui900 }}>{approved ? `Approved · v${item.iter} delivered to AEM` : `Rejected at v${item.iter}`}</div>
        <div style={{ fontSize: 13, color: SL.ui700, marginTop: 2 }}>{last ? `${last.who} · ${last.what} · ${relativeTime(last.when)}` : ''}{approved && item.langs > 1 ? ` · ${item.langs} language versions` : ''}</div>
      </div>
      <Badge tone={approved ? 'green' : 'red'}>Read-only</Badge>
    </Card>
  );
}
function TranslatingBanner({ item }) {
  const langs = (LANGS_BY_CHANNEL[item.channel] || ['EN']).slice(0, item.langs);
  return (
    <Card style={{ marginBottom: 16, padding: 16, background: SL.turq100, borderColor: '#b9f2e9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Spinner color={SL.turq700}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: SL.ui900 }}>Translating the {langs[0]} master into {langs.length - 1} language{langs.length - 1 === 1 ? '' : 's'}</div>
          <div style={{ fontSize: 13, color: SL.ui700, marginTop: 2 }}>Glossary terms are protected. Each language goes to its reviewer before delivery to AEM.</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {langs.map((l, i) => <Badge key={l} tone={i === 0 ? 'green' : 'turq'} icon={i === 0 ? 'check' : 'loader-2'}>{l}</Badge>)}
      </div>
    </Card>
  );
}
function GeneratingSkeleton({ item }) {
  const generating = item.state === 'generating';
  return (
    <Card padding={0}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        {generating ? <Spinner/> : <Icon name="inbox" size={14} color={SL.ui600}/>}
        <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{generating ? 'AI is generating the first version…' : 'Queued — waiting to be picked up'}</span>
        <Badge tone={generating ? 'blue' : 'neutral'}>{generating ? 'Azure OpenAI · gpt-4' : 'Monday.com webhook'}</Badge>
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i}>
            <div className="shimmer" style={{ height: 12, width: 120 + i * 30, borderRadius: 4, marginBottom: 8 }}/>
            <div className="shimmer" style={{ height: 44 + (i % 2) * 30, borderRadius: 6 }}/>
          </div>
        ))}
        <div style={{ fontSize: 12, color: SL.ui600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="shield-check" size={12} color={SL.coreBlue}/> Applying tonality, glossary{item.channel === 'website' ? ', SEO config, WCAG rules' : item.channel === 'app' ? ', WCAG rules, character limits' : ', channel constraints'}…
        </div>
      </div>
    </Card>
  );
}

// ---------- Brief panel ----------
function BriefPanel({ item }) {
  const { brief } = item;
  return (
    <aside style={{ borderRight: `1px solid ${SL.ui300}`, background: '#fff', padding: 24, position: 'sticky', top: 120, alignSelf: 'flex-start', maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
      <Eyebrow icon="clipboard-list" color={SL.coreBlue} style={{ marginBottom: 4 }}>Original brief</Eyebrow>
      <div style={{ fontSize: 16, fontWeight: 700, color: SL.ui900, lineHeight: 1.3, marginBottom: 16 }}>{item.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: SL.ui100, borderRadius: 6, marginBottom: 16 }}>
        <Avatar name={item.requester.name} size={32}/>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>{item.requester.name}</div>
          <div style={{ fontSize: 11, color: SL.ui600 }}>{item.requester.role}</div>
        </div>
      </div>
      <KV label="Market" value={brief.market}/>
      <KV label="Deadline" value={brief.deadline}/>
      <KV label="Monday.com" value={<a href="#" onClick={e => e.preventDefault()} style={{ color: SL.coreBlue, textDecoration: 'none' }}>{brief.mondayId} ↗</a>}/>
      <KV label="Priority" value={item.priority}/>
      {brief.pageUrl && <KV label="Page URL" value={<code style={{ fontSize: 12 }}>{brief.pageUrl}</code>}/>}
      {brief.fragment && <KV label="AEM fragment" value={<code style={{ fontSize: 12 }}>{brief.fragment}</code>}/>}
      {brief.pageType && <KV label="Page type" value={brief.pageType}/>}
      {brief.campaignType && <KV label="Type" value={brief.campaignType}/>}
      {brief.screen && <KV label="Screen" value={brief.screen}/>}
      {brief.journey && <KV label="Journey" value={brief.journey}/>}
      {brief.route && <KV label="Route" value={brief.route}/>}
      {brief.location && <KV label="Location" value={brief.location}/>}
      {brief.duration && <KV label="Duration" value={brief.duration}/>}
      {brief.platforms && <KV label="Platforms" value={brief.platforms.join(' · ')}/>}
      {brief.audience && <KV label="Audience" value={brief.audience}/>}
      {brief.cta && <KV label="CTA" value={brief.cta}/>}
      {brief.subjectGuidance && <KV label="Subject guidance" value={brief.subjectGuidance}/>}
      {brief.visualDirection && <KV label="Visual direction" value={brief.visualDirection}/>}
      {brief.hashtags && <KV label="Hashtags" value={brief.hashtags}/>}
      {brief.link && <KV label="Link" value={brief.link}/>}
      {brief.constraints && <KV label="Constraints" value={brief.constraints}/>}
      {brief.languages && <KV label="Languages" value={brief.languages.join(' · ')}/>}
      {brief.desiredFeel && <KV label="Desired feel" value={brief.desiredFeel}/>}
      {brief.keyMessages && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>Key messages</div>
          <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 13, color: SL.ui800, lineHeight: 1.55 }}>
            {brief.keyMessages.map((m, i) => <li key={i} style={{ marginBottom: 4 }}>{m}</li>)}
          </ul>
        </div>
      )}
      {brief.keyMessage && <KV label="Key message" value={brief.keyMessage} style={{ marginTop: 12 }}/>}
      {brief.message && <KV label="Message" value={brief.message} style={{ marginTop: 12 }}/>}
      {brief.goal && <KV label="Goal" value={brief.goal} style={{ marginTop: 12 }}/>}
      {brief.notes && (
        <div style={{ marginTop: 12, padding: 10, background: SL.orange50, border: `1px solid ${SL.orange100}`, borderRadius: 6 }}>
          <Eyebrow icon="sticky-note" color={SL.orange900} style={{ marginBottom: 4 }}>Editor notes</Eyebrow>
          <div style={{ fontSize: 13, color: SL.ui800, lineHeight: 1.55 }}>{brief.notes}</div>
        </div>
      )}
    </aside>
  );
}

// ---------- Editable field block ----------
function EditableText({ value, onSave, editable, limit, tone = 'muted', large }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const styles = {
    muted: { bg: SL.ui100, border: SL.ui300, fg: SL.ui700 },
    new: { bg: SL.green50, border: SL.green100, fg: SL.ui900 },
    plain: { bg: SL.ui100, border: SL.ui300, fg: SL.ui900 },
  };
  const s = styles[tone] || styles.muted;
  if (editing) {
    const over = limit && draft.length > limit;
    return (
      <div>
        <textarea className="inline-edit" value={draft} autoFocus rows={Math.max(2, Math.ceil(draft.length / 70))} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') { setEditing(false); setDraft(value); } if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !over) { onSave(draft); setEditing(false); } }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 11, color: over ? SL.sjobod : SL.ui600 }}>{draft.length}{limit ? `/${limit}` : ''}{over ? ' · over limit' : ''}</span>
          <div style={{ flex: 1 }}/>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(value); }}>Cancel</Button>
          <Button size="sm" variant="primary" icon="check" disabled={over || draft === value} onClick={() => { onSave(draft); setEditing(false); }}>Save edit</Button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'relative' }} className="editable">
      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, padding: large ? 12 : 10, fontSize: large ? 14 : 14, color: s.fg, lineHeight: 1.5, whiteSpace: 'pre-wrap', paddingRight: editable ? 36 : undefined }}>{value}</div>
      {editable && (
        <button title="Edit manually" onClick={() => setEditing(true)} style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 6, border: `1px solid ${SL.ui300}`, background: '#fff', color: SL.ui600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="pencil" size={12}/>
        </button>
      )}
    </div>
  );
}

function FieldHeader({ name, meta, changed, length, limit, edited, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: SL.ui900, fontFamily: 'ui-monospace, Menlo, monospace', background: SL.ui100, padding: '2px 6px', borderRadius: 4 }}>{name}</span>
      {meta && <span style={{ fontSize: 11, color: SL.ui600 }}>{meta}</span>}
      {changed && <Badge tone="orange" dot>Changed</Badge>}
      {edited && <Badge tone="blue" icon="pencil">Edited by {edited.split(' ')[0]}</Badge>}
      {badge}
      <div style={{ flex: 1 }}/>
      {limit && <span style={{ fontSize: 11, color: length > limit ? SL.sjobod : length > limit * 0.9 ? SL.orange500 : SL.ui600 }}>{length}/{limit}</span>}
    </div>
  );
}

// ---------- Website diff ----------
function WebsiteDiffPanel({ item, changedOnly, setChangedOnly, activeLang, setActiveLang, langs, editable, dispatch }) {
  const { content } = item;
  const isUpdate = content.fields.some(f => f.before !== undefined);
  const changedCount = content.fields.filter(f => f.before !== undefined && f.before !== f.after).length;
  const recent = new Set(item.changedFields || []);
  const fields = content.fields.map((f, i) => ({ ...f, i })).filter(f => !changedOnly || f.before === undefined || f.before !== f.after);
  const foreign = activeLang !== 'EN';
  return (
    <Card padding={0}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Icon name="git-compare" size={14} color={SL.coreBlue}/>
        <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{isUpdate ? 'Diff · current vs. proposed' : 'Generated content'}</span>
        <Badge tone="neutral">{content.fields.length} fields{isUpdate ? ` · ${changedCount} changed` : ''}</Badge>
        {recent.size > 0 && <Badge tone="blue" icon="sparkles" title={[...recent].join(', ')}>{recent.size} updated in v{item.iter}</Badge>}
        <div style={{ flex: 1 }}/>
        {isUpdate && <button className={`pill-btn ${changedOnly ? 'active' : ''}`} onClick={() => setChangedOnly(!changedOnly)}><Icon name="filter" size={12}/> Changed only</button>}
        <div style={{ display: 'inline-flex', border: `1px solid ${SL.ui300}`, borderRadius: 9999, overflow: 'hidden' }}>
          {langs.map(l => <button key={l} onClick={() => setActiveLang(l)} style={{ border: 'none', padding: '4px 10px', fontSize: 12, fontWeight: 500, background: activeLang === l ? SL.coreBlue : '#fff', color: activeLang === l ? '#fff' : SL.ui700 }}>{l}</button>)}
        </div>
      </div>
      {foreign ? (
        <div style={{ padding: 24 }}>
          <EmptyState icon="languages" title={`${activeLang} version not generated yet`} body={item.state === 'approved' ? `Delivered to AEM as the ${activeLang} language copy of the fragment.` : `Translations are produced after the EN master is approved — the glossary (${activeLang === 'SV' ? '"fare" → "biljett"' : activeLang === 'DE' ? '"sailing" → "Überfahrt"' : '"crossing" → "oversteek"'}) is applied automatically.`}/>
        </div>
      ) : fields.map(f => {
        const changed = f.before !== undefined && f.before !== f.after;
        return (
          <div key={f.i} style={{ borderBottom: `1px solid ${SL.ui200}`, padding: '14px 18px', background: recent.has(f.name) ? '#f7fbff' : undefined }}>
            <FieldHeader name={f.name} meta={`${f.type} · max ${f.limit} chars`} changed={changed} length={f.after.length} limit={f.limit} edited={f.editedBy}/>
            {f.before !== undefined ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Current (live)</div>
                  <EditableText value={f.before} editable={false} tone="muted"/>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Proposed</div>
                  <EditableText value={f.after} limit={f.limit} editable={editable} tone={changed ? 'new' : 'muted'} onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: f.i, value: v })}/>
                </div>
              </div>
            ) : (
              <EditableText value={f.after} limit={f.limit} editable={editable} tone="new" onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: f.i, value: v })}/>
            )}
          </div>
        );
      })}
    </Card>
  );
}

// ---------- Generic field list (email) ----------
function FieldListPanel({ item, icon, color, title, editable, dispatch }) {
  const { content } = item;
  const recent = new Set(item.changedFields || []);
  return (
    <Card padding={0}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={14} color={color}/>
        <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{title}</span>
        <Badge tone="neutral">{content.fields.length} fields</Badge>
        {recent.size > 0 && <Badge tone="blue" icon="sparkles">{recent.size} updated in v{item.iter}</Badge>}
      </div>
      {content.fields.map((f, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${SL.ui200}`, padding: '14px 18px', background: recent.has(f.name) ? '#f7fbff' : undefined }}>
          <FieldHeader name={f.name} meta={`max ${f.limit}`} length={f.value.length} limit={f.limit} edited={f.editedBy}/>
          <EditableText value={f.value} limit={f.limit} editable={editable} tone="plain" onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: i, value: v })}/>
        </div>
      ))}
    </Card>
  );
}

// ---------- Social ----------
function SocialContentPanel({ item }) {
  const { content } = item;
  const [active, setActive] = useState(0);
  const post = content.posts[Math.min(active, content.posts.length - 1)];
  const recent = new Set(item.changedFields || []);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {content.posts.map((p, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: active === i ? '#fff' : SL.ui100, border: `1px solid ${active === i ? p.color : SL.ui300}`, borderRadius: 8, padding: '8px 14px',
            display: 'inline-flex', alignItems: 'center', gap: 8, color: active === i ? SL.ui900 : SL.ui700, fontSize: 13, fontWeight: 500,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: p.color }}/>
            {p.platform}
            <span style={{ fontSize: 11, color: p.caption.length > p.limit ? SL.sjobod : SL.ui600 }}>{p.caption.length}/{p.limit}</span>
            {recent.has(p.platform) && <Icon name="sparkles" size={11} color={SL.modernBlue}/>}
          </button>
        ))}
      </div>
      <Card padding={0}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: post.color }}/>
          <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>{post.platform}</span>
          <Badge tone={post.caption.length > post.limit ? 'red' : 'neutral'}>{post.caption.length}/{post.limit}</Badge>
          {recent.has(post.platform) && <Badge tone="blue" icon="sparkles">Updated in v{item.iter}</Badge>}
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: 14, fontSize: 14, color: SL.ui900, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{post.caption}</div>
          {post.hashtags && <div style={{ marginTop: 10, fontSize: 13, color: SL.modernBlue }}>{post.hashtags}</div>}
        </div>
      </Card>
    </div>
  );
}

// ---------- App ----------
function AppContentPanel({ item, activeLang, setActiveLang, langs, editable, dispatch }) {
  const { content } = item;
  const translation = content.translations?.[activeLang];
  const foreign = activeLang !== 'EN';
  return (
    <Card padding={0}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Icon name="smartphone" size={14} color={SL.turq500}/>
        <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>App fragment fields</span>
        <Badge tone="neutral">{content.fields.length} fields</Badge>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 4 }}>
          {langs.map(l => (
            <button key={l} onClick={() => setActiveLang(l)} title={l === 'EN' ? 'Master' : content.translations?.[l] ? 'Machine translation ready' : 'Not translated yet'} style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: activeLang === l ? SL.coreBlue : 'transparent',
              color: activeLang === l ? '#fff' : SL.ui700, border: `1px solid ${activeLang === l ? SL.coreBlue : SL.ui300}`, position: 'relative',
            }}>{l}{l !== 'EN' && <span style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, borderRadius: 9999, background: content.translations?.[l] ? SL.turq500 : SL.ui400 }}/>}</button>
          ))}
        </div>
      </div>
      {foreign && !translation && <div style={{ padding: 24 }}><EmptyState icon="languages" title={`${activeLang} not translated yet`} body="Translations are generated after the EN master is approved."/></div>}
      {(!foreign || translation) && content.fields.map((f, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${SL.ui200}`, padding: '14px 18px' }}>
          <FieldHeader name={f.name} meta={`${f.type} · ≤ ${f.limit}`} length={(foreign ? translation[i] : f.value).length} limit={f.limit} edited={!foreign && f.editedBy}
            badge={<>{f.type === 'a11y' && <Badge tone="turq" icon="accessibility">A11y</Badge>}{foreign && <Badge tone="turq" icon="languages">MT · awaiting {activeLang} review</Badge>}</>}/>
          <EditableText value={foreign ? translation[i] : f.value} limit={f.limit} editable={editable && !foreign} tone="plain" onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: i, value: v })}/>
        </div>
      ))}
    </Card>
  );
}

// ---------- Onboard ----------
function OnboardContentPanel({ item, editable, dispatch }) {
  const { content } = item;
  const groups = [];
  for (let i = 0; i + 1 < content.fields.length; i += 2) groups.push(i);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {groups.map(i => {
        const head = content.fields[i], body = content.fields[i + 1];
        const lang = head.name.split(' — ')[0];
        const langName = head.name.split('(')[1]?.replace(')', '') || 'English';
        return (
          <Card key={i} padding={0}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 8, background: SL.molnigare }}>
              <Icon name="languages" size={14} color={SL.mussla}/>
              <span style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>{lang} · {langName}</span>
              {i === 0 ? <Badge tone="green" icon="check">Master</Badge> : <Badge tone="turq" icon="languages">Translation</Badge>}
            </div>
            <div style={{ padding: 16 }}>
              <FieldHeader name="headline" meta={`≤ ${head.limit}`} length={head.value.length} limit={head.limit} edited={head.editedBy}/>
              <EditableText value={head.value} limit={head.limit} editable={editable} tone="plain" onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: i, value: v })}/>
              <div style={{ height: 12 }}/>
              <FieldHeader name="body" meta={`≤ ${body.limit}`} length={body.value.length} limit={body.limit} edited={body.editedBy}/>
              <EditableText value={body.value} limit={body.limit} editable={editable} tone="plain" onSave={(v) => dispatch({ type: 'ITEM_FIELD_EDIT', id: item.id, index: i + 1, value: v })}/>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Previews ----------
function ChannelPreview({ item }) {
  const { channel, content } = item;
  if (channel === 'website') {
    const by = (n) => content.fields.find(f => f.name.toLowerCase().startsWith(n.toLowerCase()))?.after || '';
    return (
      <Card padding={0}>
        <div style={{ background: SL.ui100, padding: '8px 16px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: SL.ui600 }}>
          <span style={{ width: 10, height: 10, borderRadius: 9999, background: SL.sjobod }}/><span style={{ width: 10, height: 10, borderRadius: 9999, background: SL.orange400 }}/><span style={{ width: 10, height: 10, borderRadius: 9999, background: SL.green600 }}/>
          <span style={{ marginLeft: 12 }}>{content.previewUrl}</span>
          <Badge tone="blue" style={{ marginLeft: 'auto' }}>Proposed version</Badge>
        </div>
        <div style={{ padding: 32, background: '#fff' }}>
          <div style={{ fontSize: 11, color: SL.ui500, marginBottom: 8 }}>{'<title>'} {by('Page title')}</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: SL.coreBlue, margin: 0, lineHeight: 1.15 }}>{by('Hero headline')}</h1>
          <p style={{ fontSize: 17, color: SL.ui700, lineHeight: 1.55, marginTop: 12 }}>{by('Hero supporting')}</p>
          <Button variant="primary" size="lg" style={{ marginTop: 20 }} icon="search">{by('CTA')}</Button>
          {by('Body') && <div style={{ marginTop: 28, fontSize: 14, color: SL.ui800, lineHeight: 1.65, borderTop: `1px solid ${SL.ui300}`, paddingTop: 20 }}>{by('Body')}</div>}
          <div style={{ marginTop: 20, padding: 12, background: SL.ui100, borderRadius: 6, fontSize: 12, color: SL.ui600 }}><strong>Search snippet:</strong> {by('Meta description')}</div>
        </div>
      </Card>
    );
  }
  if (channel === 'email') {
    const f = content.fields;
    return (
      <Card padding={0}>
        <div style={{ background: SL.ui100, padding: '10px 16px', borderBottom: `1px solid ${SL.ui300}`, fontSize: 12, color: SL.ui700 }}>
          <div><strong>From</strong> Stena Line &lt;hello@email.stenaline.co.uk&gt;</div>
          <div><strong>Subject</strong> {f[0].value} <span style={{ color: SL.ui500 }}>— {f[1].value}</span></div>
        </div>
        <div style={{ padding: 32, background: '#fff', maxWidth: 600 }}>
          <img src={asset('ds/StenaFlag.svg')} alt="" style={{ height: 20, marginBottom: 20 }}/>
          <h2 style={{ fontSize: 22, color: SL.coreBlue, margin: 0, fontWeight: 700, lineHeight: 1.3 }}>{f[2].value}</h2>
          <p style={{ fontSize: 14, color: SL.ui800, lineHeight: 1.6, marginTop: 14 }}>{f[3].value}</p>
          <Button variant="primary" size="lg" style={{ marginTop: 16 }}>{f[4].value}</Button>
          <div style={{ marginTop: 16, fontSize: 13, color: SL.modernBlue, textDecoration: 'underline' }}>{f[5].value}</div>
        </div>
      </Card>
    );
  }
  if (channel === 'social') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {content.posts.map((p, i) => (
          <Card key={i} padding={0}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 9999, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={asset('ds/StenaFlag.svg')} alt="" style={{ height: 12 }}/></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: SL.ui900 }}>Stena Line</div>
                <div style={{ fontSize: 11, color: SL.ui600 }}>@stenaline · {p.platform}</div>
              </div>
            </div>
            <div style={{ padding: 14, fontSize: 13, color: SL.ui900, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{p.caption}{p.hashtags ? `\n\n${p.hashtags}` : ''}</div>
            <div style={{ height: 160, background: `url(${asset('ds/images/ferry-2.jpg')}) center/cover` }}/>
          </Card>
        ))}
      </div>
    );
  }
  if (channel === 'app') return <AppPhonePreview content={content}/>;
  if (channel === 'onboard') return <OnboardScreenPreview content={content}/>;
  return null;
}

function AppPhonePreview({ content }) {
  const f = Object.fromEntries(content.fields.map(x => [x.name, x.value]));
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div style={{ width: 320, height: 640, background: '#000', borderRadius: 36, padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 28, background: SL.molnigare, overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: 30, background: '#000', borderRadius: '0 0 12px 12px', width: 120, margin: '0 auto' }}/>
          <div style={{ padding: '24px 22px' }}>
            <div style={{ fontSize: 11, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>Check-in</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: SL.ui900, marginTop: 4, lineHeight: 1.15 }}>{f['screen.headline']}</div>
            <div style={{ marginTop: 28, height: 140, background: SL.himmelLighter, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }} role="img" aria-label={f['screen.illustration_alt']}>
              <div style={{ position: 'relative' }}>
                <Icon name="ship" size={64} color={SL.coreBlue}/>
                <div style={{ position: 'absolute', top: -6, right: -10, background: SL.orange400, color: '#000', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 9999 }}>2h</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: SL.ui700, lineHeight: 1.5, marginTop: 18 }}>{f['screen.body']}</div>
            <Button variant="primary" size="md" style={{ width: '100%', marginTop: 20, height: 44 }}>{f['screen.cta_primary']}</Button>
            <Button variant="flat" size="md" style={{ width: '100%', marginTop: 8 }}>{f['screen.cta_secondary']}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OnboardScreenPreview({ content }) {
  const [lang, setLang] = useState(0);
  const groups = [];
  for (let i = 0; i + 1 < content.fields.length; i += 2) groups.push({ label: content.fields[i].name.split(' — ')[0], head: content.fields[i].value, body: content.fields[i + 1].value });
  const g = groups[lang] || groups[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {groups.map((x, i) => <button key={i} className={`pill-btn ${lang === i ? 'active' : ''}`} onClick={() => setLang(i)}>{x.label}</button>)}
        <span style={{ fontSize: 12, color: SL.ui600, alignSelf: 'center', marginLeft: 8 }}>Loop rotates languages every 5s</span>
      </div>
      <div style={{ width: 560, height: 320, background: '#000', borderRadius: 12, padding: 6, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 8, background: 'linear-gradient(135deg, #122f66 0%, #004a93 60%, #1a5a9a 100%)', color: '#fff', padding: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, bottom: -60, opacity: 0.15 }}><Icon name="utensils" size={260} color="#fff"/></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: SL.himmel, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            <img src={asset('ds/StenaFlag.svg')} alt="" style={{ width: 24, height: 16 }}/> {content.screenLabel || 'Onboard screen'}
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, marginTop: 14, lineHeight: 1.05, letterSpacing: '-.01em' }}>{g.head}</div>
          <div style={{ fontSize: 16, color: SL.himmel, marginTop: 8, lineHeight: 1.5, maxWidth: 380 }}>{g.body}</div>
          <div style={{ position: 'absolute', bottom: 20, right: 24, fontSize: 11, color: SL.himmelLight, letterSpacing: '.06em', textTransform: 'uppercase' }}>{content.loopLabel}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- Right column ----------
function SEOPanel({ content, state }) {
  const s = content.seoSummary;
  return (
    <div style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #122f66 0%, #004a93 100%)', color: '#fff', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: SL.himmelLight, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500 }}><Icon name="trending-up" size={12}/> SEO performance</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{state === 'approved' ? 'Tracking ranking impact' : 'Projected ranking impact'}</div>
        <div style={{ fontSize: 12, color: SL.himmel, marginTop: 2 }}>Google Search Console · 30-day rolling</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <MiniStat label="Avg position" value={s.position} tone="green" delta={s.positionDelta}/>
          <MiniStat label="Est. clicks/mo" value={s.clicks} tone="green" delta={s.clicksDelta}/>
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target keywords</div>
        {content.seoTargets.map((kw, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: `1px solid ${SL.ui200}`, fontSize: 13 }}>
            <div style={{ flex: 1, minWidth: 0, color: SL.ui900, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kw.keyword}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: SL.ui600 }}>
              <span>#{kw.current}</span><Icon name="arrow-right" size={11} color={SL.ui500}/><span style={{ color: kw.projected < kw.current ? SL.green700 : SL.ui900, fontWeight: 600 }}>#{kw.projected}</span>
            </div>
            <div style={{ minWidth: 50, textAlign: 'right', fontSize: 11, color: SL.ui600 }}>{kw.volume}/mo</div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: 10, background: SL.himmelLighter, borderRadius: 6, fontSize: 12, color: SL.ui800, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Icon name="info" size={14} color={SL.coreBlue} style={{ marginTop: 1 }}/>
          <div>SEO config applied automatically: <strong>UK route landing</strong> keyword strategy · H1–H3 hierarchy · meta pattern v2. <a href="#/admin/seo" style={{ color: SL.coreBlue }}>Edit rules</a></div>
        </div>
      </div>
    </div>
  );
}

function PanelBox({ eyebrow, eyebrowColor, icon, sub, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, padding: 14 }}>
      <Eyebrow icon={icon} color={eyebrowColor} style={{ marginBottom: sub ? 4 : 10 }}>{eyebrow}</Eyebrow>
      {sub && <div style={{ fontSize: 13, color: SL.ui600, marginBottom: 10 }}>{sub}</div>}
      {children}
    </div>
  );
}

function EmailContextPanel({ content }) {
  return (
    <PanelBox eyebrow="Adobe Campaign reference" eyebrowColor={SL.orange500} icon="bar-chart-3" sub="Top performers · lapsed UK segment">
      {content.perfRefs.map((r, i) => (
        <div key={i} style={{ padding: '10px 0', borderBottom: i < content.perfRefs.length - 1 ? `1px solid ${SL.ui200}` : 'none' }}>
          <div style={{ fontSize: 13, color: SL.ui900, fontWeight: 500, marginBottom: 4 }}>{r.subject}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: SL.ui600 }}>
            <span><strong style={{ color: SL.green700 }}>{r.openRate}%</strong> open</span><span><strong style={{ color: SL.green700 }}>{r.ctr}%</strong> CTR</span><span style={{ color: SL.coreBlue }}>{r.delta}</span>
          </div>
        </div>
      ))}
    </PanelBox>
  );
}
function SocialContextPanel({ content }) {
  return (
    <PanelBox eyebrow="Engagement signals" eyebrowColor={SL.sjobod} icon="trending-up" sub="30-day platform analytics">
      {content.perfRefs.map((r, i) => (
        <div key={i} style={{ padding: '8px 0', borderBottom: i < content.perfRefs.length - 1 ? `1px solid ${SL.ui200}` : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: SL.ui900, fontWeight: 500 }}>{r.platform}</span><span style={{ color: SL.green700, fontWeight: 500 }}>{r.value}</span></div>
          <div style={{ fontSize: 11, color: SL.ui600 }}>{r.metric}</div>
        </div>
      ))}
    </PanelBox>
  );
}
function AppContextPanel() {
  const rows = [['Plain language', 'Pass · Flesch 71'], ['Heading hierarchy', 'Pass · H1 → H2'], ['Alt text', 'Pass · 1/1 images'], ['Action wording', 'Pass · verbs only'], ['Character limits', 'Pass · all under']];
  return (
    <PanelBox eyebrow="WCAG checks" eyebrowColor={SL.turq700} icon="accessibility" sub="2.2 AA · automatic">
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
          <Icon name="check-circle-2" size={14} color={SL.green700}/><span style={{ color: SL.ui900, fontWeight: 500 }}>{r[0]}</span><div style={{ flex: 1 }}/><span style={{ fontSize: 11, color: SL.ui600 }}>{r[1]}</span>
        </div>
      ))}
    </PanelBox>
  );
}
function OnboardContextPanel({ brief }) {
  return (
    <PanelBox eyebrow="Route context" eyebrowColor={SL.mussla} icon="ship" sub={brief.market}>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: SL.ui800 }}>
        <div><strong style={{ color: SL.ui900 }}>Vessels:</strong> Stena Estrid, Stena Adventurer</div>
        <div><strong style={{ color: SL.ui900 }}>Crossing:</strong> 3h 30m</div>
        <div><strong style={{ color: SL.ui900 }}>Demographics:</strong> 64% UK · 28% IE · 8% other</div>
        <div><strong style={{ color: SL.ui900 }}>Languages:</strong> {(brief.languages || ['EN']).join(', ')}</div>
      </div>
    </PanelBox>
  );
}

function RulesPanel({ channel, glossaryCount, seo, wcag }) {
  const wcagOn = wcag.filter(w => w.on).length;
  const items = [
    { label: 'Tonality', value: 'UK · friendly · concrete', icon: 'message-circle', go: 'admin/tonality' },
    { label: 'Glossary', value: `${glossaryCount} terms applied · "fare" not "ticket"`, icon: 'book-open', go: 'admin/glossary' },
    ...(channel === 'website' || channel === 'app' ? [{ label: 'WCAG 2.2 AA', value: `${wcagOn} of ${wcag.length} rules enforced`, icon: 'accessibility', go: 'admin/wcag' }] : []),
    ...(channel === 'website' ? [{ label: 'SEO config', value: `${seo.keywords.length} keywords · UK route landing v2`, icon: 'trending-up', go: 'admin/seo' }] : []),
    { label: 'Brand voice', value: 'Sentence case · British EN · no emoji', icon: 'sparkles', go: 'admin/channels' },
  ];
  return (
    <PanelBox eyebrow="Applied automatically" icon="shield-check">
      {items.map((i, idx) => (
        <button key={idx} onClick={() => navigate(i.go)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: idx < items.length - 1 ? `1px solid ${SL.ui200}` : 'none', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', borderRadius: 0 }}>
          <Icon name={i.icon} size={14} color={SL.coreBlue} style={{ marginTop: 2 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>{i.label}</div>
            <div style={{ fontSize: 12, color: SL.ui600, marginTop: 1 }}>{i.value}</div>
          </div>
          <Icon name="chevron-right" size={12} color={SL.ui400} style={{ marginTop: 4 }}/>
        </button>
      ))}
    </PanelBox>
  );
}

function ActivityPanel({ item }) {
  const items = item.activity.slice(0, 8);
  return (
    <PanelBox eyebrow="Activity" icon="history">
      {items.map((it, i) => (
        <div key={it.id} style={{ display: 'flex', gap: 10, paddingBottom: 10, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: SL.ui100, border: `1px solid ${SL.ui300}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} size={11} color={it.color}/></div>
            {i < items.length - 1 && <div style={{ position: 'absolute', left: 12, top: 24, bottom: -10, width: 1, background: SL.ui300 }}/>}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: SL.ui900, fontWeight: 500 }}>{it.who}</div>
            <div style={{ fontSize: 12, color: SL.ui600, lineHeight: 1.4 }}>{it.what}</div>
            <div style={{ fontSize: 11, color: SL.ui500 }}>{relativeTime(it.when)}</div>
          </div>
        </div>
      ))}
    </PanelBox>
  );
}

function IterationHistory({ item, onDiff }) {
  if (!item.iterations.length) return <EmptyState icon="history" title="No iterations yet" body="The first version appears here once the AI has generated it."/>;
  return (
    <Card padding={0}>
      {item.iterations.map((it, i) => (
        <div key={it.v} style={{ padding: 16, borderBottom: i < item.iterations.length - 1 ? `1px solid ${SL.ui200}` : 'none', display: 'flex', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9999, background: i === 0 ? SL.coreBlue : SL.himmelLighter, color: i === 0 ? '#fff' : SL.coreBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flex: 'none' }}>v{it.v}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>Version {it.v}</span>
              <StatusPill state={it.state}/>
              {i === 0 && <Badge tone="neutral">Current</Badge>}
              <span style={{ fontSize: 12, color: SL.ui600 }}>· {relativeTime(it.at)}</span>
            </div>
            <div style={{ fontSize: 13, color: SL.ui800, marginTop: 4, lineHeight: 1.5 }}>{it.summary}</div>
            {it.feedback && <div style={{ fontSize: 12, color: SL.ui700, marginTop: 4, padding: '6px 10px', background: SL.orange50, borderRadius: 6, borderLeft: `3px solid ${SL.orange400}` }}>Feedback: “{it.feedback}”</div>}
            <div style={{ fontSize: 11, color: SL.ui600, marginTop: 4 }}>{it.author}</div>
          </div>
          {it.prev && <Button variant="ghost" size="sm" icon="git-compare" onClick={() => onDiff(it)}>View diff</Button>}
        </div>
      ))}
    </Card>
  );
}

function DiffModal({ item, iteration, onClose }) {
  const prev = iteration.prev;
  const cur = item.iterations[0].v === iteration.v ? item.content : (item.iterations[item.iterations.findIndex(x => x.v === iteration.v) - 1]?.prev || item.content);
  const rows = [];
  if (prev.fields) prev.fields.forEach((f, i) => { const a = f.after ?? f.value; const b = cur.fields[i]?.after ?? cur.fields[i]?.value; if (a !== b) rows.push({ name: f.name, a, b }); });
  if (prev.posts) prev.posts.forEach((p, i) => { if (p.caption !== cur.posts[i]?.caption) rows.push({ name: p.platform, a: p.caption, b: cur.posts[i]?.caption }); });
  return (
    <Modal wide title={`v${iteration.v - 1} → v${iteration.v}`} subtitle={iteration.summary} icon="git-compare" onClose={onClose} footer={<Button variant="primary" onClick={onClose}>Close</Button>}>
      {rows.length === 0 && <p style={{ fontSize: 13, color: SL.ui600 }}>No textual differences between these versions.</p>}
      {rows.map(r => (
        <div key={r.name} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui900, fontFamily: 'ui-monospace, Menlo, monospace', background: SL.ui100, padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginBottom: 6 }}>{r.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: SL.red50, border: `1px solid ${SL.red100}`, borderRadius: 6, padding: 10, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: SL.ui800 }}>{r.a}</div>
            <div style={{ background: SL.green50, border: `1px solid ${SL.green100}`, borderRadius: 6, padding: 10, fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', color: SL.ui900 }}>{r.b}</div>
          </div>
        </div>
      ))}
    </Modal>
  );
}

function CommentsPanel({ item }) {
  return (
    <Card padding={0}>
      {item.comments.map((c, i) => (
        <div key={c.id} style={{ padding: 16, borderBottom: i < item.comments.length - 1 ? `1px solid ${SL.ui200}` : 'none', display: 'flex', gap: 12 }}>
          <Avatar name={c.who} size={32}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: SL.ui900 }}>{c.who}</span>
              {c.kind === 'rejection' && <Badge tone="red" icon="x-circle">Rejection reason</Badge>}
              <span style={{ fontSize: 12, color: SL.ui600 }}>{formatDateTime(c.at)}</span>
              <Badge tone="neutral" icon="kanban" style={{ marginLeft: 'auto' }}>Synced to Monday.com</Badge>
            </div>
            <div style={{ fontSize: 14, color: SL.ui800, lineHeight: 1.55, marginTop: 6 }}>{c.text}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function FragmentInspector({ item }) {
  const f = item.content.fragment || { path: item.brief.fragment, model: 'stena/generic-v1', langs: ['en'], published: '—' };
  return (
    <Card>
      <Eyebrow>AEM content fragment</Eyebrow>
      <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: SL.ui800, background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: 12, lineHeight: 1.7 }}>
        <div><span style={{ color: SL.ui600 }}>fragment:</span> {f.path}</div>
        <div><span style={{ color: SL.ui600 }}>model:</span> {f.model}</div>
        <div><span style={{ color: SL.ui600 }}>language masters:</span> {f.langs.join(', ')}</div>
        <div><span style={{ color: SL.ui600 }}>last published:</span> {f.published}</div>
        <div><span style={{ color: SL.ui600 }}>resolved via:</span> {item.brief.pageUrl ? 'URL resolver (page → fragment)' : 'fragment model lookup'}</div>
        <div><span style={{ color: SL.ui600 }}>write mode:</span> new unpublished version · never auto-published</div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: SL.ui600, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="info" size={12} color={SL.coreBlue}/> Field mapping is defined by the fragment model — {item.content.fields.length} fields map 1:1 to {item.content.fields.length} fragment properties.
      </div>
    </Card>
  );
}
