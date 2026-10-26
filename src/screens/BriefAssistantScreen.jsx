import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store/store.jsx';
import { useToast } from '../shared/toast.jsx';
import { navigate } from '../shared/router.js';
import { PageShell, SectionHeader, Button, Badge, Icon } from '../shared/ui.jsx';
import { SL, CHANNELS } from '../shared/theme.js';
import { ASSISTANT_SUGGESTIONS, USER } from '../shared/data.js';
import { DEMO_NOW } from '../shared/time.js';

const LANGS = { website: 4, app: 8, onboard: 3, email: 1, social: 1 };
const MARKETS = { website: 'United Kingdom', email: 'United Kingdom & Ireland', social: 'United Kingdom & Ireland', app: 'Global · all markets', onboard: 'Holyhead ↔ Dublin route' };
const FIELD_MAP = {
  wq2: 'pageUrl', wq3: 'audience', wq4: 'keyMessage', wq5: 'goal', wq6: 'notes',
  eq1: 'campaignType', eq2: 'audience', eq3: 'keyMessage', eq4: 'cta', eq5: 'subjectGuidance',
  sq1: 'platforms', sq2: 'message', sq3: 'visualDirection', sq4: 'link', sq5: 'hashtags',
  aq1: 'screen', aq2: 'journey', aq3: 'desiredFeel', aq4: 'constraints',
  oq1: 'route', oq2: 'location', oq3: 'duration', oq4: 'message', oq5: 'languages',
};
const INVISIBLE = {
  website: [{ label: 'SEO keywords', sub: 'UK route landing v2', icon: 'trending-up' }, { label: 'WCAG 2.2 AA', sub: 'Plain language · alt text · headings', icon: 'accessibility' }, { label: 'Structured data', sub: 'TravelAction schema', icon: 'code' }, { label: 'Open Graph', sub: 'Auto-generated', icon: 'share-2' }],
  email: [{ label: 'Mobile rendering', sub: 'Subject ≤ 60 · preheader ≤ 110', icon: 'smartphone' }, { label: 'Performance refs', sub: 'Adobe Campaign top performers', icon: 'bar-chart-3' }, { label: 'Glossary', sub: '"fare" not "ticket"', icon: 'book-open' }],
  social: [{ label: 'Per-platform limits', sub: 'IG 2200 · X 280 · LI 3000', icon: 'ruler' }, { label: 'Hashtag policy', sub: 'IG only · max 6', icon: 'hash' }, { label: 'Engagement signals', sub: '30-day analytics', icon: 'trending-up' }],
  app: [{ label: 'WCAG 2.2 AA', sub: 'Plain language · verb-first CTAs', icon: 'accessibility' }, { label: 'Character limits', sub: 'From the fragment model', icon: 'ruler' }, { label: 'Glossary', sub: '8 languages · protected terms', icon: 'book-open' }],
  onboard: [{ label: 'Display constraints', sub: 'Headline ≤ 30 · body ≤ 90', icon: 'monitor' }, { label: 'Route languages', sub: 'EN · CY · GA', icon: 'languages' }, { label: 'Timetable context', sub: 'Live route data', icon: 'ship' }],
};

