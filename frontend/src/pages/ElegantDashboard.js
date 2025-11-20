import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';
import BadgeShowcase from '../components/BadgeShowcase';

const ElegantDashboard = () => {
  const { user } = useAuth();
  const { showError, showSuccess } = useNotification();
  
  const [stats, setStats] = useState({
    total_habits: 0,
    active_habits: 0,
    completed_today: 0,
    current_streak: 0,
    total_points: 0,
    completion_rate: 0
  });
  const [todayHabits, setTodayHabits] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple endpoints in parallel
      const [habitsResponse, profileResponse, todayResponse, statsResponse, weeklyResponse, monthlyResponse] = await Promise.all([
        api.getHabits().catch((err) => { console.error('getHabits error:', err); return { results: [] }; }),
        api.getProfile().catch((err) => { console.error('getProfile error:', err); return null; }),
        api.getTodayHabits().catch((err) => { console.error('getTodayHabits error:', err); return []; }),
        api.getStatistics().catch((err) => { console.error('getStatistics error:', err); return {}; }),
        api.getWeeklyAnalytics().catch((err) => { console.error('getWeeklyAnalytics error:', err); return { data: [] }; }),
        api.getMonthlyAnalytics().catch((err) => { console.error('getMonthlyAnalytics error:', err); return { data: [] }; })
      ]);

      // Handle paginated response from API
      const habits = habitsResponse?.results || habitsResponse || [];
      const profile = profileResponse?.user || profileResponse;
      const todayHabits = todayResponse || [];
      const userStats = statsResponse || {};
      const weeklyAnalytics = weeklyResponse?.data || [];
      const monthlyAnalytics = monthlyResponse?.data || [];

      // console.log('Dashboard data fetched:', { 
        habits: habits.length, 
        todayHabits: todayHabits.length,
        userStats,
        weeklyAnalytics: weeklyAnalytics.length,
        monthlyAnalytics: monthlyAnalytics.length
      });

      // Use stats from API or calculate from habits
      const completedToday = todayHabits.filter(h => h.completed_today).length;
      const activeHabits = habits.filter(h => h.is_active).length;
      const calculatedCompletionRate = activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0;
      
      const calculatedStats = {
        total_habits: habits.length,
        active_habits: activeHabits,
        completed_today: completedToday,
        current_streak: habits.length > 0 ? Math.max(0, ...habits.map(h => h.current_streak || 0)) : 0,
        total_points: profile?.total_points || 0,
        completion_rate: userStats.completion_rate !== undefined ? userStats.completion_rate : calculatedCompletionRate
      };
      
      // Merge API stats with calculated stats
      setStats({ ...calculatedStats, ...userStats });
      setTodayHabits(todayHabits.slice(0, 6)); // Show only first 6 habits
      setWeeklyData(weeklyAnalytics);
      setMonthlyData(monthlyAnalytics);

      // Mock recent activity for now
      setRecentActivity([
        { id: 1, type: 'completed', habit: 'Morning Workout', time: '2 hours ago' },
        { id: 2, type: 'streak', habit: 'Reading', streak: 7, time: '1 day ago' },
        { id: 3, type: 'badge', name: 'Early Bird', time: '3 days ago' },
        { id: 4, type: 'completed', habit: 'Meditation', time: '1 week ago' }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const markHabitComplete = async (habitId) => {
    try {
      await api.createHabitEntry(habitId);
      showSuccess('Habit completed! Great job! 🎉');
      
      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to mark habit complete:', error);
      showError('Failed to mark habit as complete');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.first_name || user?.username || 'there';
    
    if (hour < 12) return `Good morning, ${name}! 🌅`;
    if (hour < 18) return `Good afternoon, ${name}! ☀️`;
    return `Good evening, ${name}! 🌙`;
  };

  const getMotivationalMessage = () => {
    const { completion_rate, current_streak } = stats;
    
    if (completion_rate >= 80) return "You're crushing it today! Keep up the amazing work! 🔥";
    if (completion_rate >= 50) return "Great progress today! You're doing awesome! 💪";
    if (current_streak >= 7) return `${current_streak} day streak! You're building momentum! ⚡`;
    return "Every small step counts. Let's make today great! ✨";
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container">
            <div className="grid grid-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="loading-card">
                  <div className="loading-line short" />
                  <div className="loading-line long" />
                </div>
              ))}
            </div>
            
            <div className="grid grid-2" style={{ gap: 'var(--space-2xl)' }}>
              <div className="loading-card">
                <div className="loading-line" />
                <div className="loading-line short" />
                <div className="loading-line" />
              </div>
              <div className="loading-card">
                <div className="loading-line" />
                <div className="loading-line short" />
                <div className="loading-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container">
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <h2 className="empty-state-title">Something went wrong</h2>
              <p className="empty-state-description">{error}</p>
              <button className="btn btn-primary" onClick={fetchDashboardData}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-content">
        <div className="container">
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="page-title" style={{ textAlign: 'left', marginBottom: 'var(--space-sm)' }}>
              {getGreeting()}
            </h1>
            <p className="page-subtitle" style={{ textAlign: 'left' }}>
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-4 mb-8 stagger-animation">
            <div className="stat-card hover-lift">
              <div className="stat-icon">
                <span style={{ fontSize: 'var(--font-size-xl)' }}>🎯</span>
              </div>
              <div className="stat-value">{stats.total_habits}</div>
              <div className="stat-label">Total Habits</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">
                <span style={{ fontSize: 'var(--font-size-xl)' }}>✅</span>
              </div>
              <div className="stat-value">{stats.completed_today}</div>
              <div className="stat-label">Completed Today</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">
                <span style={{ fontSize: 'var(--font-size-xl)' }}>🔥</span>
              </div>
              <div className="stat-value">{stats.current_streak}</div>
              <div className="stat-label">Current Streak</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">
                <span style={{ fontSize: 'var(--font-size-xl)' }}>⭐</span>
              </div>
              <div className="stat-value">{stats.total_points}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <h2 className="card-title">Today's Progress</h2>
              <p className="card-subtitle">
                {stats.completed_today} of {stats.active_habits} habits completed ({stats.completion_rate}%)
              </p>
            </div>
            <div className="card-body">
              <div className="progress" style={{ height: '12px', marginBottom: 'var(--space-md)' }}>
                <div 
                  className="progress-bar" 
                  style={{ width: `${stats.completion_rate}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  Keep going! You're doing great!
                </span>
                <Link to="/habits" className="btn btn-ghost btn-sm">
                  View All Habits →
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--space-2xl)' }}>
            {/* Today's Habits */}
            <div className="card animate-fade-in-left">
              <div className="card-header">
                <h2 className="card-title">Today's Habits</h2>
                <p className="card-subtitle">Quick actions for your daily routine</p>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {todayHabits.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontSize: 'var(--font-size-4xl)' }}>📝</div>
                    <h3 className="empty-state-title">No habits yet</h3>
                    <p className="empty-state-description">
                      Start building great habits today!
                    </p>
                    <Link to="/habits" className="btn btn-primary">
                      Create Your First Habit
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: 0 }}>
                    {todayHabits.map((habit, index) => (
                      <div
                        key={habit.id}
                        className="stagger-animation"
                        style={{
                          padding: 'var(--space-lg)',
                          borderBottom: index < todayHabits.length - 1 ? '1px solid var(--border-primary)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div style={{ fontSize: 'var(--font-size-xl)' }}>
                            {habit.icon || '🎯'}
                          </div>
                          <div>
                            <h4 style={{
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--text-primary)',
                              marginBottom: 'var(--space-xs)'
                            }}>
                              {habit.title}
                            </h4>
                            <p style={{
                              fontSize: 'var(--font-size-sm)',
                              color: 'var(--text-secondary)',
                              margin: 0
                            }}>
                              {habit.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        
                        {habit.completed_today ? (
                          <div className="badge badge-success">
                            <span>✓</span>
                            Completed
                          </div>
                        ) : (
                          <button
                            onClick={() => markHabitComplete(habit.id)}
                            className="btn btn-primary btn-sm"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                      <Link to="/habits" className="btn btn-ghost">
                        View All Habits →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Charts */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                <AnalyticsChart 
                  data={weeklyData} 
                  type="weekly" 
                  title="Weekly Progress" 
                />
                <BadgeShowcase />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card animate-fade-in-right">
              <div className="card-header">
                <h2 className="card-title">Recent Activity</h2>
                <p className="card-subtitle">Your latest achievements</p>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {recentActivity.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ fontSize: 'var(--font-size-4xl)' }}>📊</div>
                    <h3 className="empty-state-title">No activity yet</h3>
                    <p className="empty-state-description">
                      Complete some habits to see your progress here!
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: 0 }}>
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="stagger-animation"
                        style={{
                          padding: 'var(--space-lg)',
                          borderBottom: index < recentActivity.length - 1 ? '1px solid var(--border-primary)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-md)'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-full)',
                          background: activity.type === 'completed' ? 'var(--color-success)' : 
                                     activity.type === 'streak' ? 'var(--color-warning)' : 
                                     'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 'var(--font-size-lg)'
                        }}>
                          {activity.type === 'completed' && '✓'}
                          {activity.type === 'streak' && '🔥'}
                          {activity.type === 'badge' && '🏆'}
                        </div>
                        
                        <div className="flex-1">
                          {activity.type === 'completed' && (
                            <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                              Completed {activity.habit}
                            </p>
                          )}
                          {activity.type === 'streak' && (
                            <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                              {activity.streak} day streak on {activity.habit}!
                            </p>
                          )}
                          {activity.type === 'badge' && (
                            <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)' }}>
                              Earned "{activity.name}" badge!
                            </p>
                          )}
                          <p style={{
                            margin: 0,
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--text-secondary)'
                          }}>
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                      <Link to="/social" className="btn btn-ghost">
                        View Activity Feed →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="card-body text-center">
              <h2 className="card-title">Ready to build more habits?</h2>
              <p className="card-text">
                Explore different areas of your life and create meaningful habits that stick.
              </p>
              <div className="flex gap-4 justify-center flex-wrap mt-6">
                <Link to="/habits" className="btn btn-primary">
                  <span>➕</span>
                  Create New Habit
                </Link>
                <Link to="/challenges" className="btn btn-secondary">
                  <span>🏆</span>
                  Join Challenge
                </Link>
                <Link to="/social" className="btn btn-ghost">
                  <span>👥</span>
                  Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantDashboard;