import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../styles/premium-design-system.css';
import '../../styles/premium-components.css';
import '../../styles/premium-mobile.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginAttemptedRef = useRef(false);
  
  const { login, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      loginAttemptedRef.current = false;
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    loginAttemptedRef.current = true;

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        showSuccess('Welcome back! Redirecting to your dashboard...');
        // Don't manually navigate - let the useEffect handle it when isAuthenticated changes
      } else {
        showError(result.error || 'Invalid credentials. Please try again.');
        loginAttemptedRef.current = false;
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Something went wrong. Please try again.');
      loginAttemptedRef.current = false;
    } finally {
      setIsLoading(false);
    }
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

      <div className="form-premium animate-scale-in" style={{position: 'relative', zIndex: 5}}>
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
          <h1 className="form-title">Welcome back</h1>
          <p className="form-subtitle">
            Sign in to continue building your habits
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{width: '100%'}}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <div style={{position: 'relative'}}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
                placeholder="Enter your username or email"
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
                className="form-input"
                required
                disabled={isLoading}
                placeholder="Enter your password"
                autoComplete="current-password"
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
                Signing in...
              </>
            ) : (
              <>
                Sign In
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
            Don't have an account?{' '}
            <Link to="/register" className="form-link">
              Create one here
            </Link>
          </p>
        </div>

        {/* Trust indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-8)',
          marginTop: 'var(--space-6)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--color-gray-200)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)'
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Login
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)'
          }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy Protected
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;