import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';
import BadgeCard from '../components/BadgeCard';
import StreakFlame from '../components/StreakFlame';
import '../styles/premium-design-system.css';
import '../styles/premium-components.css';
import '../styles/premium-mobile.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [stats, setStats] = useState({
    total_habits: 0,
    active_habits: 0,
    total_completions: 0,
    average_streak: 0,
    completion_rate: 0,
    this_week_completions: 0,
    this_month_completions: 0,
  });
  const [recentHabits, setRecentHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);

  const fetchDashboardData = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      const [statsData, habitsData, profileData, badgesData] = await Promise.all([
        api.getStatistics(),
        api.getHabits({ ordering: '-updated_at', limit: 6 }),
        api.getProfile(),
        api.getUserBadges()
      ]);
      
      setStats(statsData);
      setRecentHabits(habitsData.results || habitsData || []);
      setProfile(profileData);
      setBadges(badgesData || []);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      if (retryCount < 3) {
        setTimeout(() => fetchDashboardData(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        showError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.username || user?.email?.split('@')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Small changes, big results 🌱",
      "Progress over perfection ✨",
      "You're building something amazing 🚀",
      "Every day is a new opportunity 🌅",
      "Your habits shape your future 🎯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (loading) {
    return (
      <div className="dashboard-premium">
        <div className="container">
          <div className="dashboard-content">
            {/* Loading State */}
            <div className="dashboard-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="loading-skeleton" style={{height: '200px'}}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-premium">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <div className="animate-fade-in">
            <h1 className="dashboard-title">{getGreeting()}</h1>
            <p className="dashboard-subtitle">{getMotivationalMessage()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="container">
          {/* Quick Stats */}
          <div className="dashboard-grid animate-fade-in">
            {[
              {
                icon: '🎯',
                value: stats.active_habits || 0,
                label: 'Active Habits',
                change: '+2 this week',
                positive: true
              },
              {
                icon: '🔥',
                value: Math.round(stats.average_streak || 0),
                label: 'Average Streak',
                change: `${stats.completion_rate || 0}% success rate`,
                positive: stats.completion_rate >= 70
              },
              {
                icon: '✅',
                value: stats.this_week_completions || 0,
                label: 'This Week',
                change: `${stats.this_month_completions || 0} this month`,
                positive: true
              },
              {
                icon: '📈',
                value: `${Math.round(stats.completion_rate || 0)}%`,
                label: 'Success Rate',
                change: stats.completion_rate >= 70 ? 'Excellent!' : 'Keep going!',
                positive: stats.completion_rate >= 70
              }
            ].map((stat, index) => (
              <div key={index} className="stats-card-premium animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="stats-icon">{stat.icon}</div>
                <div className="stats-value">{stat.value}</div>
                <div className="stats-label">{stat.label}</div>
                <div className={`stats-change ${stat.positive ? 'positive' : 'negative'}`}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.positive ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M19 14l-7-7m0 0l-7 7m7-7v18"} />
                  </svg>
                  <span>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Habits */}
          <section style={{marginTop: 'var(--space-16)'}}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-8)'
            }}>
              <div>
                <h2 className="text-2xl font-bold text-primary">Your Habits</h2>
                <p className="text-secondary">Track your progress and build consistency</p>
              </div>
              <Link to="/habits" className="btn btn-primary">
                <span>View All</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {recentHabits.length > 0 ? (
              <div className="dashboard-grid">
                {recentHabits.slice(0, 6).map((habit, index) => (
                  <div key={habit.id} className="habit-card-premium animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="habit-card-header">
                      <div className="habit-icon">{habit.icon || '⭐'}</div>
                      <div className="habit-actions">
                        <button
                          className="habit-action-btn tooltip"
                          data-tooltip="Mark as done"
                          onClick={() => {/* Handle completion */}}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          className="habit-action-btn tooltip"
                          data-tooltip="Edit habit"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="habit-title">{habit.title}</h3>
                    <p className="habit-description">{habit.description}</p>
                    
                    <div className="habit-progress">
                      <div className="habit-progress-bar">
                        <div 
                          className="habit-progress-fill" 
                          style={{width: `${Math.min(100, Math.round(habit.completion_rate || 0))}%`}}
                        ></div>
                      </div>
                      <div className="habit-progress-text">
                        {Math.round(habit.completion_rate || 0)}% completion rate
                      </div>
                    </div>
                    
                    <div className="habit-stats">
                      <div className="habit-streak">
                        <StreakFlame value={habit.current_streak || 0} />
                        <span>{habit.current_streak || 0} day streak</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{
                padding: 'var(--space-16)',
                textAlign: 'center',
                background: 'var(--gradient-hero)'
              }}>
                <div style={{fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)'}}>🌱</div>
                <h3 className="text-xl font-semibold text-primary" style={{marginBottom: 'var(--space-2)'}}>
                  Ready to build your first habit?
                </h3>
                <p className="text-secondary" style={{marginBottom: 'var(--space-6)'}}>
                  Start small, stay consistent, and watch your life transform one habit at a time.
                </p>
                <Link to="/habits" className="btn btn-primary btn-lg">
                  <span>Create Your First Habit</span>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Link>
              </div>
            )}
          </section>

          {/* Badges & Achievements */}
          {badges.length > 0 && (
            <section style={{marginTop: 'var(--space-16)'}}>
              <div style={{marginBottom: 'var(--space-8)'}}>
                <h2 className="text-2xl font-bold text-primary">Achievements</h2>
                <p className="text-secondary">Celebrate your milestones and progress</p>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 'var(--space-4)'
              }}>
                {badges.slice(0, 4).map((badge, index) => (
                  <BadgeCard 
                    key={badge.id || index} 
                    badge={badge} 
                    className="animate-scale-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section style={{marginTop: 'var(--space-16)'}}>
            <div className="card" style={{
              padding: 'var(--space-8)',
              background: 'var(--gradient-secondary)',
              border: '1px solid var(--color-primary-200)'
            }}>
              <h2 className="text-xl font-semibold text-primary" style={{marginBottom: 'var(--space-4)'}}>
                Quick Actions
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)'
              }}>
                <Link to="/habits" className="btn btn-secondary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Habit</span>
                </Link>
                <Link to="/profile" className="btn btn-secondary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>View Profile</span>
                </Link>
                <Link to="/challenges" className="btn btn-secondary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Join Challenge</span>
                </Link>
                <button className="btn btn-secondary" onClick={fetchDashboardData}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </section>

          {/* Motivational Quote */}
          <section style={{marginTop: 'var(--space-16)', marginBottom: 'var(--space-16)'}}>
            <div className="card" style={{
              padding: 'var(--space-8)',
              textAlign: 'center',
              background: 'var(--gradient-hero)',
              border: 'none'
            }}>
              <blockquote style={{
                fontSize: 'var(--text-lg)',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)',
                lineHeight: 'var(--leading-relaxed)'
              }}>
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </blockquote>
              <cite style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
                fontWeight: 'var(--font-weight-medium)'
              }}>
                — Aristotle
              </cite>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;