import React from 'react';

export interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'icon-circle';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-sans uppercase font-bold tracking-wider transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cinematic-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cinematic-bg-dark disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-5 py-2.5 rounded-full min-h-[38px]',
    md: 'text-sm px-8 py-3.5 rounded-full min-h-[48px]',
    lg: 'text-base px-10 py-4 rounded-full min-h-[56px]',
  }[size];

  const variantClasses = {
    primary:
      'bg-cinematic-pill text-cinematic-pill-text shadow-glow-pill hover:bg-white hover:shadow-[0_0_32px_rgba(255,255,255,0.65)] hover:scale-[1.02]',
    secondary:
      'bg-cinematic-glass text-cinematic-text border border-cinematic-hairline backdrop-blur-md hover:border-cinematic-hairline-bright hover:bg-cinematic-glass-heavy hover:text-white',
    glass:
      'bg-cinematic-glass/60 text-cinematic-text border border-cinematic-hairline/80 backdrop-blur-md hover:border-cinematic-cyan/50 hover:text-cinematic-cyan',
    'icon-circle':
      'rounded-full p-0 flex items-center justify-center bg-cinematic-glass text-cinematic-text border border-cinematic-hairline backdrop-blur-md hover:border-cinematic-cyan hover:text-cinematic-cyan hover:scale-105 shadow-panel',
  }[variant];

  const circleSizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  }[size];

  if (variant === 'icon-circle') {
    return (
      <button
        disabled={disabled}
        className={`${baseClasses} ${variantClasses} ${circleSizeClasses} ${className}`}
        {...props}
      >
        {icon || children}
      </button>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
