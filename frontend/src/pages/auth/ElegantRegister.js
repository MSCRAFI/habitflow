import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ElegantRegister = () => {
  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side validation
    const newErrors = {};
    
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      showSuccess('Account created successfully! Welcome to HabitFlow!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
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
          setErrors({ ...errors, ...fieldErrors });
        }
      } else if (error.message) {
        showError(error.message);
      } else {
        showError('An error occurred during registration. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
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
            <span style={{ marginRight: 'var(--space-sm)' }}>🚀</span>
            Join HabitFlow
          </h1>
          <p className="card-subtitle">
            Start your habit-building journey today
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
                onChange={(e) => handleInputChange('username', e.target.value)}
                required
              />
              <label className="form-label">👤 Username</label>
              {errors.username && (
                <div className="form-error">
                  <span>⚠️</span>
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group form-floating">
              <input
                type="email"
                className="form-input"
                placeholder=" "
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              <label className="form-label">📧 Email</label>
              {errors.email && (
                <div className="form-error">
                  <span>⚠️</span>
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group form-floating">
              <input
                type="password"
                className="form-input"
                placeholder=" "
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
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

            <div className="form-group form-floating">
              <input
                type="password"
                className="form-input"
                placeholder=" "
                value={formData.password_confirm}
                onChange={(e) => handleInputChange('password_confirm', e.target.value)}
                required
              />
              <label className="form-label">🔒 Confirm Password</label>
              {errors.password_confirm && (
                <div className="form-error">
                  <span>⚠️</span>
                  {errors.password_confirm}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  Create Account
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
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-medium)'
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElegantRegister;