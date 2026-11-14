import React from 'react';
import { Plus, Minus } from 'lucide-react';

export interface SliderWithStepperProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  onChange: (val: number) => void;
  description?: string;
  className?: string;
}

export const SliderWithStepper: React.FC<SliderWithStepperProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  disabled = false,
  onChange,
  description,
  className = '',
}) => {
  const handleStepDown = () => {
    const next = Math.max(min, Math.round((value - step) * 10) / 10);
    onChange(next);
  };

  const handleStepUp = () => {
    const next = Math.min(max, Math.round((value + step) * 10) / 10);
    onChange(next);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-astra-text font-display uppercase tracking-wide">
          {label}
        </label>
        <div className="font-mono text-xs font-bold text-astra-accent bg-astra-raised px-2 py-0.5 rounded border border-astra-border">
          {value.toFixed(step < 1 ? 1 : 0)}
          {unit}
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-astra-muted font-sans">{description}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleStepDown}
          disabled={disabled || value <= min}
          aria-label={`Decrease ${label}`}
          className="p-1.5 rounded-lg bg-astra-raised border border-astra-border text-astra-muted hover:text-astra-text hover:bg-astra-border/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent"
        >
          <Minus size={14} />
        </button>

        <div className="relative flex-1 flex items-center">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg bg-astra-raised appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent disabled:opacity-40"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value}${unit}`}
          />
        </div>

        <button
          type="button"
          onClick={handleStepUp}
          disabled={disabled || value >= max}
          aria-label={`Increase ${label}`}
          className="p-1.5 rounded-lg bg-astra-raised border border-astra-border text-astra-muted hover:text-astra-text hover:bg-astra-border/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex justify-between text-[10px] text-astra-dim font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};
