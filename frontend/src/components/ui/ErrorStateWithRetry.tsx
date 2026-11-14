import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateWithRetryProps {
  title?: string;
  message: string;
  onRetry: () => void;
  className?: string;
}

export const ErrorStateWithRetry: React.FC<ErrorStateWithRetryProps> = ({
  title = 'Telemetry Link Severed',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-astra-critical/10 border border-astra-critical/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-astra-critical/20 border border-astra-critical/40 flex items-center justify-center text-astra-critical mb-3">
        <AlertOctagon size={24} />
      </div>
      <h4 className="font-display font-bold text-sm text-astra-text tracking-wide mb-1">
        {title}
      </h4>
      <p className="text-xs text-astra-muted font-mono max-w-md mb-4 leading-relaxed">
        {message}
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
        icon={<RefreshCw size={14} />}
      >
        Retry Transmission
      </Button>
    </div>
  );
};
