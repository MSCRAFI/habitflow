import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

const Logo = ({ 
  variant = 'full', // 'full', 'icon', 'compact'
  size = 'medium', // 'small', 'medium', 'large'
  theme = 'auto', // 'auto', 'elegant', 'nature', 'forest', 'premium'
  className = '',
  showAnimation = false
}) => {
  
  // Size configurations
  const sizeConfig = {
    small: { icon: 24, text: '1rem', gap: '0.5rem' },
    medium: { icon: 32, text: '1.25rem', gap: '0.75rem' },
    large: { icon: 40, text: '1.5rem', gap: '1rem' }
  };
  
  const config = sizeConfig[size];
  
  // Theme-based colors (CSS custom properties for dynamic theming)
  const getThemeColors = () => {
    switch (theme) {
      case 'elegant':
        return {
          primary: 'var(--color-primary, #6366f1)',
          secondary: 'var(--color-secondary, #10b981)',
          text: 'var(--text-primary, #111827)'
        };
      case 'nature':
        return {
          primary: 'var(--color-primary-500, #22c55e)',
          secondary: 'var(--color-earth-500, #f9c23c)',
          text: 'var(--color-neutral-900, #1c1917)'
        };
      case 'forest':
        return {
          primary: 'var(--forest-500, #2d5a2d)',
          secondary: 'var(--amber-warm, #f59e0b)',
          text: 'var(--stone-900, #171717)'
        };
      case 'premium':
        return {
          primary: 'var(--color-primary-500, #0ea5e9)',
          secondary: 'var(--color-accent-emerald, #10b981)',
          text: 'var(--color-gray-900, #111827)'
        };
      default: // auto - uses CSS custom properties
        return {
          primary: 'currentColor',
          secondary: 'currentColor',
          text: 'currentColor'
        };
    }
  };
  
  const colors = getThemeColors();
  
  // Logo icon component
  const LogoIcon = () => (
    <svg 
      width={config.icon} 
      height={config.icon} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={showAnimation ? 'logo-icon-animated' : ''}
    >
      {/* Background circle */}
      <circle 
        cx="16" 
        cy="16" 
        r="15" 
        fill="none" 
        stroke={colors.primary}
        strokeWidth="1.5"
        opacity="0.2"
      />
      
      {/* Progress segments */}
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2"
        strokeDasharray="25.13 18.85" // 66% progress
        strokeDashoffset="-6.28"
        strokeLinecap="round"
        transform="rotate(-90 16 16)"
        className={showAnimation ? 'progress-ring' : ''}
      />
      
      {/* Growth indicator - stylized upward trend */}
      <path
        d="M9 20L13 16L17 18L23 12"
        stroke={colors.secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={showAnimation ? 'growth-line' : ''}
      />
      
      {/* Arrow tip */}
      <path
        d="M20 12L23 12L23 15"
        stroke={colors.secondary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={showAnimation ? 'growth-arrow' : ''}
      />
      
      {/* Central dot - represents the user/core */}
      <circle
        cx="16"
        cy="16"
        r="2"
        fill={colors.primary}
        className={showAnimation ? 'core-pulse' : ''}
      />
    </svg>
  );
  
  // Text component
  const LogoText = ({ compact = false }) => (
    <span 
      style={{ 
        fontSize: config.text, 
        fontWeight: '700',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: colors.text,
        letterSpacing: compact ? '0.01em' : '-0.01em'
      }}
      className="logo-text"
    >
      {compact ? 'HF' : 'HabitFlow'}
    </span>
  );
  
  // Render based on variant
  const renderLogo = () => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: config.gap,
      textDecoration: 'none',
      color: 'inherit'
    };
    
    switch (variant) {
      case 'icon':
        return <LogoIcon />;
      case 'compact':
        return (
          <div style={baseStyle} className={`logo-compact ${className}`}>
            <LogoIcon />
            <LogoText compact />
          </div>
        );
      case 'full':
      default:
        return (
          <div style={baseStyle} className={`logo-full ${className}`}>
            <LogoIcon />
            <LogoText />
          </div>
        );
    }
  };
  
  return renderLogo();
};

// LinkLogo component for navbar usage
export const LinkLogo = ({ 
  to = '/',
  variant = 'full',
  size = 'medium',
  theme = 'auto',
  showAnimation = false,
  className = '',
  ...props 
}) => {
  return (
    <Link 
      to={to} 
      className={`logo-link ${className}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      {...props}
    >
      <Logo 
        variant={variant}
        size={size}
        theme={theme}
        showAnimation={showAnimation}
      />
    </Link>
  );
};

export default Logo;