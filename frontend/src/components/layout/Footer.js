import React from 'react';

/**
 * Site-wide footer with a minimal, neutral design.
 * This component intentionally contains no navigation logic or business state.
 * Drop it at the bottom of any layout to provide consistent branding and links.
 */
const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" role="contentinfo" aria-label="Site footer">
      <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-lg)', alignItems: 'center' }}>
          <div className="footer-brand" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>HabitFlow</strong> &middot; Grow better habits
          </div>
          <div className="footer-meta" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span>&copy; {year} HabitFlow</span>
            <span style={{ margin: '0 var(--space-sm)' }}>•</span>
            <a href="#" className="link" style={{ color: 'var(--text-secondary)' }}>Privacy</a>
            <span style={{ margin: '0 var(--space-sm)' }}>•</span>
            <a href="#" className="link" style={{ color: 'var(--text-secondary)' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
