import React, { useState, useRef, useEffect } from 'react';
import { LinkLogo } from '../common/Logo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSelector from '../ThemeSelector';

const ElegantNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const getUserInitial = () => {
    if (user?.first_name) return user.first_name[0].toUpperCase();
    if (user?.username) return user.username[0].toUpperCase();
    return 'U';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Brand */}
          <LinkLogo 
            to="/" 
            variant="full"
            size="medium"
            theme="elegant"
            className="navbar-brand"
          />

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/habits" 
                  className={`navbar-link ${isActive('/habits') ? 'active' : ''}`}
                >
                  Habits
                </Link>
                <Link 
                  to="/social" 
                  className={`navbar-link ${isActive('/social') ? 'active' : ''}`}
                >
                  Social
                </Link>
                <Link 
                  to="/challenges" 
                  className={`navbar-link ${isActive('/challenges') ? 'active' : ''}`}
                >
                  Challenges
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                >
                  Home
                </Link>
                <Link 
                  to="/theme-demo" 
                  className={`navbar-link ${isActive('/theme-demo') ? 'active' : ''}`}
                >
                  Features
                </Link>
              </>
            )}
          </div>

          {/* Actions */}
          <div style={{ marginRight: 'var(--space-md)' }} className="hidden-mobile">
            <ThemeSelector compact={true} />
          </div>
          <div className="navbar-actions">
            {user ? (
              <div className="user-menu" ref={userMenuRef}>
                <button 
                  className="user-menu-button"
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {getUserInitial()}
                  </div>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                <div className={`user-menu-dropdown ${userMenuOpen ? 'open' : ''}`}>
                  <Link to="/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </Link>
                  <div className="user-menu-divider"></div>
                  <button 
                    className="user-menu-item" 
                    onClick={handleLogout}
                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-nav">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`mobile-menu-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/habits" 
                className={`mobile-menu-link ${isActive('/habits') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                ✅ My Habits
              </Link>
              <Link 
                to="/social" 
                className={`mobile-menu-link ${isActive('/social') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                👥 Social
              </Link>
              <Link 
                to="/challenges" 
                className={`mobile-menu-link ${isActive('/challenges') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                🏆 Challenges
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-menu-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                👤 Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                className={`mobile-menu-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                🏠 Home
              </Link>
              <Link 
                to="/theme-demo" 
                className={`mobile-menu-link ${isActive('/theme-demo') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                ✨ Features
              </Link>
            </>
          )}
        </div>

        <div className="mobile-menu-actions">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <ThemeSelector />
          </div>
          {user ? (
            <button 
              className="btn btn-ghost"
              onClick={() => { handleLogout(); closeMobileMenu(); }}
            >
              Sign Out
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-ghost"
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
                onClick={closeMobileMenu}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default ElegantNavbar;