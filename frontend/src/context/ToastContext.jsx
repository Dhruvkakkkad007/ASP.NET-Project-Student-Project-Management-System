import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = {
    success: (msg, title = 'Success') => addToast('success', msg, title),
    error: (msg, title = 'Error') => addToast('error', msg, title),
    info: (msg, title = 'Notice') => addToast('info', msg, title),
    warning: (msg, title = 'Warning') => addToast('warning', msg, title),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const config = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
              iconColor: 'text-emerald-600',
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-rose-50 text-rose-900 border-rose-200',
              iconColor: 'text-rose-600',
            },
            warning: {
              icon: AlertTriangle,
              bg: 'bg-amber-50 text-amber-900 border-amber-200',
              iconColor: 'text-amber-600',
            },
            info: {
              icon: Info,
              bg: 'bg-sky-50 text-sky-900 border-sky-200',
              iconColor: 'text-sky-600',
            },
          }[t.type] || {
            icon: Info,
            bg: 'bg-slate-50 text-slate-900 border-slate-200',
            iconColor: 'text-slate-600',
          };

          const IconComponent = config.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-200 ${config.bg}`}
            >
              <IconComponent className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
              <div className="flex-1 text-sm">
                {t.title && <p className="font-semibold">{t.title}</p>}
                <p className="text-slate-600">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

