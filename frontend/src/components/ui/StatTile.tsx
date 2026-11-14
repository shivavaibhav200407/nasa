import React from 'react';
import { ArcGauge } from './ArcGauge';
import { Sparkline } from './Sparkline';
import { StatusBadge, type StatusLevel } from './StatusBadge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatTileProps {
  id: string;
  title: string;
  value: number;
  max?: number;
  unit?: string;
  status: StatusLevel | string;
  history?: number[];
  delta?: number; // e.g. -2.5 or +1.8
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  title,
  value,
  max = 100,
  unit = '%',
  status,
  history = [],
  delta,
  onClick,
  selected = false,
  className = '',
}) => {
  const rawStatus = (status || 'NOMINAL').toUpperCase();
  const normStatus: 'NOMINAL' | 'CAUTION' | 'CRITICAL' =
    rawStatus === 'CRITICAL' || rawStatus === 'SEVERE'
      ? 'CRITICAL'
      : rawStatus === 'CAUTION' || rawStatus === 'WARNING'
      ? 'CAUTION'
      : 'NOMINAL';

  const getBorderColor = () => {
    if (selected) return 'border-astra-accent shadow-glow-accent ring-1 ring-astra-accent';
    if (normStatus === 'CRITICAL') return 'border-astra-critical/50 hover:border-astra-critical';
    if (normStatus === 'CAUTION') return 'border-astra-caution/50 hover:border-astra-caution';
    return 'border-astra-border hover:border-astra-border-light';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl bg-astra-surface/90 backdrop-blur-sm border transition-all duration-200 select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent ${getBorderColor()} ${className}`}
      aria-label={`${title}: ${value}${unit}, status ${status}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-display font-semibold text-xs tracking-wider uppercase text-astra-text group-hover:text-astra-accent transition-colors">
          {title}
        </span>
        <StatusBadge status={normStatus} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="shrink-0">
          <ArcGauge
            value={value}
            max={max}
            label={title}
            unit={unit}
            status={normStatus}
            size={72}
            strokeWidth={7}
            showTicks={false}
          />
        </div>

        <div className="flex-1 flex flex-col items-end justify-center min-w-0">
          {/* Trend Delta Chip */}
          {delta !== undefined && (
            <div
              className={`flex items-center gap-1 text-[11px] font-mono font-semibold mb-1.5 ${
                delta > 0
                  ? 'text-astra-nominal'
                  : delta < 0
                  ? 'text-astra-critical'
                  : 'text-astra-muted'
              }`}
            >
              {delta > 0 ? (
                <TrendingUp size={12} strokeWidth={2.5} />
              ) : delta < 0 ? (
                <TrendingDown size={12} strokeWidth={2.5} />
              ) : (
                <Minus size={12} strokeWidth={2.5} />
              )}
              <span>
                {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                {unit}
              </span>
            </div>
          )}

          {/* Miniature Sparkline */}
          <div className="pt-0.5">
            <Sparkline
              data={history.length > 1 ? history : [value, value]}
              width={76}
              height={22}
              color={
                normStatus === 'CRITICAL'
                  ? '#FF5C6C'
                  : normStatus === 'CAUTION'
                  ? '#FFB84D'
                  : '#4FD1FF'
              }
            />
          </div>
        </div>
      </div>
    </button>
  );
};
