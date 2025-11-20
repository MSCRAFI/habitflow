import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../styles/premium-design-system.css';
import '../../styles/premium-components.css';
import '../../styles/premium-mobile.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});
  
  const { register, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validatePassword = (password) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    return strength >= 3;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validate password strength
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with mixed case, numbers, and special characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      });
      
      if (result.success) {
        showSuccess('Account created successfully! Welcome to HabitFlow!');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      showError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'var(--color-accent-rose)';
    if (passwordStrength <= 3) return 'var(--color-accent-amber)';
    return 'var(--color-accent-emerald)';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-hero)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("data:image/svg+xml,<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><g fill='%23f1f5f9' fill-opacity='0.4'><circle cx='30' cy='30' r='1.5'/></g></svg>")`,
        opacity: 0.6
      }} />

      {/* Back to Home */}
      <Link 
        to="/" 
        style={{
          position: 'absolute',
          top: 'var(--space-6)',
          left: 'var(--space-6)',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'color var(--duration-200) var(--ease-premium)',
          zIndex: 10
        }}
        onMouseOver={(e) => e.target.style.color = 'var(--color-primary-600)'}
        onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      <div className="form-premium animate-scale-in" style={{position: 'relative', zIndex: 5, maxWidth: '500px'}}>
        <div className="form-header">
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--bg-gradient-primary)',
            borderRadius: 'var(--radius-2xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)',
            color: 'white',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            H
          </div>
          <h1 className="form-title">Create your account</h1>
          <p className="form-subtitle">
            Start building better habits today
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <div style={{position: 'relative'}}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                required
                disabled={isLoading}
                placeholder="Choose a unique username"
                autoComplete="username"
                style={{paddingLeft: 'var(--space-12)'}}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div style={{position: 'relative'}}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                required
                disabled={isLoading}
                placeholder="Enter your email address"
                autoComplete="email"
                style={{paddingLeft: 'var(--space-12)'}}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div style={{position: 'relative'}}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                required
                disabled={isLoading}
                placeholder="Create a strong password"
                autoComplete="new-password"
                style={{paddingLeft: 'var(--space-12)', paddingRight: 'var(--space-12)'}}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'var(--space-4)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)'
                }}
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
            </div>
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{marginTop: 'var(--space-2)'}}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-1)'
                }}>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-tertiary)'
                  }}>
                    Password strength:
                  </span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: getPasswordStrengthColor()
                  }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--color-gray-200)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    height: '100%',
                    background: getPasswordStrengthColor(),
                    transition: 'all var(--duration-300) var(--ease-premium)'
                  }} />
                </div>
              </div>
            )}
            
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div style={{position: 'relative'}}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                required
                disabled={isLoading}
                placeholder="Confirm your password"
                autoComplete="new-password"
                style={{paddingLeft: 'var(--space-12)'}}
              />
              <div style={{
                position: 'absolute',
                left: 'var(--space-4)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isLoading}
            style={{width: '100%', marginBottom: 'var(--space-4)'}}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" style={{width: '20px', height: '20px'}} />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="form-footer">
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Already have an account?{' '}
            <Link to="/login" className="form-link">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Terms & Privacy */}
        <div style={{
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--color-gray-200)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-tertiary)',
          textAlign: 'center',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="form-link">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="form-link">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;