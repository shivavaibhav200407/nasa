import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  }[variant];

  return (
    <div
      aria-hidden="true"
      style={{ width, height }}
      className={`animate-pulse bg-astra-raised/80 border border-astra-border/30 ${variantClasses} ${className}`}
    />
  );
};
