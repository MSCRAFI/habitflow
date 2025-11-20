// Imports: React -> third-party -> services -> components -> hooks/styles
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import SocialFeedItem from '../components/SocialFeedItem';
import { useNotification } from '../contexts/NotificationContext';

const SocialFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'friends', 'trending'
  const [showCommunityStats, setShowCommunityStats] = useState(false);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalHabits: 0,
    completionsToday: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastStatsFetch, setLastStatsFetch] = useState(0);
  const [lastLeaderboardFetch, setLastLeaderboardFetch] = useState(0);
  const { showError, showSuccess } = useNotification();

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await api.getSocialFeed();
      setFeed(Array.isArray(data) ? data : (data?.results || []));
      
      // Fetch real community stats and leaderboard in background
      fetchCommunityStats();
      fetchLeaderboard();
    } catch (e) {
      console.error(e);
      showError('Failed to load social feed');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data and set up lightweight polling. Keep intervals modest to reduce server load.
  useEffect(() => {
    fetchFeed();
    fetchCommunityStats();
    fetchLeaderboard();
    // Poll for updates
    const feedInterval = setInterval(fetchFeed, 30000);
    const statsInterval = setInterval(fetchCommunityStats, 120000); // 2 minutes SWR-like
    const leaderboardInterval = setInterval(fetchLeaderboard, 180000); // 3 minutes
    return () => {
      clearInterval(feedInterval);
      clearInterval(statsInterval);
      clearInterval(leaderboardInterval);
    };
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

  // Fetch aggregate community stats with simple client-side throttling to avoid spamming the API.
  const fetchCommunityStats = async () => {
    try {
      const now = Date.now();
      if (now - lastStatsFetch < 60000) return; // 1 minute cache on client
      setStatsLoading(true);
      setStatsError(null);
      const data = await api.getCommunityStats();
      setCommunityStats({
        totalUsers: data?.total_users || 0,
        activeToday: data?.active_today || 0,
        totalHabits: data?.total_habits || 0,
        completionsToday: data?.completions_today || 0
      });
      setLastStatsFetch(now);
    } catch (e) {
      console.error(e);
      setStatsError('Failed to load community stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const now = Date.now();
      if (now - lastLeaderboardFetch < 60000) return; // 1 minute cache
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      const data = await api.getLeaderboard('weekly');
      const results = Array.isArray(data) ? data : (data?.results || []);
      setLeaderboard(results);
      setLastLeaderboardFetch(now);
    } catch (e) {
      console.error(e);
      setLeaderboardError('Failed to load leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🌿 Community Garden</h1>
        <p className="page-description">
          Connect with fellow habit builders, share your progress, and grow together.
        </p>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form className="search-form" onSubmit={search}>
          <div className="search-group">
            <input 
              className="form-input" 
              placeholder="Search community members..."
              value={query} 
              onChange={e => setQuery(e.target.value)}
              disabled={searching}
            />
            <button className="btn btn-primary search-button" type="submit" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        <div className="action-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCommunityStats(!showCommunityStats)}
          >
            📊 Community Stats
          </button>
          <Link className="btn btn-secondary" to="/challenges">
            🏆 Join Challenges
          </Link>
        </div>
      </div>

      {/* Community Stats Section */}
      {showCommunityStats && (
        <div className="community-stats-section">
          <h2 className="section-title">📊 Community Overview</h2>
          <div className="stats-grid">
            {statsLoading && (
              <div className="loading-spinner" style={{gridColumn: '1 / -1'}}>
                <div className="spinner"></div>
                <p>Loading community stats...</p>
              </div>
            )}
            {!statsLoading && statsError && (
              <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                <div className="empty-icon">⚠️</div>
                <p className="empty-description">{statsError}</p>
              </div>
            )}
            {!statsLoading && !statsError && (
              <>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 6C9.65685 6 11 7.34315 11 9C11 10.6569 9.65685 12 8 12C6.34315 12 5 10.6569 5 9C5 7.34315 6.34315 6 8 6Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12.5 14H19.5C20.3284 14 21 14.6716 21 15.5V16.5C21 18.9853 19.4853 21 17 21H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8.5 14H15.5C16.3284 14 17 14.6716 17 15.5V16.5C17 18.9853 15.4853 21 13 21H4C2.89543 21 2 20.1046 2 19V18.5C2 16.0147 3.51472 14 5.5 14H8.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="stat-label">Community Members</div>
                  <div className="stat-value">{communityStats.totalUsers.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M12 16C12 19.31 9.31 22 6 22C4.5 22 3.23 21.36 2.34 20.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 16C12 19.31 14.69 22 18 22C19.5 22 20.77 21.36 21.66 20.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="stat-label">Active Today</div>
                  <div className="stat-value">{communityStats.activeToday}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="stat-label">Habits Completed Today</div>
                  <div className="stat-value">{communityStats.completionsToday}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="stat-label">Total Active Habits</div>
                  <div className="stat-value">{communityStats.totalHabits.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>
          
          {/* Leaderboard */}
          <div className="leaderboard-section">
            <h3 className="section-title">🏆 Weekly Leaders</h3>
            <div className="leaderboard">
              {leaderboardLoading && (
                <div className="loading-spinner" style={{minHeight: 'unset'}}>
                  <div className="spinner"></div>
                  <p>Loading leaderboard...</p>
                </div>
              )}
              {!leaderboardLoading && leaderboardError && (
                <div className="empty-state">
                  <div className="empty-icon">⚠️</div>
                  <p className="empty-description">{leaderboardError}</p>
                </div>
              )}
              {!leaderboardLoading && !leaderboardError && leaderboard.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🌱</div>
                  <p className="empty-description">No leaderboard data yet. Start completing habits!</p>
                </div>
              )}
              {!leaderboardLoading && !leaderboardError && leaderboard.length > 0 && leaderboard.map((row, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="rank">
                    {index === 0 ? (
                      <div className="rank-medal first">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1"/>
                          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">1</text>
                        </svg>
                      </div>
                    ) : index === 1 ? (
                      <div className="rank-medal second">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1"/>
                          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">2</text>
                        </svg>
                      </div>
                    ) : index === 2 ? (
                      <div className="rank-medal third">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1"/>
                          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">3</text>
                        </svg>
                      </div>
                    ) : `#${index + 1}`}
                  </div>
                  <div className="user-info">
                    <div className="username">{row.user?.username}</div>
                    <div className="user-stats">
                      <span className="streak">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', marginRight: '4px'}}>
                          <path d="M12 2C12 2 8 6 8 12C8 16.4183 9.79086 18 12 18C14.2091 18 16 16.4183 16 12C16 6 12 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                          <path d="M12 6C12 6 10 8 10 11C10 12.6569 10.6716 14 12 14C13.3284 14 14 12.6569 14 11C14 8 12 6 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                        </svg>
                        {row.current_streak} days
                      </span>
                      <span className="completions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', marginRight: '4px'}}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {row.weekly_completions} this week
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed Filter Tabs */}
      <div className="feed-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', marginRight: '6px'}}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            All Community
          </button>
          <button 
            className={`filter-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', marginRight: '6px'}}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="m22 21-3-3m0 0a2 2 0 0 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Friends Only
          </button>
          <button 
            className={`filter-tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display: 'inline-block', marginRight: '6px'}}>
              <path d="m7 11 5-7 5 7M12 18l3-3-3-3-3 3 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trending
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="search-results">
          <h2 className="section-title">Search Results ({searchResults.length})</h2>
          <div className="user-cards">
            {searchResults.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.first_name ? 
                      user.first_name.charAt(0).toUpperCase() : 
                      user.username.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{user.username}</h3>
                    {(user.first_name || user.last_name) && (
                      <p className="user-full-name">
                        {user.first_name} {user.last_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="user-actions">
                  <button 
                    className={`btn ${user.followed ? 'btn-secondary' : 'btn-primary post-button'}`}
                    onClick={() => user.followed ? unfollow(user.id) : follow(user.id)}
                  >
                    {user.followed ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Section */}
      <div className="feed-section">
        <h2 className="section-title">🌱 Recent Activity</h2>
        
        {feed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌿</div>
            <h3 className="empty-title">Your garden is quiet</h3>
            <p className="empty-description">
              Follow community members or complete habits to see inspiring updates here.
            </p>
            <div className="empty-actions">
              <button 
                className="btn btn-primary find-friends-button"
                onClick={() => document.querySelector('.form-input')?.focus()}
              >
                Find Friends
              </button>
              <Link className="btn btn-secondary" to="/challenges">
                Join Challenges
              </Link>
            </div>
          </div>
        ) : (
          <div className="feed-items">
            {feed.map(item => (
              <SocialFeedItem key={item.id} item={item} onAction={fetchFeed} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-6) var(--space-4);
        }

        .page-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .page-title {
          font-size: var(--text-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .page-description {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .search-section {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          margin-bottom: var(--space-6);
        }

        .search-form {
          margin-bottom: var(--space-4);
        }

        .search-group {
          display: flex;
          gap: var(--space-3);
          align-items: center;
        }

        .search-group .form-input {
          flex: 1;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
        }

        .search-results {
          margin-bottom: var(--space-6);
        }

        .section-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-4);
        }

        .user-cards {
          display: grid;
          gap: var(--space-4);
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .user-card {
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          background: var(--green-500);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-semibold);
          font-size: var(--text-lg);
        }

        .user-name {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin: 0;
        }

        .user-full-name {
          color: var(--text-secondary);
          font-size: var(--text-sm);
          margin: 0;
        }

        .feed-section {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-8);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-4);
        }

        .empty-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .empty-description {
          color: var(--text-secondary);
          margin-bottom: var(--space-6);
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .empty-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: center;
          flex-wrap: wrap;
        }

        .feed-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: var(--space-4);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-primary);
          border-top: 3px solid var(--green-500);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .community-stats-section {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          margin-bottom: var(--space-6);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          background: var(--bg-base);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          text-align: center;
          border: 1px solid var(--border-secondary);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          min-height: 140px;
          height: auto;
          overflow: visible;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--green-300);
        }

        .stat-icon {
          color: var(--green-600);
          margin-bottom: var(--space-3);
          opacity: 0.8;
        }

        .stat-icon svg {
          width: 32px;
          height: 32px;
          stroke-width: 1.5;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--space-2);
          line-height: 1.4;
          word-wrap: break-word;
          text-align: center;
          max-width: 100%;
        }

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--green-600);
          line-height: 1.1;
          white-space: nowrap;
          overflow: visible;
          text-overflow: visible;
          margin: 0;
        }

        .leaderboard-section {
          border-top: 1px solid var(--border-secondary);
          padding-top: var(--space-6);
        }

        .leaderboard {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .leaderboard-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background: var(--bg-base);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          border: 1px solid var(--border-secondary);
        }

        .rank {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-bold);
          min-width: 40px;
          text-align: center;
        }

        .username {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .user-stats {
          display: flex;
          gap: var(--space-3);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .rank-medal {
          display: inline-block;
        }

        .rank-medal.first {
          color: var(--green-600);
        }

        .rank-medal.second {
          color: var(--green-500);
        }

        .rank-medal.third {
          color: var(--green-400);
        }

        .feed-filters {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          margin-bottom: var(--space-6);
        }

        .filter-tabs {
          display: flex;
          gap: var(--space-2);
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-tab {
          background: var(--bg-base);
          border: 1px solid var(--border-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-2) var(--space-4);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
        }

        .filter-tab:hover {
          background: var(--forest-50);
          color: var(--forest-600);
          border-color: var(--forest-200);
        }

        .filter-tab.active {
          background: var(--forest-500);
          color: white;
          border-color: var(--forest-500);
        }

        /* Search button color fixes */
        .search-button {
          background: var(--forest-500);
          color: white;
          border-color: var(--forest-500);
        }

        .search-button:hover:not(:disabled) {
          background: var(--forest-600);
          color: white;
          border-color: var(--forest-600);
        }

        .search-button:active:not(:disabled) {
          background: var(--forest-700);
          color: white;
          border-color: var(--forest-700);
        }

        /* Post button and Follow/Following button color fixes */
        .post-button.btn-primary {
          background: var(--forest-500);
          color: white;
          border-color: var(--forest-500);
        }

        .post-button.btn-primary:hover:not(:disabled) {
          background: var(--forest-600);
          color: white;
          border-color: var(--forest-600);
        }

        .post-button.btn-primary:active:not(:disabled) {
          background: var(--forest-700);
          color: white;
          border-color: var(--forest-700);
        }

        /* Find Friends button color fixes */
        .find-friends-button {
          background: var(--forest-500);
          color: white;
          border-color: var(--forest-500);
        }

        .find-friends-button:hover:not(:disabled) {
          background: var(--forest-600);
          color: white;
          border-color: var(--forest-600);
        }

        .find-friends-button:active:not(:disabled) {
          background: var(--forest-700);
          color: white;
          border-color: var(--forest-700);
        }

        @media (max-width: 768px) {
          .search-group {
            flex-direction: column;
          }

          .search-group .form-input {
            width: 100%;
          }

          .user-cards {
            grid-template-columns: 1fr;
          }

          .empty-actions {
            flex-direction: column;
            align-items: center;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: var(--space-3);
          }

          .stat-card {
            min-height: 120px;
            padding: var(--space-4);
          }

          .stat-icon svg {
            width: 28px;
            height: 28px;
          }

          .stat-value {
            font-size: var(--text-2xl);
          }

          .stat-label {
            font-size: var(--text-xs);
          }

          .filter-tabs {
            justify-content: stretch;
          }

          .filter-tab {
            flex: 1;
            text-align: center;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SocialFeed;
