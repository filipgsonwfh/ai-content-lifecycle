// Shared UI primitives — Stena Line design system.
import { useEffect, useState } from 'react';
import { ICONS } from './icons.js';
import { SL, CHANNELS, STATES } from './theme.js';

// ---------- Icon (lucide-react, kebab-case names → generated map in icons.js) ----------
export function iconComponent(name) {
  return ICONS[name] || null;
}
export function Icon({ name, size = 16, color = 'currentColor', style = {}, strokeWidth = 2, className }) {
  const Cmp = ICONS[name] || ICONS['circle-help'];
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} className={className} style={{ flex: 'none', ...style }} aria-hidden="true"/>;
}

// ---------- Buttons ----------
export function Button({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, disabled, loading, style = {}, type = 'button', title, ...rest }) {
  const heights = { sm: 32, md: 40, lg: 48 };
  const fonts = { sm: 13, md: 14, lg: 16 };
  const pads = { sm: '6px 14px', md: '8px 20px', lg: '10px 28px' };
  const variants = {
    primary: { background: SL.coreBlue, color: '#fff', border: `1px solid ${SL.coreBlue}` },
    secondary: { background: '#fff', color: SL.coreBlue, border: `1px solid ${SL.coreBlue}` },
    flat: { background: 'transparent', color: SL.coreBlue, border: '1px solid transparent' },
    danger: { background: SL.sjobod, color: '#fff', border: `1px solid ${SL.sjobod}` },
    ghost: { background: 'transparent', color: SL.ui700, border: `1px solid ${SL.ui300}` },
    success: { background: SL.green600, color: '#fff', border: `1px solid ${SL.green600}` },
  };
  const v = variants[variant];
  const isDisabled = disabled || loading;
  return (
    <button type={type} disabled={isDisabled} onClick={onClick} title={title} {...rest}
      className={`btn btn-${variant}`}
      style={{
        ...v, opacity: isDisabled ? 0.55 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer',
        height: heights[size], fontSize: fonts[size], padding: pads[size], borderRadius: 9999,
        fontFamily: 'var(--swui-font-primary)', fontWeight: 500,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
        transition: 'background .15s, color .15s, border-color .15s, opacity .15s', ...style,
      }}>
      {loading ? <Icon name="loader-2" size={size === 'sm' ? 14 : 16} className="spin"/> : icon && <Icon name={icon} size={size === 'sm' ? 14 : 16}/>}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={size === 'sm' ? 14 : 16}/>}
    </button>
  );
}

// ---------- Badge ----------
export const BADGE_TONES = {
  neutral: { bg: SL.ui200, fg: SL.ui700, dot: SL.ui500 },
  blue: { bg: SL.himmelLighter, fg: SL.coreBlue, dot: SL.modernBlue },
  green: { bg: SL.green50, fg: SL.green700, dot: SL.green600 },
  orange: { bg: SL.orange50, fg: SL.orange900, dot: SL.orange500 },
  red: { bg: SL.red50, fg: SL.tang, dot: SL.sjobod },
  turq: { bg: SL.turq100, fg: SL.turq700, dot: SL.turq500 },
  dark: { bg: SL.ui800, fg: '#fff', dot: SL.himmel },
};
export function Badge({ tone = 'neutral', children, dot = false, icon, style = {}, title }) {
  const t = BADGE_TONES[tone] || BADGE_TONES.neutral;
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, background: t.bg, color: t.fg,
      padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 9999, background: t.dot }}/>}
      {icon && <Icon name={icon} size={12}/>}
      {children}
    </span>
  );
}

