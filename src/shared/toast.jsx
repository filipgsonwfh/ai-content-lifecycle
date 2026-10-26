import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Icon } from './ui.jsx';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});
  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);
  const toast = useCallback((text, opts = {}) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(t => [...t.slice(-3), { id, text, kind: opts.kind || 'default', action: opts.action, icon: opts.icon }]);
    timers.current[id] = setTimeout(() => dismiss(id), opts.duration || 4200);
    return id;
  }, [dismiss]);
  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>
            <Icon name={t.icon || (t.kind === 'success' ? 'check-circle-2' : t.kind === 'error' ? 'alert-circle' : 'info')} size={16}/>
            <span style={{ flex: 1 }}>{t.text}</span>
            {t.action && <button onClick={() => { t.action.onClick(); dismiss(t.id); }}>{t.action.label}</button>}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" style={{ marginLeft: t.action ? 4 : 'auto' }}>✕</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast outside ToastProvider');
  return ctx.toast;
}
