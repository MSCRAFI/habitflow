import React, { useState, useEffect } from 'react';
import { LinkLogo } from '../common/Logo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NatureNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  
  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Garden', icon: '🌱', protected: true },
    { path: '/habits', label: 'Habits', icon: '🎯', protected: true },
    { path: '/challenges', label: 'Challenges', icon: '🏆', protected: true },
    { path: '/social', label: 'Community', icon: '👥', protected: true }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`page-header desktop-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <LinkLogo 
              to="/" 
              variant="full"
              size="large"
              theme="nature"
              className="flex items-center gap-3 hover-grow"
            />

            {/* Desktop Navigation Items */}
            <div className="flex items-center gap-2">
              {navigationItems.map((item) => {
                if (item.protected && !user) return null;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="btn btn-ghost btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    <span>🌱</span>
                    Start Growing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-items">
          {navigationItems.map((item) => {
            if (item.protected && !user) return null;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="mobile-nav-icon">{item.icon}</div>
                <div className="mobile-nav-label">{item.label}</div>
              </Link>
            );
          })}
          
          {user && (
            <Link
              to="/profile"
              className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">👤</div>
              <div className="mobile-nav-label">Profile</div>
            </Link>
          )}
        </div>
      </nav>

      <style jsx>{`
        /* Desktop Navigation Styles */
        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2_5) var(--space-4);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: var(--font-medium);
          font-size: var(--text-sm);
          transition: all var(--duration-200) var(--ease-organic);
          position: relative;
          overflow: hidden;
        }

        .nav-link:hover {
          color: var(--color-primary-600);
          background: var(--color-primary-50);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: var(--color-primary-700);
          background: var(--color-primary-100);
          font-weight: var(--font-semibold);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-primary);
          border-radius: 0 0 var(--radius-base) var(--radius-base);
        }

        .nav-icon {
          font-size: var(--text-lg);
          line-height: 1;
        }

        .nav-label {
          line-height: 1;
        }

        /* Scrolled state */
        .page-header.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom-color: var(--border-secondary);
          box-shadow: var(--shadow-sm);
        }

        /* Mobile Navigation Enhancements */
        .mobile-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-primary);
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        }

        .mobile-nav-item {
          position: relative;
          transition: all var(--duration-200) var(--ease-organic);
        }

        .mobile-nav-item:hover {
          transform: translateY(-1px);
        }

        .mobile-nav-item.active::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: var(--gradient-primary);
          border-radius: 0 0 var(--radius-base) var(--radius-base);
        }

        .mobile-nav-icon {
          transition: transform var(--duration-200) var(--ease-organic);
        }

        .mobile-nav-item:hover .mobile-nav-icon {
          transform: scale(1.1);
        }

        .mobile-nav-item.active .mobile-nav-icon {
          animation: gentle-bounce var(--duration-500) var(--ease-organic);
        }

        /* Responsive behavior */
        @media (max-width: 767px) {
          .desktop-nav {
            display: none;
          }
        }

        @media (min-width: 768px) {
          .mobile-nav {
            display: none;
          }
        }

        /* Enhanced hover animations */
        @keyframes gentle-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-2px);
          }
          60% {
            transform: translateY(-1px);
          }
        }

        /* Focus states for accessibility */
        .nav-link:focus-visible,
        .mobile-nav-item:focus-visible {
          outline: 2px solid var(--border-focus);
          outline-offset: 2px;
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .nav-link.active,
          .mobile-nav-item.active {
            border: 2px solid var(--color-primary-600);
          }
        }
      `}</style>
    </>
  );
};

export default NatureNavbar;