import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeSelector from '../ThemeSelector';
import { LinkLogo } from '../common/Logo';

const PremiumNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
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

  return (
    <>
      <nav className="navbar-premium">
        <div className="navbar-premium-container">
          <LinkLogo 
            to="/" 
            variant="full"
            size="medium"
            theme="premium"
            className="navbar-premium-brand"
          />
          
          {/* Desktop Navigation */}
          <div className="navbar-premium-nav hidden-mobile">
            {user ? (
              <>
                <Link to="/dashboard" className="navbar-premium-link">Dashboard</Link>
                <Link to="/habits" className="navbar-premium-link">Habits</Link>
                <Link to="/social" className="navbar-premium-link">Social</Link>
                <Link to="/challenges" className="navbar-premium-link">Challenges</Link>
                <Link to="/profile" className="navbar-premium-link">Profile</Link>
                <ThemeSelector />
                <button 
                  onClick={handleLogout}
                  className="btn-premium btn-premium-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-premium-link">Sign In</Link>
                <Link to="/register" className="btn-premium btn-premium-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
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
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <LinkLogo 
            to="/" 
            variant="full"
            size="large"
            theme="premium"
            className="navbar-premium-brand"
            onClick={closeMobileMenu}
          />
        </div>
        
        {user ? (
          <>
            <Link to="/dashboard" className="mobile-menu-link" onClick={closeMobileMenu}>Dashboard</Link>
            <Link to="/habits" className="mobile-menu-link" onClick={closeMobileMenu}>My Habits</Link>
            <Link to="/social" className="mobile-menu-link" onClick={closeMobileMenu}>Social Feed</Link>
            <Link to="/challenges" className="mobile-menu-link" onClick={closeMobileMenu}>Challenges</Link>
            <Link to="/profile" className="mobile-menu-link" onClick={closeMobileMenu}>Profile</Link>
            <div style={{ margin: '2rem 0' }}>
              <ThemeSelector />
            </div>
            <button 
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              className="btn-premium btn-premium-secondary"
              style={{ marginTop: '1rem' }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-menu-link" onClick={closeMobileMenu}>Sign In</Link>
            <Link 
              to="/register" 
              className="btn-premium btn-premium-primary" 
              onClick={closeMobileMenu}
              style={{ marginTop: '1rem' }}
            >
              Get Started Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            opacity: mobileMenuOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default PremiumNavbar;