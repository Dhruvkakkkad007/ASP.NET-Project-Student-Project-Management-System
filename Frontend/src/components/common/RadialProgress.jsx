import React from 'react';

export const RadialProgress = ({ percentage = 0, size = 110, strokeWidth = 9, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine dynamic gradient color based on completion percentage
  const getColor = (pct) => {
    if (pct >= 80) return '#10b981'; // Emerald green
    if (pct >= 40) return '#6366f1'; // Indigo blue
    if (pct > 0) return '#f59e0b';  // Amber yellow
    return '#64748b';               // Slate gray
  };

  const progressColor = getColor(percentage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Circle Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Animated Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease'
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'var(--font-heading)', color: '#fff' }}>
            {percentage}%
          </span>
        </div>
      </div>
      {label && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '500' }}>{label}</span>}
    </div>
  );
};
