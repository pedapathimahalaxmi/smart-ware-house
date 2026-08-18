import React from 'react';
import { ToastMessage } from '../../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let borderClass = 'border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]';
        let icon = '⚡';
        let bgGradient = 'from-slate-900 via-slate-900 to-cyan-950/40';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.35)]';
          icon = '✅';
          bgGradient = 'from-slate-900 via-slate-900 to-emerald-950/40';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]';
          icon = '⚠️';
          bgGradient = 'from-slate-900 via-slate-900 to-amber-950/40';
        } else if (toast.type === 'danger') {
          borderClass = 'border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.35)]';
          icon = '🚨';
          bgGradient = 'from-slate-900 via-slate-900 to-rose-950/40';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-gradient-to-r ${bgGradient} border ${borderClass} backdrop-blur-xl text-slate-100 transition-all duration-300 transform translate-y-0 opacity-100 flex items-start space-x-3`}
          >
            <span className="text-xl select-none mt-0.5">{icon}</span>
            <div className="flex-1 pr-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-100">{toast.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-200 text-xs p-1 rounded hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