// ---------- Card ----------
export function Card({ children, style = {}, padding = 20, hoverable = false, onClick, className }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} className={className}
      onMouseEnter={hoverable ? () => setHover(true) : undefined}
      onMouseLeave={hoverable ? () => setHover(false) : undefined}
      style={{
        background: '#fff', border: `1px solid ${hover ? SL.modernBlue : SL.ui300}`, borderRadius: 8, padding,
        boxShadow: '0 3px 1px -2px rgba(0,0,0,.08), 0 0 4px 0 rgba(0,0,0,.06)',
        transition: 'box-shadow .15s, border-color .15s', cursor: onClick ? 'pointer' : 'default', ...style,
      }}>
      {children}
    </div>
  );
}

// ---------- Channel chip ----------
export function ChannelChip({ channel, size = 'md' }) {
  const c = CHANNELS[channel] || CHANNELS.website;
  const dim = size === 'sm' ? { pad: '2px 8px', fs: 11 } : { pad: '4px 10px', fs: 12 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: dim.pad, borderRadius: 9999,
      background: '#fff', border: `1px solid ${SL.ui300}`, fontSize: dim.fs, fontWeight: 500, color: SL.ui800, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: c.color }}/>
      {c.label}
    </span>
  );
}

// ---------- Status pill ----------
export function StatusPill({ state, pulse }) {
  const m = STATES[state] || STATES.pending;
  const animated = pulse || state === 'generating' || state === 'translating';
  return <Badge tone={m.tone} icon={m.icon} style={animated ? { animation: 'tdot 1.6s infinite' } : undefined}>{m.label}</Badge>;
}

// ---------- Text field ----------
export function TextField({ label, value, onChange, placeholder, icon, required, helper, style = {}, rows, type = 'text', autoFocus, onKeyDown }) {
  const Tag = rows ? 'textarea' : 'input';
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <span style={{ fontSize: 12, fontWeight: 500, color: SL.ui700, letterSpacing: '.04em', textTransform: 'uppercase', display: 'flex', gap: 4 }}>
          {label}{required && <span style={{ color: SL.sjobod }}>*</span>}
        </span>
      )}
      <div style={{
        display: 'flex', alignItems: rows ? 'flex-start' : 'center', gap: 8, background: '#fff', border: `1px solid ${SL.ui400}`, borderRadius: 4,
        minHeight: rows ? undefined : 40, padding: rows ? 10 : '0 12px',
      }}>
        {icon && <Icon name={icon} size={16} color={SL.coreBlue} style={{ marginTop: rows ? 2 : 0 }}/>}
        <Tag rows={rows} value={value} autoFocus={autoFocus} onKeyDown={onKeyDown} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} type={type} style={{
          border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: 14, color: SL.ui900, minWidth: 0, resize: 'vertical', lineHeight: 1.5, padding: 0,
        }}/>
      </div>
      {helper && <span style={{ fontSize: 12, color: SL.ui600 }}>{helper}</span>}
    </label>
  );
}

