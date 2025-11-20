import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const ModernForestRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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
        password_confirm: formData.confirmPassword
      });
      
      if (!result.success) {
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: result.error || 'Something went wrong. Please try again.'
        });
        return;
      }
      addNotification({
        type: 'success',
        title: 'Welcome to HabitFlow!',
        message: 'Your account has been created. Start planting your first habit seeds!'
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.message || 'Something went wrong. Please try again.'
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
      <div className="auth-content register">
        <div className="auth-visual">
          <div className="visual-content">
            <div className="seedling-growth">
              <div className="seed"></div>
              <div className="sprout"></div>
              <div className="leaves">
                <div className="leaf leaf-1"></div>
                <div className="leaf leaf-2"></div>
              </div>
            </div>
            <h2 className="visual-title">Plant Your First Seed</h2>
            <p className="visual-subtitle">
              Begin your journey of growth and transformation. Every great forest starts with a single seed.
            </p>
            <div className="benefits-list">
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>Track unlimited habits</span>
              </div>
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>Join a supportive community</span>
              </div>
              <div className="benefit">
                <div className="benefit-icon">✓</div>
                <span>Earn achievements & badges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Forest</h1>
            <p className="auth-subtitle">
              Start your habit-building journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a unique username"
                autoComplete="username"
                required
              />
              {errors.username && (
                <div className="form-error">{errors.username}</div>
              )}
              <div className="form-help">
                Your username will be visible to other community members
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
              {errors.email && (
                <div className="form-error">{errors.email}</div>
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
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}
              <div className="form-help">
                At least 8 characters with uppercase, lowercase, and number
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <div className="form-error">{errors.confirmPassword}</div>
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
                  Creating Your Forest...
                </>
              ) : (
                'Start Your Growth Journey'
              )}
            </button>

            <div className="terms-text">
              By creating an account, you agree to our{' '}
              <a href="#" className="terms-link">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </div>

            <div className="auth-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="btn btn-secondary btn-full btn-lg">
              Sign In to Your Forest
            </Link>
          </form>
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

        .auth-content.register {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1100px;
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

        /* Seedling Growth Animation */
        .seedling-growth {
          position: relative;
          width: 120px;
          height: 150px;
          margin: 0 auto var(--space-8);
        }

        .seed {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 8px;
          background: var(--wood-400);
          border-radius: 50%;
        }

        .sprout {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 60px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          animation: grow-sprout 3s ease-out infinite;
        }

        .leaves {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
        }

        .leaf {
          position: absolute;
          width: 20px;
          height: 30px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 50% 10% 50% 50%;
          opacity: 0;
          animation: grow-leaf 2s ease-out infinite;
        }

        .leaf-1 {
          transform: rotate(-20deg);
          left: -15px;
          animation-delay: 1s;
        }

        .leaf-2 {
          transform: rotate(20deg);
          right: -15px;
          animation-delay: 1.5s;
        }

        @keyframes grow-sprout {
          0%, 30% {
            height: 0;
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            height: 60px;
            opacity: 1;
          }
        }

        @keyframes grow-leaf {
          0%, 50% {
            transform: scale(0) rotate(var(--rotate, 0deg));
            opacity: 0;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(var(--rotate, 0deg));
            opacity: 0.8;
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
          margin: 0 0 var(--space-8) 0;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          text-align: left;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: #ffffff;
        }

        .benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          flex-shrink: 0;
          font-weight: var(--font-weight-bold);
          color: #ffffff;
        }

        /* ===== FORM SECTION ===== */
        .auth-form-container {
          padding: var(--space-12);
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-height: 100vh;
          overflow-y: auto;
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

        .terms-text {
          font-size: var(--text-xs);
          color: var(--text-muted);
          text-align: center;
          line-height: var(--leading-relaxed);
          margin: var(--space-4) 0;
        }

        .terms-link {
          color: var(--forest-600);
          text-decoration: none;
          font-weight: var(--font-weight-medium);
        }

        .terms-link:hover {
          color: var(--forest-700);
          text-decoration: underline;
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

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1199px) {
          .auth-content.register {
            max-width: 1000px;
          }

          .auth-form-container {
            padding: var(--space-10);
          }

          .auth-visual {
            padding: var(--space-10);
          }
        }

        @media (max-width: 1023px) {
          .auth-content.register {
            grid-template-columns: 1fr;
            max-width: 600px;
          }

          .auth-visual {
            padding: var(--space-8);
            order: 2;
          }

          .auth-form-container {
            padding: var(--space-8);
            order: 1;
          }

          .seedling-growth {
            width: 100px;
            height: 120px;
          }

          .visual-title {
            font-size: var(--text-2xl);
          }

          .benefits-list {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--space-4) var(--space-6);
          }

          .benefit {
            flex-basis: calc(50% - var(--space-3));
            min-width: 140px;
          }
        }

        @media (max-width: 767px) {
          .auth-container {
            padding: var(--space-4);
          }

          .auth-content.register {
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

          .seedling-growth {
            width: 80px;
            height: 100px;
            margin-bottom: var(--space-6);
          }

          .benefits-list {
            flex-direction: column;
            align-items: center;
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .sprout,
          .leaf {
            animation: none;
          }

          .leaf {
            opacity: 0.8;
          }
        }

        /* ===== HIGH CONTRAST MODE ===== */
        @media (prefers-contrast: high) {
          .auth-visual {
            background: var(--stone-900);
          }

          .benefit-icon {
            background: white;
            color: var(--stone-900);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernForestRegister;