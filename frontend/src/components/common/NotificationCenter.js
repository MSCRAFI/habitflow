import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '⚠';
      case 'warning': return '⚡';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  };

  return (
    <div className="notification-center" role="region" aria-live="polite">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification--${notification.type} fade-in`}
          onClick={() => removeNotification(notification.id)}
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-atomic="true"
        >
          <div className="notification-icon" aria-hidden="true">
            {getNotificationIcon(notification.type)}
          </div>
          
          <div className="notification-content">
            <div className="notification-message">
              {notification.message}
            </div>
          </div>
          
          <button
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

NotificationCenter.propTypes = {
  // No props, kept for consistency and future extension
};

export default React.memo(NotificationCenter);
