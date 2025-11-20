import React from 'react';

const EmptyState = ({
  icon = '🌱',
  title = 'Nothing here yet',
  description = 'Start by creating your first item.',
  action = null,
}) => {
  return (
    <div className="card text-center" style={{ padding: 'var(--space-3xl)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>{icon}</div>
      <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2xl)', maxWidth: '480px', margin: '0 auto var(--space-2xl)' }}>
        {description}
      </p>
      {action}
    </div>
  );
};

export default React.memo(EmptyState);
