import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'xl',
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const timer = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-astra-bg/75 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideover-title"
    >
      {/* Backdrop clickable */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* SlideOver Drawer */}
      <div
        ref={panelRef}
        className={`relative w-full ${widthClasses[width]} h-full bg-astra-surface border-l border-astra-border shadow-2xl flex flex-col z-10 ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-astra-border bg-astra-raised/70">
          <div>
            <h3 id="slideover-title" className="font-display font-bold text-base text-astra-text tracking-wide">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-astra-muted font-sans mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-astra-muted hover:text-astra-text hover:bg-astra-border/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-astra-accent"
            aria-label="Close engineering drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};
