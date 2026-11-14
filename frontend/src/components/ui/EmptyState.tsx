import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Radio } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Radio,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-astra-surface/50 border border-astra-border/60 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-astra-raised/80 border border-astra-border flex items-center justify-center text-astra-accent mb-3">
        <Icon size={22} />
      </div>
      <h4 className="font-display font-bold text-sm text-astra-text tracking-wide mb-1">
        {title}
      </h4>
      <p className="text-xs text-astra-muted font-sans max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
