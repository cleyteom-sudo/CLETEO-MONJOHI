import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id ? `${toast.id}-${index}` : `toast-${index}`}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-300'
                : 'bg-slate-900/95 border-blue-500/50 text-blue-300'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs text-white tracking-wide">{toast.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
