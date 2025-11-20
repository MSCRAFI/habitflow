import React from 'react';

/**
 * Small metric card: label + value (+ optional trend). Keep it purely presentational.
 */
const StatCard = ({ label, value, trend = null, icon = null }) => {
  return (
    <div className="stat-card card" aria-label={`${label} ${value}`}>
      <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {icon && <div aria-hidden>{icon}</div>}
        <div style={{ flex: 1 }}>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{label}</div>
          <div className="text-xl" style={{ fontWeight: 700 }}>{value}</div>
        </div>
        {trend && (
          <div className={`stat-trend ${trend.value >= 0 ? 'up' : 'down'}`} title={`${trend.value >= 0 ? '+' : ''}${trend.value}% vs ${trend.window}`}>
            <span style={{ color: trend.value >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
              {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(StatCard);
