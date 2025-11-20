import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const NatureLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginAttemptedRef = useRef(false);

  const { login, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      loginAttemptedRef.current = false;
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    loginAttemptedRef.current = true;
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        showSuccess('Welcome back! 🌿');
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        showError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      showError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <section className="auth-hero nature-gradient">
        <div className="container">
          <div className="auth-card card card-nature animate-fade-in-up">
            <div className="card-header text-center">
              <div className="stat-icon animate-float">🌱</div>
              <h1 className="page-title">Welcome back</h1>
              <p className="page-subtitle">Tend to your habits and grow your garden</p>
            </div>

            <form onSubmit={handleSubmit} className="forest-form">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username or Email</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-with-action">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="spinner" style={{ width: 20, height: 20 }} />
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
              </div>

              <div className="form-footer text-center">
                <p className="body-small text-secondary">
                  Don't have an account?{' '}
                  <Link to="/register" className="form-link">Create one</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NatureLogin;
