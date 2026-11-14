import React from 'react';

export interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="flex-1">
        <label
          htmlFor={id}
          className={`text-xs font-semibold font-display uppercase tracking-wide cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'text-astra-text'
          }`}
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-astra-muted font-sans mt-0.5">{description}</p>
        )}
      </div>

      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent focus-visible:ring-offset-2 focus-visible:ring-offset-astra-bg disabled:opacity-40 disabled:cursor-not-allowed ${
          checked ? 'bg-astra-accent shadow-glow-accent' : 'bg-astra-raised border-astra-border'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
