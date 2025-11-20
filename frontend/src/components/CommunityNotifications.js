import React, { useState, useEffect } from 'react';

const CommunityNotifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications - replace with actual API call
    const mockNotifications = [
      {
        id: 1,
        type: 'achievement',
        title: 'Sarah completed her 30-day meditation streak!',
        time: '2m ago',
        icon: '🧘',
        user: 'Sarah Johnson',
        action: 'completed 30-day streak'
      },
      {
        id: 2,
        type: 'follow',
        title: 'Alex started following you',
        time: '5m ago',
        icon: '👤',
        user: 'Alex Chen',
        action: 'started following you'
      },
      {
        id: 3,
        type: 'like',
        title: 'Your morning routine post got 5 likes',
        time: '10m ago',
        icon: '👍',
        user: 'Community',
        action: 'liked your post'
      },
      {
        id: 4,
        type: 'challenge',
        title: 'New "Mindful March" challenge started',
        time: '1h ago',
        icon: '🎯',
        user: 'HabitFlow',
        action: 'started new challenge'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getNotificationStyle = (type) => {
    const styles = {
      achievement: { bg: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' },
      follow: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white' },
      like: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' },
      challenge: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }
    };
    return styles[type] || styles.achievement;
  };

  return (
    <div className="notifications-overlay">
      <div className="notifications-panel">
        <div className="notifications-header">
          <h3>🔔 Live Updates</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="notifications-list">
          {notifications.map(notification => {
            const style = getNotificationStyle(notification.type);
            return (
              <div key={notification.id} className="notification-item">
                <div 
                  className="notification-icon"
                  style={{ background: style.bg, color: style.color }}
                >
                  {notification.icon}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-time">{notification.time}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="notifications-footer">
          <button className="view-all-btn">View All Notifications</button>
        </div>
      </div>

      <style jsx>{`
        .notifications-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
          padding: 1rem;
        }

        .notifications-panel {
          width: 400px;
          max-width: 90vw;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          animation: slideInRight 0.3s ease-out;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        .notifications-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(0, 0, 0, 0.1);
          color: var(--text-primary);
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease-out;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          line-height: 1.4;
        }

        .notification-time {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .notifications-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
        }

        .view-all-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 767px) {
          .notifications-overlay {
            padding: 0.5rem;
          }

          .notifications-panel {
            width: 100%;
            max-height: 90vh;
          }

          .notifications-header,
          .notifications-footer {
            padding: 1rem;
          }

          .notifications-list {
            padding: 0.5rem;
          }

          .notification-item {
            padding: 0.75rem;
          }

          .notification-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunityNotifications;