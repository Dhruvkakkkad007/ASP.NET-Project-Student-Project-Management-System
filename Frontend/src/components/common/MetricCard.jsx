import React from 'react';

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
    rose: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' }
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-panel glass-panel-interactive metric-card">
      <div
        className="metric-icon-box"
        style={{
          background: theme.bg,
          color: theme.text,
          border: `1px solid ${theme.border}`
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="metric-val">{value}</div>
        <div className="metric-lbl">{title}</div>
        {subtitle && <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  );
};
