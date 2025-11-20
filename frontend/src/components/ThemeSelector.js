import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = ({ compact = false }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const themeOptions = [
    { value: availableThemes.FOREST, label: '🌲', name: 'Forest', description: 'Nature-inspired green' },
    { value: availableThemes.LIGHT, label: '☀️', name: 'Light', description: 'Clean and minimal' },
    { value: availableThemes.DARK, label: '🌙', name: 'Dark', description: 'Modern dark mode' },
    { value: availableThemes.OCEAN, label: '🌊', name: 'Ocean', description: 'Calm blue tones' },
    { value: availableThemes.SUNSET, label: '🌅', name: 'Sunset', description: 'Warm orange/pink' },
    { value: availableThemes.MOUNTAIN, label: '⛰️', name: 'Mountain', description: 'Cool grays' },
    { value: availableThemes.CLASSIC, label: '⚫', name: 'Classic', description: 'Timeless black & white' },
  ];

  if (compact) {
    return (
      <div className="theme-selector-compact" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-xs)',
        alignItems: 'center'
      }}>
        <span style={{ 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)', 
          marginRight: 'var(--space-sm)',
          whiteSpace: 'nowrap'
        }}>
          Theme:
        </span>
        {themeOptions.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            style={{
              padding: 'var(--space-xs)',
              border: currentTheme === theme.value 
                ? '2px solid var(--color-primary-600)' 
                : '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-sm)',
              background: currentTheme === theme.value 
                ? 'var(--color-primary-50)' 
                : 'var(--surface-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: '1.2rem',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`${theme.name} - ${theme.description}`}
          >
            {theme.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="theme-selector">
      <label className="form-label" style={{ marginBottom: 'var(--space-md)' }}>
        Choose Theme
      </label>
      <div className="theme-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-lg)'
      }}>
        {themeOptions.map((theme) => (
          <div
            key={theme.value}
            className={`theme-option ${currentTheme === theme.value ? 'selected' : ''}`}
            onClick={() => setTheme(theme.value)}
            style={{
              padding: 'var(--space-md)',
              border: currentTheme === theme.value 
                ? '2px solid var(--color-primary-600)' 
                : '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              background: currentTheme === theme.value 
                ? 'var(--color-primary-50)' 
                : 'var(--surface-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
              {theme.label}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-xs)'
            }}>
              {theme.name}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
              lineHeight: 1.3
            }}>
              {theme.description}
            </div>
            {currentTheme === theme.value && (
              <div style={{
                marginTop: 'var(--space-xs)',
                fontSize: '0.625rem',
                color: 'var(--color-primary-600)',
                fontWeight: '600'
              }}>
                ✓ Active
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ 
        padding: 'var(--space-md)',
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>Current theme:</strong> {themeOptions.find(t => t.value === currentTheme)?.name || 'Unknown'}
        <br />
        Theme changes are automatically saved and will persist across sessions.
      </div>
    </div>
  );
};

export default ThemeSelector;