// ---------- Section header ----------
export function SectionHeader({ eyebrow, title, description, actions, style = {} }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', ...style }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div style={{ fontSize: 12, fontWeight: 500, color: SL.coreBlue, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{eyebrow}</div>}
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: SL.ui900, letterSpacing: '-.005em' }}>{title}</h2>
        {description && <p style={{ margin: '6px 0 0', fontSize: 14, color: SL.ui600, maxWidth: 700 }}>{description}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

// ---------- Stat tile ----------
export function StatTile({ label, value, delta, deltaTone = 'green', icon, sublabel, onClick, active }) {
  const deltaTones = { green: SL.green700, red: SL.sjobod, neutral: SL.ui600 };
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: `1px solid ${active ? SL.coreBlue : SL.ui300}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 4,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500 }}>{label}</span>
        {icon && <Icon name={icon} size={14} color={SL.ui500}/>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: SL.ui900, letterSpacing: '-.01em', lineHeight: 1.1 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, minHeight: 16 }}>
        {delta && <span style={{ color: deltaTones[deltaTone], fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <Icon name={deltaTone === 'red' ? 'trending-down' : 'trending-up'} size={12}/> {delta}
        </span>}
        {sublabel && <span style={{ color: SL.ui600 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

// ---------- Tabs ----------
export function Tabs({ tabs, active, onChange, style = {} }) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${SL.ui300}`, overflowX: 'auto', ...style }}>
      {tabs.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} role="tab" aria-selected={isActive} onClick={() => onChange(t.key)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px 16px',
            borderBottom: `2px solid ${isActive ? SL.coreBlue : 'transparent'}`, color: isActive ? SL.coreBlue : SL.ui700,
            fontWeight: isActive ? 500 : 400, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: -1, whiteSpace: 'nowrap',
          }}>
            {t.icon && <Icon name={t.icon} size={14}/>}
            {t.label}
            {t.count !== undefined && (
              <span style={{ background: isActive ? SL.himmelLighter : SL.ui200, color: isActive ? SL.coreBlue : SL.ui700, fontSize: 11, padding: '1px 7px', borderRadius: 9999, fontWeight: 500 }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Avatar ----------
export function Avatar({ name = '', color, size = 28 }) {
  const normalized = name.normalize('NFC');
  const initials = normalized.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('');
  const palette = [SL.coreBlue, SL.modernBlue, SL.green600, SL.orange500, SL.sjobod, SL.turq700, SL.mussla];
  const hash = [...normalized].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 9973, 7);
  const c = color || palette[hash % palette.length];
  return (
    <div title={name} style={{
      width: size, height: size, borderRadius: 9999, background: c, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.4, flex: 'none',
    }}>{initials.toUpperCase()}</div>
  );
}

// ---------- Page shell ----------
export function PageShell({ children, style = {} }) {
  return <main style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 32px 64px', ...style }}>{children}</main>;
}

// ---------- Key/value ----------
export function KV({ label, value, style = {} }) {
  return (
    <div style={{ marginTop: 10, ...style }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 13, color: SL.ui800, marginTop: 2, lineHeight: 1.5, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

export function MiniStat({ label, value, tone, delta }) {
  const colors = { green: SL.green700, red: SL.sjobod };
  return (
    <div style={{ background: SL.ui100, border: `1px solid ${SL.ui300}`, borderRadius: 6, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: SL.ui600, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors[tone] && !delta ? colors[tone] : SL.ui900, marginTop: 2 }}>{value}</div>
      {delta && <div style={{ fontSize: 11, color: colors[tone] || SL.ui600, fontWeight: 500 }}>{delta}</div>}
    </div>
  );
}

export function Eyebrow({ children, color = SL.ui600, icon, style = {} }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, ...style }}>
      {icon && <Icon name={icon} size={12}/>}{children}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)}/>;
}

// ---------- Modal ----------
export function Modal({ title, subtitle, children, footer, onClose, wide, icon }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          {icon && <div style={{ width: 36, height: 36, borderRadius: 8, background: SL.himmelLighter, color: SL.coreBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Icon name={icon} size={18}/></div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'transparent', border: 'none', color: SL.ui600, fontSize: 16, padding: 4, borderRadius: 6 }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, body, confirmLabel = 'Confirm', danger, onConfirm, onClose, children, icon }) {
  return (
    <Modal title={title} onClose={onClose} icon={icon || (danger ? 'alert-triangle' : 'check-circle-2')}
      footer={<>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
      </>}>
      {body && <p style={{ margin: '0 0 12px', fontSize: 14, color: SL.ui800, lineHeight: 1.55 }}>{body}</p>}
      {children}
    </Modal>
  );
}

export function EmptyState({ icon = 'inbox', title, body, action }) {
  return (
    <div className="empty">
      <Icon name={icon} size={28} color={SL.ui400} style={{ marginBottom: 10 }}/>
      <strong>{title}</strong>
      {body && <div>{body}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

export function Spinner({ size = 16, color = SL.coreBlue }) {
  return <Icon name="loader-2" size={size} color={color} className="spin"/>;
}
