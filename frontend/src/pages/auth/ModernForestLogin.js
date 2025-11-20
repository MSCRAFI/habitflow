import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ModernForestLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await login(formData.username, formData.password);
      if (result.success) {
        addNotification({
          type: 'success',
          message: 'Welcome back! Successfully signed in to your forest.'
        });
        
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Sign in failed. Please check your credentials and try again.'
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      addNotification({
        type: 'error',
        message: error.message || 'Something went wrong. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-visual">
          <div className="visual-content">
            <div className="growth-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
              <div className="ring ring-center"></div>
            </div>
            <h2 className="visual-title">Welcome Back to Your Forest</h2>
            <p className="visual-subtitle">
              Continue your habit-building journey and watch your personal growth flourish.
            </p>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">
              Enter your credentials to access your habit forest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your username or email"
                autoComplete="username"
                required
              />
              {errors.username && (
                <div className="form-error">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing In...
                </>
              ) : (
                'Sign In to Your Forest'
              )}
            </button>

            <div className="auth-divider">
              <span>New to HabitFlow?</span>
            </div>

            <Link to="/register" className="btn btn-secondary btn-full btn-lg">
              Create Your Forest
            </Link>
          </form>

          <div className="auth-footer">
            <p className="footer-text">
              Forgot your password? 
              <a href="#" className="footer-link">Reset it here</a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ===== AUTH CONTAINER ===== */
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--space-4);
          background: linear-gradient(135deg, var(--forest-50) 0%, var(--wood-50) 100%);
        }

        .auth-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: var(--bg-surface);
          border-radius: var(--radius-3xl);
          box-shadow: var(--shadow-2xl);
          overflow: hidden;
        }

        /* ===== VISUAL SECTION ===== */
        .auth-visual {
          background: var(--gradient-forest-primary);
          padding: var(--space-12);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-visual::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="forest-pattern" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23forest-pattern)"/></svg>');
          pointer-events: none;
        }

        .visual-content {
          text-align: center;
          color: #ffffff;
          position: relative;
          z-index: 1;
        }

        .growth-rings {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 0 auto var(--space-8);
        }

        .ring {
          position: absolute;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring-1 {
          width: 160px;
          height: 160px;
          animation: pulse-ring 4s ease-in-out infinite;
        }

        .ring-2 {
          width: 120px;
          height: 120px;
          animation: pulse-ring 4s ease-in-out infinite 1s;
        }

        .ring-3 {
          width: 80px;
          height: 80px;
          animation: pulse-ring 4s ease-in-out infinite 2s;
        }

        .ring-center {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes pulse-ring {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .visual-title {
          font-size: var(--text-3xl);
          font-weight: var(--font-weight-bold);
          margin: 0 0 var(--space-4) 0;
          line-height: var(--leading-tight);
          color: #ffffff;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .visual-subtitle {
          font-size: var(--text-base);
          color: #ffffff;
          opacity: 0.95;
          line-height: var(--leading-relaxed);
          margin: 0;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* ===== FORM SECTION ===== */
        .auth-form-container {
          padding: var(--space-12);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-10);
        }

        .auth-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0 0 var(--space-3) 0;
        }

        .auth-subtitle {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .auth-divider {
          text-align: center;
          position: relative;
          margin: var(--space-4) 0;
        }

        .auth-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-primary);
        }

        .auth-divider span {
          background: var(--bg-surface);
          padding: 0 var(--space-4);
          color: var(--text-muted);
          font-size: var(--text-sm);
        }

        .auth-footer {
          text-align: center;
          margin-top: var(--space-8);
        }

        .footer-text {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin: 0;
        }

        .footer-link {
          color: var(--forest-600);
          text-decoration: none;
          font-weight: var(--font-weight-medium);
          margin-left: var(--space-1);
        }

        .footer-link:hover {
          color: var(--forest-700);
          text-decoration: underline;
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1023px) {
          .auth-content {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .auth-visual {
            padding: var(--space-8);
            order: 2;
          }

          .auth-form-container {
            padding: var(--space-8);
            order: 1;
          }

          .growth-rings {
            width: 150px;
            height: 150px;
          }

          .ring-1 { width: 120px; height: 120px; }
          .ring-2 { width: 90px; height: 90px; }
          .ring-3 { width: 60px; height: 60px; }
          .ring-center { width: 30px; height: 30px; }

          .visual-title {
            font-size: var(--text-2xl);
          }
        }

        @media (max-width: 767px) {
          .auth-container {
            padding: var(--space-4);
          }

          .auth-content {
            border-radius: var(--radius-2xl);
          }

          .auth-visual {
            padding: var(--space-6);
          }

          .auth-form-container {
            padding: var(--space-6);
          }

          .auth-header {
            margin-bottom: var(--space-8);
          }

          .auth-title {
            font-size: var(--text-3xl);
          }

          .growth-rings {
            width: 120px;
            height: 120px;
            margin-bottom: var(--space-6);
          }

          .ring-1 { width: 100px; height: 100px; }
          .ring-2 { width: 75px; height: 75px; }
          .ring-3 { width: 50px; height: 50px; }
          .ring-center { width: 25px; height: 25px; }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .ring,
          .ring-center {
            animation: none;
          }
        }

        /* ===== HIGH CONTRAST MODE ===== */
        @media (prefers-contrast: high) {
          .auth-visual {
            background: var(--stone-900);
          }

          .ring {
            border-color: white;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernForestLogin;