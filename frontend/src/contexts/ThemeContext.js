import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Global theme context. Keeps the UI consistent and your retinas happy.
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Modern Forest theme - the primary theme for the application
export const THEMES = {
  FOREST: 'modern-forest',    // Modern Forest theme
  DARK: 'modern-forest-dark', // Dark variant of Modern Forest
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage for dark mode preference, default to modern forest
    const saved = localStorage.getItem('theme');
    if (saved === THEMES.DARK) {
      return THEMES.DARK;
    }
    return THEMES.FOREST;
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const setTheme = (theme) => {
    if (Object.values(THEMES).includes(theme)) {
      setCurrentTheme(theme);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === THEMES.FOREST ? THEMES.DARK : THEMES.FOREST);
  };

  const value = {
    currentTheme,
    isDark: currentTheme === THEMES.DARK,
    theme: currentTheme,
    setTheme,
    toggleTheme,
    availableThemes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};