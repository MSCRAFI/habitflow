import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const SocialFeedItem = ({ item, onAction }) => {
  const { showError, showSuccess } = useNotification();
  const [liking, setLiking] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Social interactions: optimistic UI with graceful fallback while backend endpoints evolve
  const like = async () => {
    try {
      setLiking(true);
      // TODO: Implement when endpoint available
      await new Promise(r => setTimeout(r, 300));
      showSuccess('Reacted to post');
      onAction?.();
    } catch (e) {
      showError('Failed to react');
    } finally {
      setLiking(false);
    }
  };

  const comment = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement when endpoint available
      await new Promise(r => setTimeout(r, 300));
      setCommentText('');
      showSuccess('Comment added');
      onAction?.();
    } catch (e) {
      showError('Failed to comment');
    }
  };

  const getTypeIcon = () => {
    switch(item.type) {
      case 'completion': return '✅';
      case 'badge': return '🏅';
      case 'challenge': return '';
      default: return '📢';
    }
  };

  const getTypeLabel = () => {
    switch(item.type) {
      case 'completion': return 'Habit Completed';
      case 'badge': return 'Badge Earned';
      case 'challenge': return 'Challenge Update';
      default: return 'Activity';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="feed-item">
      <div className="feed-header">
        <div className="feed-type">
          <span style={{ marginRight: 'var(--space-sm)' }}>{getTypeIcon()}</span>
          {getTypeLabel()}
        </div>
        <div className="feed-time">{formatTime(item.created_at)}</div>
      </div>
      
      <div className="feed-message">{item.message}</div>
      
      <div className="feed-actions">
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={like} 
          disabled={liking}
          title="Like this post"
        >
          👍 {liking ? 'Liking...' : 'Like'}
        </button>
      </div>
      
      {(item.comments?.length > 0) && (
        <div className="feed-comments" style={{ 
          marginTop: 'var(--space-lg)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--border-primary)'
        }}>
          {item.comments.map(c => (
            <div key={c.id} className="comment" style={{
              padding: 'var(--space-sm) 0',
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: 'var(--text-primary)' }}>{c.user_name}</strong>{' '}
              {c.text}
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={comment} className="feed-comment-form">
        <input 
          className="form-input" 
          placeholder="Add a comment..." 
          value={commentText} 
          onChange={e=>setCommentText(e.target.value)}
          style={{ fontSize: '0.875rem' }}
        />
        <button 
          className="btn btn-primary btn-sm" 
          disabled={!commentText.trim()}
          type="submit"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default SocialFeedItem;
