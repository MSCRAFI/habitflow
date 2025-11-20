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

// Available themes with proper mapping
export const THEMES = {
  FOREST: 'forest',    // Default - nature-inspired green theme
  LIGHT: 'light',      // Clean light theme with dark text
  DARK: 'dark',        // Dark theme
  BLUE: 'ocean',       // Ocean/blue theme (mapped to ocean CSS)
  GREEN: 'forest',     // Forest/green theme (mapped to forest CSS) 
  PURPLE: 'sunset',    // Purple theme (mapped to sunset CSS)
  OCEAN: 'ocean',      // Blue/teal theme
  SUNSET: 'sunset',    // Warm orange/pink
  MOUNTAIN: 'mountain', // Cool grays/blues
  CLASSIC: 'classic'   // Clean black/white
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Check localStorage first, then default to forest
    const saved = localStorage.getItem('theme');
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
    return THEMES.FOREST;
  });

  useEffect(() => {
    // Dark mode counts as a feature, not a bug.
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