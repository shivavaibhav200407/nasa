import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export type StatusLevel = 'NOMINAL' | 'CAUTION' | 'CRITICAL' | 'UNKNOWN';

export interface StatusBadgeProps {
  status: StatusLevel | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normStatus = (status || 'UNKNOWN').toUpperCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case 'NOMINAL':
      case 'OPTIMAL':
      case 'NORMAL':
        return {
          text: label || 'NOMINAL',
          icon: <ShieldCheck className="shrink-0" aria-hidden="true" />,
          classes:
            'bg-astra-nominal/15 text-astra-nominal border-astra-nominal/35 shadow-sm shadow-astra-nominal/10',
          dot: 'bg-astra-nominal',
        };
      case 'CAUTION':
      case 'WARNING':
      case 'MODERATE':
        return {
          text: label || 'CAUTION',
          icon: <AlertTriangle className="shrink-0" aria-hidden="true" />,
          classes:
            'bg-astra-caution/15 text-astra-caution border-astra-caution/35 shadow-sm shadow-astra-caution/10',
          dot: 'bg-astra-caution',
        };
      case 'CRITICAL':
      case 'SEVERE':
      case 'DANGER':
      case 'EMERGENCY':
        return {
          text: label || 'CRITICAL',
          icon: <AlertOctagon className="shrink-0" aria-hidden="true" />,
          classes:
            'bg-astra-critical/15 text-astra-critical border-astra-critical/40 shadow-sm shadow-astra-critical/20 animate-pulse',
          dot: 'bg-astra-critical',
        };
      default:
        return {
          text: label || 'MONITOR',
          icon: <HelpCircle className="shrink-0" aria-hidden="true" />,
          classes: 'bg-astra-border/30 text-astra-muted border-astra-border',
          dot: 'bg-astra-muted',
        };
    }
  };

  const config = getStatusConfig();

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1 font-semibold tracking-wider',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wider',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono uppercase select-none ${sizeStyles[size]} ${config.classes} ${className}`}
      role="status"
      aria-label={`Status: ${config.text}`}
    >
      {showIcon && (
        <span style={{ width: iconSizes[size], height: iconSizes[size] }}>
          {React.cloneElement(config.icon, {
            size: iconSizes[size],
            strokeWidth: 2.2,
          })}
        </span>
      )}
      <span>{config.text}</span>
    </span>
  );
};
