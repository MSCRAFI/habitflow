import React, { useState, useEffect } from 'react';
import { LinkLogo } from '../common/Logo';

// ModernForestNavbar: responsive, authenticated navigation bar.
// - Desktop: full nav + user menu
// - Mobile: menu toggle + bottom bar
// No data fetching; relies on AuthContext for session state.
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Modern, professional icons using Unicode symbols (minimal approach)
const Icons = {
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/></svg>,
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>,
  Habits: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>,
  Challenges: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  Community: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.97l-2.49 3.2-2.49-3.2A2.5 2.5 0 0 0 8 8H5.46c-.8 0-1.5.54-1.42 1.37L6.5 16H9v6h2v-6h2v6h2z"/></svg>,
  Profile: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>,
  Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
};

const ModernForestNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Subtle visual polish: elevate navbar on scroll for depth
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
    { path: '/dashboard', label: 'Home', Icon: Icons.Home, protected: true },
    { path: '/forest', label: 'Forest', Icon: Icons.Dashboard, protected: true },
    { path: '/habits', label: 'Habits', Icon: Icons.Habits, protected: true },
    { path: '/challenges', label: 'Challenges', Icon: Icons.Challenges, protected: true },
    { path: '/social', label: 'Community', Icon: Icons.Community, protected: true }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`modern-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-content">
            {/* Mobile App Header - Only visible on mobile */}
            <div className="mobile-app-header">
              <h1 className="app-name">HabitFlow</h1>
              <span className="app-tagline">Grow Your Habits</span>
            </div>

            {/* Mobile Logo Icon - Only visible on mobile */}
            <LinkLogo 
              to="/" 
              variant="icon"
              size="medium"
              theme="forest"
              className="mobile-logo-icon"
            />

            {/* Logo */}
            <LinkLogo 
              to="/" 
              variant="full"
              size="large"
              theme="forest"
              className="navbar-logo"
            />

            {/* Desktop Navigation Items */}
            <div className="navbar-nav">
              {navigationItems.map((item) => {
                if (item.protected && !user) return null;
                
                const { Icon } = item;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="navbar-actions">
              {user ? (
                <div className="user-menu">
                  <Link 
                    to="/profile" 
                    className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                  >
                    <Icons.Profile />
                    <span>Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    <Icons.Logout />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-actions">
                  <Link to="/login" className="btn btn-ghost btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Start Growing
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {/* Navigation Items */}
            <div className="mobile-nav-items">
              {navigationItems.map((item) => {
                if (item.protected && !user) return null;
                
                const { Icon } = item;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {user && (
                <Link
                  to="/profile"
                  className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  <Icons.Profile />
                  <span>Profile</span>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="mobile-actions">
              {user ? (
                <button onClick={handleLogout} className="btn btn-ghost btn-full">
                  <Icons.Logout />
                  Logout
                </button>
              ) : (
                <div className="mobile-auth-actions">
                  <Link to="/login" className="btn btn-ghost btn-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-full">
                    Start Growing
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation (Alternative) */}
      <nav className="mobile-bottom-nav">
        <div className="bottom-nav-items">
          {/* Mobile bottom nav prioritizes Community over Challenges for better UX */}
          {navigationItems.filter((item, index) => 
            index < 3 || item.label === 'Community' // Take first 3 items (Home, Forest, Habits) + Community
          ).map((item) => {
            if (item.protected && !user) return null;
            
            const { Icon } = item;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {user && (
            <Link
              to="/profile"
              className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
            >
              <Icons.Profile />
              <span>Profile</span>
            </Link>
          )}
        </div>
      </nav>

      <style jsx>{`
        /* ===== MODERN NAVBAR STYLES ===== */
        .modern-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-primary);
          transition: all var(--duration-300) var(--ease-out);
        }

        .modern-navbar.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom-color: var(--border-secondary);
          box-shadow: var(--shadow-sm);
        }

        .navbar-content {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          height: 72px;
          gap: var(--space-6);
          max-width: 1200px;
          width: 100%;
        }

        /* ===== MOBILE APP HEADER ===== */
        .mobile-app-header {
          display: none;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-1);
          margin: 0;
          padding: 0;
        }

        /* ===== MOBILE LOGO ICON ===== */
        .mobile-logo-icon {
          display: none;
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 36px;
          height: 36px;
          transition: all var(--duration-200) var(--ease-out);
        }

        .mobile-logo-icon:hover {
          transform: translateY(-50%) scale(1.05);
        }

        .app-name {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-bold);
          color: var(--forest-700);
          margin: 0;
          line-height: var(--leading-tight);
          letter-spacing: -0.025em;
          background: var(--gradient-forest-primary);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .app-tagline {
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          color: var(--text-muted);
          line-height: 1;
          letter-spacing: 0.025em;
          text-transform: uppercase;
        }

        /* ===== LOGO SECTION ===== */
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
          color: var(--text-primary);
          transition: all var(--duration-200) var(--ease-out);
          flex-shrink: 0;
          min-width: 180px;
        }

        .navbar-logo:hover {
          transform: translateY(-1px);
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--gradient-canopy);
          color: var(--forest-600);
        }

        .logo-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          line-height: 1;
        }

        .logo-subtitle {
          font-size: var(--text-xs);
          color: var(--text-muted);
          line-height: 1;
        }

        /* ===== NAVIGATION ITEMS ===== */
        .navbar-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2_5) var(--space-4);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          font-size: var(--text-sm);
          min-height: 44px;
          transition: all var(--duration-200) var(--ease-out);
          position: relative;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: var(--forest-600);
          background: var(--forest-50);
          transform: translateY(-1px);
        }

        .nav-link.active {
          color: var(--forest-700);
          background: var(--forest-100);
          font-weight: var(--font-weight-semibold);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-forest-primary);
          border-radius: 0 0 var(--radius-base) var(--radius-base);
        }

        /* ===== USER MENU ===== */
        .navbar-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-3);
          flex-shrink: 0;
          min-width: 200px;
          margin-left: var(--space-8);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding-left: var(--space-4);
          border-left: 1px solid var(--border-secondary);
        }

        .auth-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        /* ===== MOBILE MENU TOGGLE ===== */
        .mobile-menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-lg);
          transition: all var(--duration-200) var(--ease-out);
        }

        .mobile-menu-toggle:hover {
          color: var(--text-primary);
          background: var(--stone-100);
        }

        /* ===== MOBILE MENU ===== */
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          transform: translateY(-100%);
          opacity: 0;
          transition: all var(--duration-300) var(--ease-out);
          pointer-events: none;
        }

        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-menu-content {
          padding: var(--space-6) var(--space-4);
          max-height: calc(100vh - 72px);
          overflow-y: auto;
        }

        .mobile-nav-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-6);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          font-size: var(--text-base);
          min-height: 56px;
          transition: all var(--duration-200) var(--ease-out);
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          color: var(--forest-700);
          background: var(--forest-100);
        }

        .mobile-actions {
          border-top: 1px solid var(--border-primary);
          padding-top: var(--space-6);
        }

        .mobile-auth-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        /* ===== MOBILE BOTTOM NAVIGATION ===== */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          background: var(--bg-surface);
          border-top: 1px solid var(--border-primary);
          padding: var(--space-2) 0;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav-items {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 var(--space-4);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          min-width: 64px;
          transition: all var(--duration-200) var(--ease-out);
          position: relative;
        }

        .bottom-nav-item:hover {
          color: var(--forest-600);
          transform: translateY(-1px);
        }

        .bottom-nav-item.active {
          color: var(--forest-700);
        }

        .bottom-nav-item.active::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 3px;
          background: var(--gradient-forest-primary);
          border-radius: 0 0 var(--radius-base) var(--radius-base);
        }

        /* ===== RESPONSIVE BREAKPOINTS ===== */
        @media (max-width: 1200px) {
          .navbar-content {
            max-width: 100%;
            gap: var(--space-4);
          }
          
          .navbar-logo {
            min-width: 160px;
          }
          
          .navbar-actions {
            min-width: 180px;
          }
        }

        @media (max-width: 1023px) {
          .navbar-content {
            display: flex;
            justify-content: space-between;
            gap: var(--space-4);
          }
          
          .navbar-nav {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .mobile-menu {
            display: block;
          }
          
          .navbar-logo {
            min-width: auto;
          }
          
          .navbar-actions {
            min-width: auto;
          }
        }

        @media (max-width: 767px) {
          .navbar-actions {
            display: none;
          }

          .mobile-bottom-nav {
            display: block;
          }

          /* Add bottom padding to body to account for bottom nav */
          :global(body) {
            padding-bottom: 80px;
          }

          .logo-text {
            display: none;
          }

          /* Show mobile app header */
          .mobile-app-header {
            display: flex;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
          }

          /* Show mobile logo icon */
          .mobile-logo-icon {
            display: flex;
          }

          /* Hide desktop logo on mobile */
          .navbar-logo {
            visibility: hidden;
          }

          /* Adjust navbar layout for mobile header */
          .navbar-content {
            position: relative;
            justify-content: space-between;
            height: 72px;
          }

          .mobile-menu-toggle {
            z-index: 2;
          }
        }

        @media (max-width: 480px) {
          .navbar-content {
            height: 64px;
          }

          .container {
            padding: 0 var(--space-4);
          }

          /* Smaller mobile header adjustments */
          .app-name {
            font-size: var(--text-lg);
          }

          .app-tagline {
            font-size: 0.6rem;
          }

          .mobile-app-header {
            gap: 0.125rem;
          }
        }

        /* ===== ACCESSIBILITY ===== */
        @media (prefers-reduced-motion: reduce) {
          .modern-navbar,
          .nav-link,
          .mobile-menu {
            transition: none;
          }
        }

        .nav-link:focus-visible,
        .mobile-nav-link:focus-visible,
        .bottom-nav-item:focus-visible {
          outline: 2px solid var(--border-focus);
          outline-offset: 2px;
        }

        /* ===== BUTTON COLOR FIXES FOR START GROWING BUTTONS ===== */
        /* Fix navbar "Start Growing" button text visibility */
        .btn-primary {
          background: var(--gradient-forest-primary) !important;
          color: white !important;
          border: 1px solid var(--forest-600) !important;
          transition: all 0.2s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          border-color: var(--forest-600) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .btn-primary:active:not(:disabled) {
          background: var(--forest-700) !important;
          color: white !important;
          border-color: var(--forest-700) !important;
          transform: translateY(0);
        }

        .btn-primary:focus:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          outline: 2px solid var(--forest-300);
          outline-offset: 2px;
        }

        /* Ensure mobile "Start Growing" buttons also have proper visibility */
        .mobile-auth-actions .btn-primary,
        .mobile-actions .btn-primary {
          background: var(--gradient-forest-primary) !important;
          color: white !important;
          border: 1px solid var(--forest-600) !important;
        }

        .mobile-auth-actions .btn-primary:hover:not(:disabled),
        .mobile-actions .btn-primary:hover:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          border-color: var(--forest-600) !important;
        }

        .mobile-auth-actions .btn-primary:active:not(:disabled),
        .mobile-actions .btn-primary:active:not(:disabled) {
          background: var(--forest-700) !important;
          color: white !important;
          border-color: var(--forest-700) !important;
        }

        /* ===== HIGH CONTRAST MODE ===== */
        @media (prefers-contrast: high) {
          .nav-link.active,
          .mobile-nav-link.active,
          .bottom-nav-item.active {
            border: 2px solid var(--forest-600);
          }
        }

        /* ===== MAIN CONTENT SPACING ===== */
        :global(.main-content),
        :global(main),
        :global(.page-container),
        :global(.dashboard-container),
        :global(.habits-container) {
          padding-top: 88px !important;
          min-height: calc(100vh - 88px);
        }

        @media (max-width: 480px) {
          :global(.main-content),
          :global(main),
          :global(.page-container),
          :global(.dashboard-container),
          :global(.habits-container) {
            padding-top: 80px !important;
            min-height: calc(100vh - 80px);
            margin-bottom: 80px;
          }
        }
      `}</style>
    </>
  );
};

export default ModernForestNavbar;