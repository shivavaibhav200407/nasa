import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Skull, Activity } from 'lucide-react';

export type StatusTier = 'nominal' | 'warning' | 'critical' | 'deceased' | 'in_progress' | 'completed' | 'failed';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase();

  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <Activity className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
  let label = status;

  if (norm === 'nominal' || norm === 'alive' || norm === 'completed' || norm === 'resolved') {
    bg = 'bg-emerald-950/70 text-emerald-400 border-emerald-600/50';
    icon = <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    label = norm === 'alive' ? 'Nominal / Alive' : (norm === 'completed' ? 'Completed' : 'Nominal');
  } else if (norm === 'warning' || norm === 'in_progress' || norm === 'moderate') {
    bg = 'bg-amber-950/70 text-amber-400 border-amber-600/50';
    icon = <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    label = norm === 'in_progress' ? 'In Progress' : 'Warning';
  } else if (norm === 'critical' || norm === 'severe' || norm === 'failed') {
    bg = 'bg-rose-950/70 text-rose-400 border-rose-600/50';
    icon = <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    label = norm === 'failed' ? 'Mission Failed' : 'Critical';
  } else if (norm === 'deceased') {
    bg = 'bg-zinc-950 text-zinc-400 border-zinc-700';
    icon = <Skull className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    label = 'Deceased';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${bg} ${px}`}
      role="status"
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
