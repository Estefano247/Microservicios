import { createContext, useContext, useState, useCallback } from 'react';
import Icon from './ui/Icon';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: 'checkCircle', accent: 'text-brand-600', ring: 'ring-brand-100' },
  error: { icon: 'alert', accent: 'text-red-600', ring: 'ring-red-100' },
  info: { icon: 'sparkle', accent: 'text-accent-500', ring: 'ring-accent-100' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5">
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.info;
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-[var(--shadow-pop)] ring-1 ${s.ring}`}
              style={{ animation: 'slideIn 0.3s cubic-bezier(0.22,1,0.36,1)' }}
            >
              <Icon name={s.icon} className={`mt-0.5 w-5 h-5 shrink-0 ${s.accent}`} />
              <p className="text-sm font-medium text-ink leading-snug">{t.message}</p>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
