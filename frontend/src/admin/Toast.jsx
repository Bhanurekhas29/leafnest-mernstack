import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((type, message) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000);
  }, [dismiss]);

  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✓' : '!'}</span>
            <div className="toast-body"><b>{t.type === 'success' ? 'Success' : 'Error'}</b><span>{t.message}</span></div>
            <button aria-label="Dismiss" onClick={() => dismiss(t.id)}>×</button>
            <i className="toast-bar" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
