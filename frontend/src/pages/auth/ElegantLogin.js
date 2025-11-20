import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ElegantLogin = () => {
  const { login } = useAuth();
  const { showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        showError(result.error || 'Invalid credentials. Please try again.');
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          showError(errorData.detail);
        } else if (errorData.non_field_errors) {
          showError(errorData.non_field_errors[0]);
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors[field] = errorData[field][0];
            } else {
              fieldErrors[field] = errorData[field];
            }
          });
          setErrors(fieldErrors);
        }
      } else if (error.message) {
        showError(error.message);
      } else {
        showError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)'
    }}>
      <div className="card card-elevated animate-scale-in" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-primary)',
        boxShadow: 'var(--shadow-2xl)'
      }}>
        <div className="card-header text-center" style={{ background: 'var(--bg-primary)' }}>
          <h1 className="card-title" style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-sm)'
          }}>
            <span style={{ marginRight: 'var(--space-sm)' }}>👋</span>
            Welcome Back
          </h1>
          <p className="card-subtitle">
            Sign in to continue your habit journey
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit} className="stagger-animation">
            <div className="form-group form-floating">
              <input
                type="text"
                className="form-input"
                placeholder=" "
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <label className="form-label">👤 Username or Email</label>
              {errors.username && (
                <div className="form-error">
                  <span>⚠️</span>
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group form-floating">
              <input
                type="password"
                className="form-input"
                placeholder=" "
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <label className="form-label">🔒 Password</label>
              {errors.password && (
                <div className="form-error">
                  <span>⚠️</span>
                  {errors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', position: 'relative' }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px' }} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <div className="card-footer text-center">
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)',
            margin: 0
          }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElegantLogin;