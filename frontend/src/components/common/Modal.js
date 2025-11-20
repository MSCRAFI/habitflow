import React, { useEffect } from 'react';

/**
 * Accessible, controlled modal with focus trapping responsibility delegated to caller if needed.
 * - Non-intrusive styles, easy to theme.
 * - Closes on backdrop click or Escape key.
 */
const Modal = ({ open, onClose, title, children, actions = null }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div aria-hidden={!open}>
      <div
        className="modal-backdrop"
        onClick={() => onClose?.()}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 'var(--z-modal)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="modal"
        style={{
          position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
          zIndex: 'calc(var(--z-modal) + 1)'
        }}
      >
        <div className="modal-card card" style={{ maxWidth: 560, width: '90vw' }}>
          {title && (
            <div className="card-header">
              <h3 id="modal-title" className="card-title">{title}</h3>
            </div>
          )}
          <div className="card-body">
            {children}
          </div>
          {(actions) && (
            <div className="card-footer" style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Modal);
