import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EnhancedSocialFeedItem from '../components/EnhancedSocialFeedItem';
import Skeleton from '../components/common/Skeleton';
import { useNotification } from '../contexts/NotificationContext';
import '../styles/enhanced-community.css';

const EnhancedSocialFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    habitsCompleted: 0,
    challengesActive: 0
  });
  const [trendingHabits, setTrendingHabits] = useState([]);
  const { showError, showSuccess } = useNotification();

  // Motivational quotes for the community
  const motivationalQuotes = [
    "🌱 Small habits, big transformations",
    "🚀 Progress, not perfection",
    "💪 Your only limit is your mind",
    "🎯 Consistency beats intensity",
    "⭐ Start where you are, use what you have"
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  // Rotate quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % motivationalQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await api.getSocialFeed();
      setFeed(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      showError('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityStats = async () => {
    try {
      // Mock data - replace with actual API calls when available
      setCommunityStats({
        totalUsers: 1234,
        activeToday: 89,
        habitsCompleted: 5678,
        challengesActive: 12
      });
    } catch (e) {
      console.error('Failed to fetch community stats:', e);
    }
  };

  const fetchTrendingHabits = async () => {
    try {
      // Mock data - replace with actual API calls when available
      setTrendingHabits([
        { id: 1, name: 'Morning Meditation', participants: 234, icon: '🧘' },
        { id: 2, name: 'Daily Reading', participants: 189, icon: '📚' },
        { id: 3, name: 'Water Intake', participants: 156, icon: '💧' },
        { id: 4, name: 'Exercise', participants: 134, icon: '🏃' },
        { id: 5, name: 'Gratitude Journal', participants: 98, icon: '🙏' }
      ]);
    } catch (e) {
      console.error('Failed to fetch trending habits:', e);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchCommunityStats();
    fetchTrendingHabits();
    
    // Poll for updates every 30 seconds
    const pollInterval = setInterval(fetchFeed, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const search = async (e) => {
    e?.preventDefault?.();
    if (!query.trim()) { 
      setSearchResults([]); 
      return; 
    }
    
    try {
      setSearching(true);
      const res = await api.searchUsers(query.trim());
      setSearchResults(res?.results || res || []);
    } catch (e) {
      console.error(e);
      showError('Failed to search users. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const follow = async (id) => {
    try {
      await api.followUser(id);
      setSearchResults(r => r.map(u => u.id === id ? { ...u, followed: true } : u));
      showSuccess('Started following user!');
    } catch (e) {
      showError('Failed to follow user');
    }
  };

  const unfollow = async (id) => {
    try {
      await api.unfollowUser(id);
      setSearchResults(r => r.map(u => u.id === id ? { ...u, followed: false } : u));
      showSuccess('Unfollowed user');
    } catch (e) {
      showError('Failed to unfollow user');
    }
  };

  const LoadingSkeleton = () => (
    <div className="enhanced-feed-section">
      <div className="enhanced-feed-header">
        <Skeleton width="200px" height="1.5rem" />
        <Skeleton width="100px" height="2rem" style={{ borderRadius: '1rem' }} />
      </div>
      <div className="enhanced-feed-container">
        <div className="enhanced-feed-items">
          {[1, 2, 3].map(i => (
            <div key={i} className="enhanced-loading" style={{ 
              background: 'rgba(255, 255, 255, 0.4)', 
              borderRadius: '1.5rem', 
              padding: '1.5rem', 
              marginBottom: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Skeleton width="48px" height="48px" circle />
                <div style={{ flex: 1 }}>
                  <Skeleton width="150px" height="1rem" style={{ marginBottom: '0.5rem' }} />
                  <Skeleton width="80px" height="0.875rem" />
                </div>
              </div>
              <Skeleton width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="70%" height="1rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="enhanced-community-container">
      {/* Hero Section */}
      <div className="enhanced-community-header">
        <div className="community-hero-section">
          <h1 className="enhanced-page-title">🌱 Community Garden</h1>
          <p className="enhanced-page-subtitle">
            Connect with fellow habit builders, share your progress, and grow together in our thriving community
          </p>
          
          {/* Motivational Quote Rotation */}
          <div className="quote-section">
            <div className="motivational-quote">
              {motivationalQuotes[currentQuote]}
            </div>
          </div>

          {/* Community Stats */}
          <div className="community-stats">
            <div className="stat-card">
              <div className="stat-value">{communityStats.totalUsers.toLocaleString()}</div>
              <div className="stat-label">Community Members</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{communityStats.activeToday}</div>
              <div className="stat-label">Active Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{communityStats.habitsCompleted.toLocaleString()}</div>
              <div className="stat-label">Habits Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{communityStats.challengesActive}</div>
              <div className="stat-label">Active Challenges</div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="enhanced-search-section">
          <div className="search-and-actions">
            <form className="enhanced-search-form" onSubmit={search}>
              <div className="enhanced-search-group">
                <svg className="enhanced-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input 
                  className="enhanced-search-input" 
                  placeholder="Search for inspiring community members..."
                  value={query} 
                  onChange={e => setQuery(e.target.value)}
                  disabled={searching}
                />
                <button className="enhanced-search-btn" type="submit" disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>
            
            <Link className="enhanced-empty-btn primary" to="/challenges">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Explore Challenges
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="enhanced-community-content">
        {/* Main Feed */}
        <div className="main-feed">
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="enhanced-search-results">
              <div className="enhanced-results-header">
                <h3 className="enhanced-results-title">
                  🔍 Search Results
                </h3>
                <span className="enhanced-results-count">
                  {searchResults.length} people found
                </span>
              </div>
              
              <div className="enhanced-users-grid">
                {searchResults.map(user => (
                  <div key={user.id} className="enhanced-user-card">
                    <div className="user-card-content">
                      <div className="enhanced-user-avatar">
                        {user.first_name ? 
                          user.first_name.charAt(0).toUpperCase() : 
                          user.username.charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="enhanced-user-info">
                        <div className="enhanced-user-name">{user.username}</div>
                        {(user.first_name || user.last_name) && (
                          <div className="enhanced-user-full-name">
                            {user.first_name} {user.last_name}
                          </div>
                        )}
                        <div className="user-stats">
                          <div className="user-stat">
                            <span className="user-stat-icon">🔥</span>
                            <span>{Math.floor(Math.random() * 50) + 1} day streak</span>
                          </div>
                          <div className="user-stat">
                            <span className="user-stat-icon">🏅</span>
                            <span>{Math.floor(Math.random() * 10) + 1} badges</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="enhanced-user-actions">
                      <button 
                        className={`enhanced-follow-btn ${user.followed ? 'following' : 'not-following'}`}
                        onClick={() => user.followed ? unfollow(user.id) : follow(user.id)}
                      >
                        {user.followed ? '✓ Following' : '+ Follow'}
                      </button>
                      <button className="profile-btn" title="View Profile">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed Section */}
          {loading ? (
            <LoadingSkeleton />
          ) : feed.length === 0 ? (
            <div className="enhanced-feed-section">
              <div className="enhanced-empty-feed">
                <div className="enhanced-empty-icon">🌿</div>
                <h3 className="enhanced-empty-title">Your garden awaits</h3>
                <p className="enhanced-empty-subtitle">
                  Follow community members or complete habits to see inspiring updates here. 
                  Join our thriving community and stay motivated on your journey!
                </p>
                <div className="enhanced-empty-actions">
                  <button 
                    className="enhanced-empty-btn primary"
                    onClick={() => document.querySelector('.enhanced-search-input')?.focus()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Find Friends
                  </button>
                  <Link className="enhanced-empty-btn secondary" to="/challenges">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                    Join Challenges
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="enhanced-feed-section">
              <div className="enhanced-feed-header">
                <h3 className="enhanced-feed-title">
                  🌱 Recent Activity
                </h3>
                <span className="enhanced-feed-count">
                  {feed.length} updates
                </span>
              </div>
              <div className="enhanced-feed-container">
                <div className="enhanced-feed-items">
                  {feed.map(item => (
                    <EnhancedSocialFeedItem key={item.id} item={item} onAction={fetchFeed} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="community-sidebar">
          {/* Trending Habits */}
          <div className="sidebar-card">
            <h4 className="sidebar-title">
              <span>📈</span>
              Trending Habits
            </h4>
            <div className="trending-list">
              {trendingHabits.map((habit, index) => (
                <div key={habit.id} className="trending-item">
                  <div className="trending-rank">#{index + 1}</div>
                  <div className="trending-info">
                    <div className="trending-name">
                      {habit.icon} {habit.name}
                    </div>
                    <div className="trending-stats">
                      {habit.participants} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="sidebar-card">
            <h4 className="sidebar-title">
              <span>⚡</span>
              Community Pulse
            </h4>
            <div className="quick-stats">
              <div className="quick-stat">
                <div className="quick-stat-value">24h</div>
                <div className="quick-stat-label">Avg Streak</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">89%</div>
                <div className="quick-stat-label">Success Rate</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">456</div>
                <div className="quick-stat-label">Today's Habits</div>
              </div>
              <div className="quick-stat">
                <div className="quick-stat-value">12</div>
                <div className="quick-stat-label">New Members</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="sidebar-card">
            <h4 className="sidebar-title">
              <span>🚀</span>
              Quick Actions
            </h4>
            <div className="quick-actions">
              <Link to="/habits" className="quick-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Create Habit
              </Link>
              <Link to="/challenges" className="quick-action-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Join Challenge
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .quote-section {
          margin: 2rem 0;
          text-align: center;
        }

        .motivational-quote {
          font-size: 1.5rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding: 1rem 2rem;
          border-radius: 2rem;
          background-color: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          display: inline-block;
          animation: fadeInOut 5s infinite;
        }

        @keyframes fadeInOut {
          0%, 90%, 100% { opacity: 1; }
          45%, 55% { opacity: 0.7; }
        }

        .main-feed {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 0.75rem;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .quick-action-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 1023px) {
          .enhanced-community-content {
            grid-template-columns: 1fr;
          }
          
          .community-sidebar {
            order: -1;
          }

          .sidebar-card {
            margin-bottom: 0;
          }
        }

        @media (max-width: 767px) {
          .motivational-quote {
            font-size: 1.25rem;
            padding: 0.75rem 1.5rem;
          }

          .community-stats {
            grid-template-columns: 1fr 1fr;
          }

          .quick-stats {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .quick-stat {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedSocialFeed;