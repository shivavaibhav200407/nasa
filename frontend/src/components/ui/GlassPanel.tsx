import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'heavy' | 'interactive' | 'scrim';
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-cinematic-glass border border-cinematic-hairline backdrop-blur-md shadow-panel',
    heavy:
      'bg-cinematic-glass-heavy border border-cinematic-hairline-bright backdrop-blur-xl shadow-panel',
    interactive:
      'bg-cinematic-glass border border-cinematic-hairline backdrop-blur-md shadow-panel hover:border-cinematic-hairline-bright hover:shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300',
    scrim:
      'bg-black/60 backdrop-blur-md border border-cinematic-hairline/40',
  }[variant];

  return (
    <div
      className={`rounded-2xl ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
