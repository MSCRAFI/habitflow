import React from 'react';

/**
 * Lightweight loading spinner used for inline and small loading states.
 * Prefer EnhancedLoading for full-screen or specialized loaders.
 */
const LoadingSpinner = ({ size = 20, color = 'var(--color-primary-500)', label = 'Loading' }) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <div className="hf-spinner" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        style={{
          width: dimension,
          height: dimension,
          border: '2px solid var(--bg-tertiary)',
          borderTopColor: color,
          display: 'inline-block',
          borderRadius: '50%',
          animation: 'hf-spin 0.9s linear infinite'
        }}
      />
      <style>{`@keyframes hf-spin { from { transform: rotate(0)} to { transform: rotate(360deg)} }`}</style>
    </div>
  );
};

export default React.memo(LoadingSpinner);
