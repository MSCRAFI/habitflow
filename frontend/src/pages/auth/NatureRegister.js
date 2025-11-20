import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const NatureRegister = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword
      });
      
      if (!result.success) {
        showError(result.error || 'Registration failed. Please try again.');
        return;
      }
      showSuccess('Welcome to HabitFlow! 🌿');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
      showError('Could not create account. Please try again.');
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
              <div className="stat-icon animate-float">🌿</div>
              <h1 className="page-title">Create your account</h1>
              <p className="page-subtitle">Start planting great habits today</p>
            </div>

            <form onSubmit={handleSubmit} className="forest-form">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="spinner" style={{ width: 20, height: 20 }} />
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
              </div>

              <div className="form-footer text-center">
                <p className="body-small text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="form-link">Sign in here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NatureRegister;
