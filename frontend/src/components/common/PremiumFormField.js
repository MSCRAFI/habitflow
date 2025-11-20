import React, { useState, useEffect } from 'react';

const PremiumFormField = ({ 
  label, 
  name, 
  type = 'text', 
  value = '',
  onChange,
  placeholder, 
  icon, 
  showPasswordToggle = false,
  error = '',
  success = false,
  disabled = false,
  floating = false,
  required = false,
  autoComplete = 'off',
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    setHasValue(value && value.toString().length > 0);
  }, [value]);

  useEffect(() => {
    if (error) {
      setAnimationClass('validation-error');
      setTimeout(() => setAnimationClass(''), 500);
    } else if (success) {
      setAnimationClass('validation-success');
      setTimeout(() => setAnimationClass(''), 300);
    }
  }, [error, success]);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onChange && e.target.onFocus) {
      e.target.onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onChange && e.target.onBlur) {
      e.target.onBlur(e);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const isFloatingActive = floating && (isFocused || hasValue);

  return (
    <div className={`form-group ${floating ? 'form-floating' : ''} ${className}`}>
      {!floating && label && (
        <label 
          htmlFor={name} 
          className={`form-label ${isFocused ? 'label-focused' : ''}`}
          style={{
            color: isFocused ? 'var(--color-primary)' : 'var(--text-secondary)',
            transition: 'color var(--transition-base)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`form-input ${error ? 'error' : ''} ${success ? 'success' : ''} ${animationClass}`}
          placeholder={floating ? ' ' : placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          style={{
            paddingLeft: icon ? 'var(--space-12)' : 'var(--space-4)',
            paddingRight: showPasswordToggle ? 'var(--space-12)' : 'var(--space-4)',
            paddingTop: floating ? 'var(--space-6)' : 'var(--space-3)',
            borderColor: error 
              ? 'var(--color-error)' 
              : success 
                ? 'var(--color-success)' 
                : isFocused 
                  ? 'var(--border-focus)' 
                  : 'var(--border-primary)',
            boxShadow: isFocused && !error 
              ? `0 0 0 3px rgba(${error ? '239, 68, 68' : '5, 150, 105'}, 0.1)` 
              : 'none'
          }}
        />
        
        {floating && label && (
          <label 
            htmlFor={name}
            className="form-label"
            style={{
              position: 'absolute',
              top: isFloatingActive ? 'var(--space-2)' : 'var(--space-4)',
              left: 'var(--space-4)',
              fontSize: isFloatingActive ? 'var(--font-size-xs)' : 'var(--font-size-base)',
              color: isFloatingActive 
                ? (error ? 'var(--color-error)' : 'var(--color-primary)')
                : 'var(--text-muted)',
              transform: isFloatingActive ? 'translateY(-50%) scale(0.85)' : 'translateY(-50%)',
              transformOrigin: 'left top',
              transition: 'all var(--transition-base)',
              pointerEvents: 'none',
              backgroundColor: isFloatingActive ? 'var(--bg-primary)' : 'transparent',
              padding: isFloatingActive ? '0 var(--space-1)' : '0',
              zIndex: 1
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }}>*</span>}
          </label>
        )}

        {icon && (
          <div style={{
            position: 'absolute',
            left: 'var(--space-4)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isFocused ? 'var(--color-primary)' : 'var(--text-muted)',
            transition: 'color var(--transition-base)',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            {icon}
          </div>
        )}

        {showPasswordToggle && (
          <button
            type="button"
            onClick={togglePassword}
            className="password-toggle"
            style={{
              position: 'absolute',
              right: 'var(--space-4)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-base)',
              transition: 'all var(--transition-base)',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--text-primary)';
              e.target.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--text-muted)';
              e.target.style.backgroundColor = 'transparent';
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {(success && !error) && (
          <div style={{
            position: 'absolute',
            right: showPasswordToggle ? 'var(--space-12)' : 'var(--space-4)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-success)',
            pointerEvents: 'none'
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <div 
          className="form-error animate-slide-in-top"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-error)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      {success && !error && (
        <div 
          className="form-success animate-slide-in-top"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-success)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Field is valid
        </div>
      )}
    </div>
  );
};

export default React.memo(PremiumFormField);