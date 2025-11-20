import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const EnhancedSocialFeedItem = ({ item, onAction }) => {
  const { showError, showSuccess } = useNotification();
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes || 0);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  // Handle reactions
  const handleReaction = async (emoji) => {
    try {
      setLiking(true);
      // TODO: Implement when endpoint available
      await new Promise(r => setTimeout(r, 300));
      
      if (!liked) {
        setLiked(true);
        setLikeCount(prev => prev + 1);
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1000);
      }
      
      showSuccess(`Reacted with ${emoji}`);
      onAction?.();
    } catch (e) {
      showError('Failed to react');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      setCommenting(true);
      // TODO: Implement when endpoint available
      await new Promise(r => setTimeout(r, 300));
      setCommentText('');
      showSuccess('Comment added');
      onAction?.();
    } catch (e) {
      showError('Failed to comment');
    } finally {
      setCommenting(false);
    }
  };

  const getTypeConfig = () => {
    const configs = {
      completion: { 
        icon: '✅', 
        label: 'Habit Completed', 
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bgColor: 'rgba(16, 185, 129, 0.1)'
      },
      badge: { 
        icon: '🏅', 
        label: 'Badge Earned', 
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        bgColor: 'rgba(245, 158, 11, 0.1)'
      },
      challenge: { 
        icon: '🎯', 
        label: 'Challenge Update', 
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        bgColor: 'rgba(139, 92, 246, 0.1)'
      },
      streak: { 
        icon: '🔥', 
        label: 'Streak Achievement', 
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        bgColor: 'rgba(239, 68, 68, 0.1)'
      },
      level_up: { 
        icon: '⭐', 
        label: 'Level Up', 
        color: '#eab308',
        gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
        bgColor: 'rgba(234, 179, 8, 0.1)'
      },
      default: { 
        icon: '📢', 
        label: 'Activity', 
        color: '#6b7280',
        gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
        bgColor: 'rgba(107, 114, 128, 0.1)'
      }
    };
    return configs[item.type] || configs.default;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const typeConfig = getTypeConfig();

  return (
    <div className="enhanced-feed-item">
      <div className="feed-item-header">
        <div className="user-section">
          <div className="user-avatar">
            {item.user?.first_name ? 
              item.user.first_name.charAt(0).toUpperCase() : 
              (item.user?.username || 'U').charAt(0).toUpperCase()
            }
          </div>
          <div className="user-info">
            <div className="username">
              {item.user?.first_name && item.user?.last_name ? 
                `${item.user.first_name} ${item.user.last_name}` :
                item.user?.username || 'Anonymous User'
              }
            </div>
            <div className="activity-time">{formatTime(item.created_at)}</div>
          </div>
        </div>
        
        <div className="activity-badge" style={{ background: typeConfig.gradient }}>
          <span className="activity-icon">{typeConfig.icon}</span>
          <span className="activity-label">{typeConfig.label}</span>
        </div>
      </div>

      <div className="feed-item-content">
        <div className="activity-message">
          {item.message}
        </div>
        
        {/* Progress visualization for habits */}
        {item.type === 'completion' && item.progress && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${item.progress.percentage || 0}%`,
                  background: typeConfig.gradient
                }}
              />
            </div>
            <div className="progress-text">
              {item.progress.current || 0} / {item.progress.target || 0} completed
            </div>
          </div>
        )}

        {/* Streak visualization */}
        {item.type === 'streak' && item.streak_count && (
          <div className="streak-section">
            <div className="streak-flames">
              {Array.from({ length: Math.min(item.streak_count, 7) }, (_, i) => (
                <span key={i} className="streak-flame" style={{ animationDelay: `${i * 0.1}s` }}>
                  🔥
                </span>
              ))}
            </div>
            <div className="streak-count">
              {item.streak_count} day streak!
            </div>
          </div>
        )}

        {/* Badge showcase */}
        {item.type === 'badge' && item.badge && (
          <div className="badge-showcase">
            <div className="badge-icon">{item.badge.icon || '🏅'}</div>
            <div className="badge-info">
              <div className="badge-name">{item.badge.name}</div>
              <div className="badge-description">{item.badge.description}</div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced action buttons */}
      <div className="feed-item-actions">
        <div className="reaction-section">
          <button 
            className={`reaction-btn ${liked ? 'liked' : ''} ${celebrating ? 'celebrating' : ''}`}
            onClick={() => handleReaction('👍')}
            disabled={liking}
            title="Like this post"
          >
            <span className="reaction-icon">👍</span>
            <span className="reaction-count">{likeCount}</span>
            {celebrating && <div className="celebration-burst">✨</div>}
          </button>

          <button 
            className="reaction-btn"
            onClick={() => handleReaction('🎉')}
            disabled={liking}
            title="Celebrate"
          >
            <span className="reaction-icon">🎉</span>
          </button>

          <button 
            className="reaction-btn"
            onClick={() => handleReaction('💪')}
            disabled={liking}
            title="Show support"
          >
            <span className="reaction-icon">💪</span>
          </button>
        </div>

        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
            title="Comment"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z"/>
            </svg>
            <span>Comment</span>
          </button>

          <button 
            className="action-btn"
            onClick={() => {/* TODO: Share functionality */}}
            title="Share"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input 
              className="comment-input" 
              placeholder="Add an encouraging comment..."
              value={commentText} 
              onChange={e => setCommentText(e.target.value)}
              disabled={commenting}
            />
            <button 
              className="comment-submit"
              disabled={!commentText.trim() || commenting}
              type="submit"
            >
              {commenting ? (
                <div className="loading-spinner" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </form>

          {item.comments && item.comments.length > 0 && (
            <div className="comments-list">
              {item.comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name}</span>
                      <span className="comment-time">{formatTime(comment.created_at)}</span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .enhanced-feed-item {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 1.5rem;
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .enhanced-feed-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${typeConfig.gradient};
          opacity: 0.8;
        }

        .enhanced-feed-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .feed-item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .user-avatar::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: ${typeConfig.gradient};
          border-radius: 50%;
          z-index: -1;
          opacity: 0.3;
        }

        .user-info {
          flex: 1;
        }

        .username {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          font-size: 1rem;
        }

        .activity-time {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .activity-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .activity-icon {
          font-size: 1.25rem;
        }

        .feed-item-content {
          margin-bottom: 1.5rem;
        }

        .activity-message {
          color: var(--text-primary);
          line-height: 1.6;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .progress-section {
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1rem;
          padding: 1rem;
          margin-top: 1rem;
        }

        .progress-bar {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 1rem;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          border-radius: 1rem;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .streak-section {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
          border-radius: 1rem;
          padding: 1rem;
          margin-top: 1rem;
          text-align: center;
        }

        .streak-flames {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .streak-flame {
          font-size: 1.5rem;
          animation: flicker 1.5s ease-in-out infinite alternate;
        }

        @keyframes flicker {
          0% { transform: scale(1) rotate(-2deg); }
          100% { transform: scale(1.1) rotate(2deg); }
        }

        .streak-count {
          font-size: 1rem;
          font-weight: 700;
          color: #dc2626;
        }

        .badge-showcase {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
          border-radius: 1rem;
          padding: 1rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .badge-icon {
          font-size: 3rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-10px,0); }
          70% { transform: translate3d(0,-5px,0); }
          90% { transform: translate3d(0,-2px,0); }
        }

        .badge-info {
          flex: 1;
        }

        .badge-name {
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .badge-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .feed-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .reaction-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .reaction-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          position: relative;
          overflow: hidden;
        }

        .reaction-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(16, 185, 129, 0.5);
          transform: translateY(-2px);
        }

        .reaction-btn.liked {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .reaction-btn.celebrating {
          animation: celebrate 0.6s ease-in-out;
        }

        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .celebration-burst {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1.5rem;
          animation: burst 1s ease-out forwards;
        }

        @keyframes burst {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(0);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-20px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-30px) scale(0.8);
          }
        }

        .reaction-icon {
          font-size: 1.25rem;
        }

        .reaction-count {
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.5);
          color: var(--text-primary);
        }

        .comments-section {
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .comment-form {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .comment-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .comment-input:focus {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(255, 255, 255, 0.8);
        }

        .comment-submit {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .comment-submit:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .comment-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .comment-item {
          display: flex;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          padding: 0.75rem;
        }

        .comment-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .comment-content {
          flex: 1;
          min-width: 0;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .comment-author {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .comment-time {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        .comment-text {
          color: var(--text-primary);
          font-size: 0.875rem;
          line-height: 1.5;
        }

        @media (max-width: 767px) {
          .enhanced-feed-item {
            padding: 1rem;
            border-radius: 1rem;
          }

          .feed-item-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .activity-badge {
            align-self: flex-start;
          }

          .feed-item-actions {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .reaction-section {
            justify-content: space-around;
          }

          .action-buttons {
            justify-content: center;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .comment-form {
            gap: 0.5rem;
          }

          .comment-submit {
            width: 36px;
            height: 36px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .enhanced-feed-item,
          .reaction-btn,
          .streak-flame,
          .badge-icon {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSocialFeedItem;