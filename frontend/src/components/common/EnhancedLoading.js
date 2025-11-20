import React from 'react';

const EnhancedLoading = ({ 
  variant = 'spinner', 
  size = 'md', 
  label = 'Loading...', 
  fullScreen = false,
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: { width: '16px', height: '16px' },
    md: { width: '24px', height: '24px' },
    lg: { width: '32px', height: '32px' },
    xl: { width: '48px', height: '48px' }
  };

  const LoadingSpinner = () => (
    <div 
      className={`animate-spin`}
      style={{
        ...sizeClasses[size],
        border: '3px solid var(--bg-tertiary)',
        borderTop: `3px solid var(--color-${color})`,
        borderRadius: '50%'
      }}
    />
  );

  const LoadingDots = () => (
    <div className="loading-dots">
      <span style={{ backgroundColor: `var(--color-${color})` }}></span>
      <span style={{ backgroundColor: `var(--color-${color})` }}></span>
      <span style={{ backgroundColor: `var(--color-${color})` }}></span>
    </div>
  );

  const LoadingPulse = () => (
    <div 
      className="animate-pulse"
      style={{
        ...sizeClasses[size],
        backgroundColor: `var(--color-${color})`,
        borderRadius: '50%'
      }}
    />
  );

  const LoadingBar = () => (
    <div className="loading-bar" style={{ width: size === 'sm' ? '60px' : size === 'lg' ? '120px' : '80px' }}>
    </div>
  );

  const LoadingSkeleton = () => (
    <div 
      className="loading-skeleton"
      style={{
        width: '100%',
        height: sizeClasses[size].height,
        borderRadius: 'var(--radius-md)'
      }}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      case 'bar':
        return <LoadingBar />;
      case 'skeleton':
        return <LoadingSkeleton />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div 
      className="loading-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)'
      }}
      role="status" 
      aria-live="polite" 
      aria-busy="true"
    >
      {renderLoader()}
      {label && (
        <span 
          className="loading-label"
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          {label}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-overlay)',
        zIndex: 'var(--z-modal)',
        backdropFilter: 'blur(4px)'
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default React.memo(EnhancedLoading);