export default function BriefAssistantScreen({ initialChannel }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [channel, setChannel] = useState(initialChannel && CHANNELS[initialChannel] ? initialChannel : null);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0); // index of current question
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const scrollRef = useRef(null);

  const questions = channel ? state.questions[channel] : [];
  const current = questions[idx];
  const done = channel && idx >= questions.length;

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [idx, typing, channel, submitted]);

  const pickChannel = (c) => { setChannel(c); setTyping(true); setTimeout(() => setTyping(false), 600); };
  const answer = (text) => {
    if (!current) return;
    setAnswers(a => ({ ...a, [current.id]: text }));
    setDraft('');
    setTyping(true);
    setTimeout(() => { setTyping(false); setIdx(i => i + 1); }, current.id === 'wq2' ? 1100 : 650);
  };
  const skip = () => { if (current && !current.mandatory) answer('—'); };
  const reset = () => { setChannel(null); setAnswers({}); setIdx(0); setDraft(''); setSubmitted(null); };

  const title = useMemo(() => {
    if (!channel) return '';
    const by = (fieldName) => { const q = questions.find(x => FIELD_MAP[x.id] === fieldName); return q ? answers[q.id] : null; };
    const trunc = (s, n = 58) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
    if (channel === 'website') {
      const url = by('pageUrl');
      const slug = url && url !== '—' ? url.split('/').filter(Boolean).slice(-2).map(s => s.replace(/-/g, ' ')).join(' — ') : null;
      const isUpdate = /update/i.test(answers.wq1 || '');
      return slug ? `${slug.replace(/\b\w/g, c => c.toUpperCase())} — ${isUpdate ? 'page update' : 'new page'}` : `New website page — ${trunc(by('audience') || 'brief', 40)}`;
    }
    const core = by('keyMessage') || by('message') || by('screen') || Object.values(answers)[0];
    return `${CHANNELS[channel].label} — ${trunc(core || 'new brief')}`;
  }, [channel, answers, questions]);

  const submit = () => {
    const brief = { market: MARKETS[channel], deadline: new Date(DEMO_NOW + 14 * 864e5).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), extra: [] };
    questions.forEach(q => {
      const v = answers[q.id];
      if (!v || v === '—') return;
      const key = FIELD_MAP[q.id];
      if (key === 'platforms' || key === 'languages') brief[key] = v.split(/,|\band\b/).map(s => s.trim()).filter(Boolean);
      else if (key) brief[key] = v;
      else brief.extra.push({ label: q.q, value: v });
    });
    if (brief.pageUrl) brief.fragment = `route-landing/${brief.pageUrl.split('/').filter(Boolean).slice(-2).join('-')}`;
    if (channel === 'website') brief.pageType = 'Route landing page';
    const briefType = channel === 'website' && /update/i.test(answers.wq1 || '') ? 'update' : 'new';
    const id = `BRF-${state.nextBriefNo}`;
    dispatch({ type: 'BRIEF_SUBMIT', channel, title, brief, briefType, langs: LANGS[channel], priority: 'Medium' });
    setSubmitted(id);
    toast(`${id} created in Monday.com · status "Ready to be picked up".`, { kind: 'success', action: { label: 'View queue', onClick: () => navigate('queue') } });
  };

  const suggestions = current ? (ASSISTANT_SUGGESTIONS[channel]?.[current.id] || []) : [];
  const progress = questions.map(q => ({ label: q.q.replace(/\?.*$/, '').replace(/\s*\(.*\)$/, ''), value: answers[q.id], done: answers[q.id] !== undefined, mandatory: q.mandatory }));

  return (
    <PageShell style={{ maxWidth: 1100 }}>
      <SectionHeader
        eyebrow="AI Brief Assistant"
        title="Tell me what you need — I'll structure the brief"
        description="The assistant adapts its questions to the channel. Marketing sets which questions are mandatory in Admin → Brief questions. SEO and accessibility never appear here — those are handled automatically downstream."
        actions={<>{channel && <Button variant="ghost" icon="rotate-ccw" onClick={reset}>Start over</Button>}<Button variant="ghost" icon="external-link" onClick={() => toast('Would open the Monday.com "Content briefs" board.', { icon: 'external-link' })}>Open in Monday.com</Button></>}
      />

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 600, maxHeight: 'calc(100vh - 260px)' }}>
          <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg, #122f66 0%, #004a93 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={16}/></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Brief Assistant</div>
              <div style={{ fontSize: 11, color: SL.himmel }}>{channel ? `${CHANNELS[channel].label} · ${questions.filter(q => q.mandatory).length} mandatory questions` : 'Channel-aware · validates before submission'}</div>
            </div>
            <div style={{ flex: 1 }}/>
            <Badge tone="dark" dot>Live</Badge>
          </div>

          <div ref={scrollRef} style={{ flex: 1, padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bubble>Hi {USER.name.split(' ')[0]} — what kind of content do you need? I'll set up a brief that's ready for the AI to pick up.</Bubble>
            {!channel ? (
              <Bubble>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 4 }}>
                  {Object.entries(CHANNELS).map(([key, c]) => (
                    <button key={key} onClick={() => pickChannel(key)} className="channel-pick" style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <Icon name={c.icon} size={18} color={c.color}/>
                      <span style={{ fontSize: 13, fontWeight: 500, color: SL.ui900 }}>{c.label}</span>
                      <span style={{ fontSize: 10, color: SL.ui600 }}>{state.questions[key].length} questions</span>
                    </button>
                  ))}
                </div>
              </Bubble>
            ) : <UserBubble>{CHANNELS[channel].label}</UserBubble>}

            {channel && questions.slice(0, Math.min(idx + 1, questions.length)).map((q, i) => (
              <div key={q.id} style={{ display: 'contents' }}>
                {(i < idx || !typing) && (
                  <Bubble>
                    {q.q.replace(/\s*\(new \/ update\)/, '')}{q.mandatory ? '' : <span style={{ color: SL.ui500 }}> (optional)</span>}
                    {q.helper && <div style={{ fontSize: 12, color: SL.ui600, marginTop: 4 }}>{q.helper}</div>}
                  </Bubble>
                )}
                {answers[q.id] !== undefined && <UserBubble>{answers[q.id] === '—' ? <em style={{ opacity: .7 }}>Skipped</em> : answers[q.id]}</UserBubble>}
                {q.id === 'wq2' && answers[q.id] && answers[q.id] !== '—' && (i < idx) && (
                  <Bubble>
                    <div style={{ background: SL.green50, border: `1px solid ${SL.green100}`, borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: SL.green700, fontWeight: 500, marginBottom: 6 }}><Icon name="check-circle-2" size={14}/> Resolved via AEM URL resolver</div>
                      <div style={{ fontSize: 13, color: SL.ui900 }}>Found content fragment: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>route-landing/{answers[q.id].split('/').filter(Boolean).slice(-2).join('-')}</code></div>
                      <div style={{ fontSize: 12, color: SL.ui700, marginTop: 4 }}>Language masters: EN · NL · DE · SV</div>
                    </div>
                  </Bubble>
                )}
              </div>
            ))}
            {typing && <Typing/>}
            {done && !typing && (
              <Bubble>
                <div style={{ marginBottom: 8 }}>That's everything I need. Here's the brief as it will appear in Monday.com:</div>
                <div style={{ background: '#fff', border: `1px solid ${SL.coreBlue}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: SL.coreBlue, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Brief preview</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: SL.ui900, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 12, color: SL.ui700, lineHeight: 1.6 }}>
                    <div><strong>Channel:</strong> {CHANNELS[channel].label}{channel === 'website' ? ` · ${/update/i.test(answers.wq1 || '') ? 'Update' : 'New page'}` : ''} · {LANGS[channel]} language{LANGS[channel] === 1 ? '' : 's'}</div>
                    {questions.filter(q => answers[q.id] && answers[q.id] !== '—' && q.id !== 'wq1').map(q => <div key={q.id}><strong>{q.q.replace(/\?.*$/, '').replace(/\s*\(.*\)$/, '')}:</strong> {answers[q.id]}</div>)}
                  </div>
                </div>
              </Bubble>
            )}
            {submitted && (
              <Bubble>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: SL.green700, fontWeight: 500 }}><Icon name="check-circle-2" size={16}/> Created {submitted} in Monday.com with status <em>Ready to be picked up</em>.</div>
                <div style={{ fontSize: 13, color: SL.ui700, marginTop: 6 }}>The webhook fires in a moment, the AI generates v1, and it lands in your review queue. You can follow it there.</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Button size="sm" variant="primary" icon="inbox" onClick={() => navigate('queue')}>Go to queue</Button>
                  <Button size="sm" variant="ghost" icon="eye" onClick={() => navigate(`review/${submitted}`)}>Watch generation</Button>
                  <Button size="sm" variant="ghost" icon="plus" onClick={reset}>Another brief</Button>
                </div>
              </Bubble>
            )}
          </div>

          {channel && !done && (
            <div style={{ padding: 16, borderTop: `1px solid ${SL.ui300}`, background: SL.ui100 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} disabled={typing}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (draft.trim()) answer(draft.trim()); } }}
                  placeholder={current ? 'Type your answer… (Enter to send)' : ''}
                  style={{ flex: 1, border: `1px solid ${SL.ui400}`, borderRadius: 6, padding: 10, fontSize: 14, resize: 'none', outline: 'none' }}/>
                <Button variant="primary" iconRight="arrow-up" disabled={!draft.trim() || typing} onClick={() => answer(draft.trim())}>Send</Button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {suggestions.length > 0 && <span style={{ fontSize: 11, color: SL.ui600 }}>Suggested:</span>}
                {suggestions.map(s => <button key={s} className="pill-btn" disabled={typing} onClick={() => (s === 'Skip' ? skip() : answer(s))} style={{ maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</button>)}
                {current && !current.mandatory && !suggestions.includes('Skip') && <button className="pill-btn" disabled={typing} onClick={skip}>Skip</button>}
                <span style={{ fontSize: 11, color: SL.ui500, marginLeft: 'auto' }}>Question {Math.min(idx + 1, questions.length)} of {questions.length}</span>
              </div>
            </div>
          )}
          {done && !submitted && (
            <div style={{ padding: 16, borderTop: `1px solid ${SL.ui300}`, background: SL.green50, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="check-circle-2" size={20} color={SL.green600}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: SL.ui900 }}>Brief complete · all mandatory fields filled</div>
                <div style={{ fontSize: 12, color: SL.ui700 }}>Submitting creates the item in Monday.com and sets it to <em>Ready to be picked up</em>. The AI starts immediately.</div>
              </div>
              <Button variant="ghost" icon="pencil" onClick={() => setIdx(0)}>Edit answers</Button>
              <Button variant="primary" icon="send-horizontal" onClick={submit}>Submit brief</Button>
            </div>
          )}
        </div>

        <div>
          <div style={{ background: '#fff', border: `1px solid ${SL.ui300}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Brief progress</div>
            <ProgressRow label="Channel" value={channel ? CHANNELS[channel].label : '—'} done={!!channel} last={!channel}/>
            {progress.map((p, i) => <ProgressRow key={i} label={p.label} value={p.done ? (p.value === '—' ? 'Skipped' : p.value) : (p.mandatory ? 'Required' : 'Optional')} done={p.done} muted={!p.done && !p.mandatory} last={i === progress.length - 1}/>)}
          </div>
          <div style={{ background: SL.himmelLighter, border: `1px solid ${SL.himmelLight}`, borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: SL.coreBlue, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="eye-off" size={12}/> Handled invisibly</div>
            <div style={{ fontSize: 12, color: SL.ui800, lineHeight: 1.55, marginBottom: 10 }}>The assistant never asks copywriters about SEO, accessibility, or technical formatting. These are configured once by experts and applied automatically.</div>
            {(INVISIBLE[channel] || INVISIBLE.website).map((i, idx2) => (
              <div key={idx2} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
                <Icon name={i.icon} size={14} color={SL.coreBlue} style={{ marginTop: 1 }}/>
                <div><div style={{ fontSize: 12, fontWeight: 500, color: SL.ui900 }}>{i.label}</div><div style={{ fontSize: 11, color: SL.ui700 }}>{i.sub}</div></div>
              </div>
            ))}
            <Button variant="flat" size="sm" iconRight="arrow-right" style={{ marginTop: 6 }} onClick={() => navigate('admin/questions')}>Configure questions</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ProgressRow({ label, value, done, muted, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${SL.ui200}` }}>
      <div style={{ width: 18, height: 18, borderRadius: 9999, background: done ? SL.green600 : SL.ui200, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{done && <Icon name="check" size={11}/>}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: SL.ui600 }}>{label}</div>
        <div style={{ fontSize: 13, color: done ? SL.ui900 : muted ? SL.ui400 : SL.ui500, fontWeight: done ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}

function Bubble({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'linear-gradient(135deg, #122f66, #004a93)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name="sparkles" size={14}/></div>
      <div style={{ flex: 1, minWidth: 0, background: SL.ui100, padding: '10px 14px', borderRadius: '14px 14px 14px 4px', fontSize: 14, color: SL.ui900, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}
function UserBubble({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: SL.coreBlue, color: '#fff', padding: '10px 14px', borderRadius: '14px 14px 4px 14px', fontSize: 14, maxWidth: '75%', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{children}</div>
    </div>
  );
}
function Typing() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'linear-gradient(135deg, #122f66, #004a93)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={14}/></div>
      <div style={{ display: 'flex', gap: 4, padding: '12px 14px', background: SL.ui100, borderRadius: 14 }}>
        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: 9999, background: SL.ui500, animation: `tdot 1s infinite ${i * 0.15}s` }}/>)}
      </div>
    </div>
  );
}
