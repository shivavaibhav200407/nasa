import React from 'react';
import { StatusBadge } from './StatusBadge';
import { Heart, Activity, Radio, AlertCircle } from 'lucide-react';
import type { CrewMember } from '../../types/mission';

export interface CrewCardProps {
  member: CrewMember;
  onSelect?: () => void;
  selected?: boolean;
  className?: string;
}

// Geometric vector astronaut helmet avatar generator per role
const CrewHelmetAvatar: React.FC<{ role: string; accentColor: string }> = ({
  role,
  accentColor,
}) => {
  // Generate distinct visor hue & pattern based on role
  const getRoleDesign = () => {
    switch (role.toLowerCase()) {
      case 'commander':
        return {
          visorGradient: 'from-amber-400/40 via-yellow-200/20 to-transparent',
          accent: '#FFB84D',
        };
      case 'geologist':
        return {
          visorGradient: 'from-emerald-400/40 via-teal-200/20 to-transparent',
          accent: '#3DDC97',
        };
      case 'engineer':
        return {
          visorGradient: 'from-sky-400/40 via-cyan-200/20 to-transparent',
          accent: '#4FD1FF',
        };
      default: // Medical / Science
        return {
          visorGradient: 'from-purple-400/40 via-pink-200/20 to-transparent',
          accent: '#A78BFA',
        };
    }
  };

  const design = getRoleDesign();

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Outer Helmet Ring */}
      <circle cx="22" cy="22" r="20" fill="#0E1728" stroke="#1E2B45" strokeWidth="2" />

      {/* Neck Collar */}
      <rect x="14" y="37" width="16" height="5" rx="2" fill="#1E2B45" />

      {/* Helmet Shell Contour */}
      <path
        d="M9 22C9 14.8203 14.8203 9 22 9C29.1797 9 35 14.8203 35 22C35 28.5 30 34 22 34C14 34 9 28.5 9 22Z"
        fill="#111B2E"
        stroke="#2A3C5E"
        strokeWidth="1.5"
      />

      {/* Visor */}
      <path
        d="M12 21C12 16.5 16.5 13 22 13C27.5 13 32 16.5 32 21C32 25.5 27.5 28.5 22 28.5C16.5 28.5 12 25.5 12 21Z"
        fill="#070C15"
        stroke={accentColor}
        strokeWidth="1.5"
      />

      {/* Visor Glare / Specular highlight */}
      <path
        d="M15 17C17 14.5 20 14 22 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Audio comms mic dot */}
      <circle cx="27" cy="27" r="1.5" fill={design.accent} />
    </svg>
  );
};

export const CrewCard: React.FC<CrewCardProps> = ({
  member,
  onSelect,
  selected = false,
  className = '',
}) => {
  const isAlive = member.survival_status !== 'DECEASED';
  const isCritical = !isAlive || member.health < 30 || member.stress > 80;
  const isCaution =
    member.health < 60 || member.stress > 50 || member.cumulative_radiation > 50;
  const overallStatus = !isAlive
    ? 'CRITICAL'
    : isCritical
    ? 'CRITICAL'
    : isCaution
    ? 'CAUTION'
    : 'NOMINAL';

  const accentColor =
    member.role.toLowerCase() === 'commander'
      ? '#FFB84D'
      : member.role.toLowerCase() === 'geologist'
      ? '#3DDC97'
      : member.role.toLowerCase() === 'engineer'
      ? '#4FD1FF'
      : '#A78BFA';

  return (
    <div
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={`p-3 rounded-xl bg-astra-surface/90 border transition-all duration-200 ${
        selected
          ? 'border-astra-accent shadow-glow-accent ring-1 ring-astra-accent'
          : !isAlive
          ? 'border-astra-critical/50 opacity-60 bg-astra-bg/80'
          : isCritical
          ? 'border-astra-critical/40 hover:border-astra-critical'
          : 'border-astra-border hover:border-astra-border-light'
      } ${onSelect ? 'cursor-pointer' : ''} ${className}`}
      aria-label={`Astronaut ${member.name}, Role: ${member.role}, Health: ${member.health}%, Stress: ${member.stress}%`}
    >
      {/* Top Header: Avatar + Name + Status */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <CrewHelmetAvatar role={member.role} accentColor={accentColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-display font-semibold text-xs text-astra-text truncate">
              {member.name}
            </h4>
            <StatusBadge
              status={overallStatus}
              label={!isAlive ? 'DECEASED' : overallStatus}
              size="sm"
            />
          </div>
          <p className="text-[10px] uppercase font-mono text-astra-muted tracking-wider">
            {member.role}
          </p>
        </div>
      </div>

      {/* Biotelemetry Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-astra-border/60">
        {/* Health */}
        <div className="flex items-center justify-between bg-astra-bg/60 px-2 py-1 rounded">
          <span className="text-astra-muted flex items-center gap-1">
            <Heart size={10} className="text-astra-critical" />
            Vitals
          </span>
          <span
            className={`font-bold ${
              member.health < 35
                ? 'text-astra-critical animate-pulse'
                : member.health < 65
                ? 'text-astra-caution'
                : 'text-astra-nominal'
            }`}
          >
            {Math.round(member.health)}%
          </span>
        </div>

        {/* Stress */}
        <div className="flex items-center justify-between bg-astra-bg/60 px-2 py-1 rounded">
          <span className="text-astra-muted flex items-center gap-1">
            <Activity size={10} className="text-astra-accent" />
            Stress
          </span>
          <span
            className={`font-bold ${
              member.stress > 70
                ? 'text-astra-critical animate-pulse'
                : member.stress > 45
                ? 'text-astra-caution'
                : 'text-astra-text'
            }`}
          >
            {Math.round(member.stress)}%
          </span>
        </div>

        {/* Radiation */}
        <div className="flex items-center justify-between bg-astra-bg/60 px-2 py-1 rounded">
          <span className="text-astra-muted flex items-center gap-1">
            <Radio size={10} className="text-astra-caution" />
            Rad
          </span>
          <span
            className={`font-bold ${
              member.cumulative_radiation > 70
                ? 'text-astra-critical'
                : member.cumulative_radiation > 35
                ? 'text-astra-caution'
                : 'text-astra-muted'
            }`}
          >
            {member.cumulative_radiation.toFixed(1)} mSv
          </span>
        </div>

        {/* Active Status note */}
        <div className="flex items-center justify-between bg-astra-bg/60 px-2 py-1 rounded">
          <span className="text-astra-muted flex items-center gap-1">
            <AlertCircle size={10} className="text-astra-dim" />
            State
          </span>
          <span className="text-astra-text truncate max-w-[50px] capitalize">
            {member.survival_status.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
