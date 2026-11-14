import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  durationMs?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast.durationMs && toast.durationMs > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.durationMs);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const config = {
    info: {
      icon: <Info className="text-astra-accent shrink-0" size={18} />,
      border: 'border-astra-accent/40',
      bg: 'bg-astra-surface/95',
      glow: 'shadow-glow-accent',
    },
    success: {
      icon: <CheckCircle className="text-astra-nominal shrink-0" size={18} />,
      border: 'border-astra-nominal/40',
      bg: 'bg-astra-surface/95',
      glow: 'shadow-glow-nominal',
    },
    warning: {
      icon: <AlertTriangle className="text-astra-caution shrink-0" size={18} />,
      border: 'border-astra-caution/40',
      bg: 'bg-astra-surface/95',
      glow: 'shadow-glow-caution',
    },
    error: {
      icon: <AlertCircle className="text-astra-critical shrink-0" size={18} />,
      border: 'border-astra-critical/50',
      bg: 'bg-astra-surface/95',
      glow: 'shadow-glow-critical',
    },
  }[toast.type];

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 max-w-md w-full pointer-events-auto ${config.border} ${config.bg} ${config.glow}`}
    >
      <div className="pt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h5 className="font-display font-semibold text-xs text-astra-text tracking-wide">
          {toast.title}
        </h5>
        {toast.description && (
          <p className="text-xs text-astra-muted font-sans mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-astra-muted hover:text-astra-text p-1 rounded-md hover:bg-astra-raised/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
