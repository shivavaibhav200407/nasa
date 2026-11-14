import React from 'react';

export interface ArcGaugeProps {
  value: number; // 0 to 100
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  status?: 'NOMINAL' | 'CAUTION' | 'CRITICAL';
  size?: number; // width/height in px
  strokeWidth?: number;
  showTicks?: boolean;
  className?: string;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  unit = '%',
  status,
  size = 110,
  strokeWidth = 9,
  showTicks = true,
  className = '',
}) => {
  // Normalize value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Determine status color if not explicitly provided
  const computedStatus =
    status ||
    (percentage < 25 ? 'CRITICAL' : percentage < 50 ? 'CAUTION' : 'NOMINAL');

  const statusColor =
    computedStatus === 'CRITICAL'
      ? '#FF5C6C'
      : computedStatus === 'CAUTION'
      ? '#FFB84D'
      : '#3DDC97';

  // Arc geometry: 240 degree gauge arc (-210 deg to +30 deg)
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  // Circumference of full circle
  const circumference = 2 * Math.PI * radius;
  // Arc angle is 240 degrees out of 360 = 2/3 of circle
  const arcLength = (240 / 360) * circumference;
  const dashOffset = arcLength - (percentage / 100) * arcLength;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={`${Math.round(clampedValue)}${unit} (${computedStatus})`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[210deg] origin-center"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1E2B45"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease',
            filter: `drop-shadow(0 0 6px ${statusColor}66)`,
          }}
        />

        {/* Optional threshold marker tick at 25% (critical) */}
        {showTicks && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#FF5C6C"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`2 ${circumference}`}
            strokeDashoffset={arcLength - 0.25 * arcLength}
            strokeLinecap="butt"
            opacity={0.8}
          />
        )}
      </svg>

      {/* Center readout overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none pointer-events-none">
        <div className="font-mono font-bold text-astra-text tracking-tighter text-sm flex items-baseline">
          <span>{clampedValue % 1 === 0 ? clampedValue : clampedValue.toFixed(1)}</span>
          <span className="text-[10px] text-astra-muted ml-0.5 font-normal">{unit}</span>
        </div>
        <div className="text-[9px] uppercase tracking-wider font-mono text-astra-muted truncate max-w-[75px] text-center">
          {label}
        </div>
      </div>
    </div>
  );
};
