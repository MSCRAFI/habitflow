import React, { useState, useRef, useEffect } from 'react';

const PremiumButton = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ripple = true,
  glow = false,
  gradient = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const sizeClasses = {
    xs: { padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-xs)' },
    sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-sm)' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-base)' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--font-size-lg)' },
    xl: { padding: 'var(--space-5) var(--space-10)', fontSize: 'var(--font-size-xl)' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: gradient 
        ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
        : 'var(--color-primary)',
      color: 'var(--text-inverse)',
      border: '2px solid var(--color-primary)',
      '--hover-bg': 'var(--color-primary-dark)',
      '--hover-border': 'var(--color-primary-dark)'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
      '--hover-bg': 'var(--color-primary)',
      '--hover-color': 'var(--text-inverse)'
    },
    tertiary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '2px solid var(--border-primary)',
      '--hover-bg': 'var(--bg-tertiary)',
      '--hover-border': 'var(--border-hover)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '2px solid transparent',
      '--hover-bg': 'var(--bg-hover)'
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--text-inverse)',
      border: '2px solid var(--color-error)',
      '--hover-bg': 'var(--error-600)',
      '--hover-border': 'var(--error-600)'
    }
  };

  const createRipple = (event) => {
    if (!ripple || disabled || loading) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event) => {
    if (disabled || loading) return;
    
    createRipple(event);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) {
      onClick(event);
    }
  };

  const buttonStyles = {
    ...sizeClasses[size],
    ...variantStyles[variant],
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    fontWeight: 'var(--font-weight-medium)',
    borderRadius: 'var(--radius-lg)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    overflow: 'hidden',
    userSelect: 'none',
    textDecoration: 'none',
    transform: isPressed ? 'translateY(1px) scale(0.98)' : 'translateY(0) scale(1)',
    opacity: disabled ? 0.5 : 1,
    background: gradient ? variantStyles[variant].backgroundColor : variantStyles[variant].backgroundColor,
    backgroundSize: gradient ? '200% 200%' : 'auto',
    animation: gradient ? 'gradientShift 3s ease infinite' : 'none'
  };

  const glowStyles = glow && !disabled && !loading ? {
    boxShadow: `
      0 0 20px rgba(var(--color-primary-rgb, 5, 150, 105), 0.4),
      0 0 40px rgba(var(--color-primary-rgb, 5, 150, 105), 0.2),
      0 0 60px rgba(var(--color-primary-rgb, 5, 150, 105), 0.1)
    `,
    animation: 'var(--animation-glow)'
  } : {};

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`btn-premium ${className}`}
      style={{
        ...buttonStyles,
        ...glowStyles
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = variantStyles[variant]['--hover-bg'];
          e.target.style.borderColor = variantStyles[variant]['--hover-border'];
          e.target.style.color = variantStyles[variant]['--hover-color'] || variantStyles[variant].color;
          e.target.style.transform = 'translateY(-2px) scale(1.02)';
          e.target.style.boxShadow = 'var(--shadow-lg)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = variantStyles[variant].backgroundColor;
          e.target.style.borderColor = variantStyles[variant].border.split(' ')[2];
          e.target.style.color = variantStyles[variant].color;
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = glow ? glowStyles.boxShadow : 'none';
        }
      }}
      {...props}
    >
      {/* Shimmer Effect */}
      {!disabled && !loading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left var(--transition-slow)',
            pointerEvents: 'none'
          }}
          className="btn-shimmer"
        />
      )}

      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Content */}
      <span 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
          </>
        )}
      </span>
    </button>
  );
};

export default React.memo(PremiumButton);