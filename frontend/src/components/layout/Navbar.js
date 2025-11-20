import React, { useState } from 'react';
import { LinkLogo } from '../common/Logo';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
// Removed Navbar.css import to prevent conflicts with PremiumNavbar

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [today, setToday] = useState([]);
  const [showQuick, setShowQuick] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleQuick = async () => {
    setShowQuick(!showQuick);
    if (!showQuick) {
      try {
        const data = await import('../../services/api').then(m => m.default.getTodayHabits());
        setToday(Array.isArray(data) ? data : (data?.results || data || []));
      } catch (e) {
        // ignore
      }
    }
  };

  const toggleThemeMenu = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const handleThemeChange = (theme) => {
    setTheme(theme);
    setIsThemeMenuOpen(false);
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case THEMES.DARK:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        );
      case THEMES.BLUE:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v6.5l4 4-4 4V22a10 10 0 1 0 0-20z"/>
          </svg>
        );
      case THEMES.GREEN:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8l4 4-4 4m-6-4h9m-9-4v8"/>
          </svg>
        );
      case THEMES.PURPLE:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
          </svg>
        );
      default: // LIGHT
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        );
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          {/* Modern Brand */}
          <LinkLogo 
            to="/" 
            variant="full"
            size="medium"
            theme="auto"
            className="navbar-brand"
          />

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
           {/* Search */}
           {isAuthenticated && (
             <form className="navbar-search" onSubmit={(e)=>{e.preventDefault(); navigate(`/social`);}}>
               <input
                 className="input"
                 placeholder="Search users or habits"
                 value={query}
                 onChange={(e)=>setQuery(e.target.value)}
                 style={{ minWidth: 220 }}
               />
             </form>
           )}
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActivePath('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/habits" 
                  className={`nav-link ${isActivePath('/habits') ? 'active' : ''}`}
                >
                  Habits
                </Link>
                <Link 
                  to="/social" 
                  className={`nav-link ${isActivePath('/social') ? 'active' : ''}`}
                >
                  Social
                </Link>
                <Link 
                  to="/challenges" 
                  className={`nav-link ${isActivePath('/challenges') ? 'active' : ''}`}
                >
                  Challenges
                </Link>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActivePath('/profile') ? 'active' : ''}`}
                >
                  Profile
                </Link>
                <Link 
                  to="/theme-demo" 
                  className={`nav-link ${isActivePath('/theme-demo') ? 'active' : ''}`}
                  title="View theme showcase"
                >
                  🎨 Themes
                </Link>
                
                {/* User Menu */}
                <div className="user-menu">
                  <div className="user-avatar">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  
                  {/* Quick Complete Feature - Fixed Design */}
                  <button 
                    className="btn btn-ghost btn-sm" 
                    title="Quick complete today's habits" 
                    onClick={toggleQuick}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,11 12,14 22,4"/>
                      <path d="M21,12v7a2,2 0 0,1-2,2H5a2,2 0 0,1-2-2V5a2,2 0 0,1,2-2h11"/>
                    </svg>
                    Quick
                  </button>
                  {showQuick && (
                    <div className="quick-dropdown">
                      {today.length === 0 ? (
                        <div className="text-secondary" style={{ padding: '0.75rem 1rem' }}>No habits for today</div>
                      ) : today.map(h => (
                        <button key={h.id} className="quick-item" onClick={async ()=>{
                          try {
                            const api = (await import('../../services/api')).default;
                            await api.createHabitEntry(h.id, {});
                            setToday(t => t.map(x => x.id === h.id ? { ...x, completed_today: true } : x));
                          } catch (e) {}
                        }}>
                          {h.completed_today ? '✅' : '⬜'} {h.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="theme-selector">
                    <button 
                      className="theme-toggle"
                      onClick={toggleThemeMenu}
                      title="Change theme"
                    >
                      {getThemeIcon(currentTheme)}
                    </button>
                    
                    {isThemeMenuOpen && (
                      <div className="theme-dropdown">
                        <div 
                          className={`theme-option ${currentTheme === THEMES.LIGHT ? 'active' : ''}`}
                          onClick={() => handleThemeChange(THEMES.LIGHT)}
                        >
                          <div className="theme-color" style={{ background: '#3b82f6' }}></div>
                          Light
                        </div>
                        <div 
                          className={`theme-option ${currentTheme === THEMES.DARK ? 'active' : ''}`}
                          onClick={() => handleThemeChange(THEMES.DARK)}
                        >
                          <div className="theme-color" style={{ background: '#1e293b' }}></div>
                          Dark
                        </div>
                        <div 
                          className={`theme-option ${currentTheme === THEMES.BLUE ? 'active' : ''}`}
                          onClick={() => handleThemeChange(THEMES.BLUE)}
                        >
                          <div className="theme-color" style={{ background: '#0284c7' }}></div>
                          Ocean
                        </div>
                        <div 
                          className={`theme-option ${currentTheme === THEMES.GREEN ? 'active' : ''}`}
                          onClick={() => handleThemeChange(THEMES.GREEN)}
                        >
                          <div className="theme-color" style={{ background: '#16a34a' }}></div>
                          Forest
                        </div>
                        <div 
                          className={`theme-option ${currentTheme === THEMES.PURPLE ? 'active' : ''}`}
                          onClick={() => handleThemeChange(THEMES.PURPLE)}
                        >
                          <div className="theme-color" style={{ background: '#8b5cf6' }}></div>
                          Royal
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16,17 21,12 16,7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="auth-nav">
                <Link to="/login" className="nav-link">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {user?.first_name || user?.username}
                    </p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                </div>
                
                <div className="mobile-nav-links">
                  <Link 
                    to="/dashboard" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/habits" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Habits
                  </Link>
                  <Link 
                    to="/social" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Social
                  </Link>
                  <Link 
                    to="/challenges" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Challenges
                  </Link>
                  <Link 
                    to="/profile" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/theme-demo" 
                    className="mobile-nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🎨 Theme Demo
                  </Link>
                  
                  <div className="mobile-nav-divider"></div>
                  
                  {/* Theme Options */}
                  <div className="mobile-theme-section">
                    <p className="mobile-theme-title">Theme</p>
                    <div className="mobile-theme-grid">
                      <button 
                        className={`mobile-theme-option ${currentTheme === THEMES.LIGHT ? 'active' : ''}`}
                        onClick={() => {
                          handleThemeChange(THEMES.LIGHT);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="theme-color" style={{ background: '#3b82f6' }}></div>
                        Light
                      </button>
                      <button 
                        className={`mobile-theme-option ${currentTheme === THEMES.DARK ? 'active' : ''}`}
                        onClick={() => {
                          handleThemeChange(THEMES.DARK);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="theme-color" style={{ background: '#1e293b' }}></div>
                        Dark
                      </button>
                      <button 
                        className={`mobile-theme-option ${currentTheme === THEMES.BLUE ? 'active' : ''}`}
                        onClick={() => {
                          handleThemeChange(THEMES.BLUE);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="theme-color" style={{ background: '#0284c7' }}></div>
                        Ocean
                      </button>
                      <button 
                        className={`mobile-theme-option ${currentTheme === THEMES.GREEN ? 'active' : ''}`}
                        onClick={() => {
                          handleThemeChange(THEMES.GREEN);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="theme-color" style={{ background: '#16a34a' }}></div>
                        Forest
                      </button>
                      <button 
                        className={`mobile-theme-option ${currentTheme === THEMES.PURPLE ? 'active' : ''}`}
                        onClick={() => {
                          handleThemeChange(THEMES.PURPLE);
                          setIsMenuOpen(false);
                        }}
                      >
                        <div className="theme-color" style={{ background: '#8b5cf6' }}></div>
                        Royal
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    className="mobile-nav-link logout-link"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-nav-links">
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="navbar-backdrop"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
      
      {/* Theme Dropdown Backdrop */}
      {isThemeMenuOpen && (
        <div 
          className="navbar-backdrop"
          onClick={() => setIsThemeMenuOpen(false)}
          style={{ zIndex: 40 }}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;