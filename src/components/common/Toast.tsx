import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faInfoCircle, faXmark } from '@fortawesome/free-solid-svg-icons';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-100 max-w-sm animate-slide-up"
        >
          <div className="shrink-0">
            {toast.type === 'info' ? (
              <FontAwesomeIcon icon={faInfoCircle} className="text-sky-400 text-sm" />
            ) : (
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-sm" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-100">{toast.title}</div>
            {toast.description && (
              <div className="text-[11px] text-slate-400 mt-0.5">{toast.description}</div>
            )}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-slate-300 p-1 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
};
