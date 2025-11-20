import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import PlantGrowth from '../components/PlantGrowth';

const NatureDashboard = () => {
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
      const [habitsResponse, profileResponse, todayResponse, statsResponse] = await Promise.all([
        api.getHabits().catch((err) => { console.error('getHabits error:', err); return { results: [] }; }),
        api.getProfile().catch((err) => { console.error('getProfile error:', err); return null; }),
        api.getTodayHabits().catch((err) => { console.error('getTodayHabits error:', err); return []; }),
        api.getStatistics().catch((err) => { console.error('getStatistics error:', err); return {}; })
      ]);

      // Handle paginated response from API
      const habits = habitsResponse?.results || habitsResponse || [];
      const profile = profileResponse?.user || profileResponse;
      const todayHabits = todayResponse || [];
      const userStats = statsResponse || {};

      // Calculate stats
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
      
      setStats({ ...calculatedStats, ...userStats });
      setTodayHabits(todayHabits.slice(0, 6));

      // Mock recent activity
      setRecentActivity([
        { id: 1, type: 'completed', habit: 'Morning Meditation', time: '2 hours ago', icon: '🧘' },
        { id: 2, type: 'streak', habit: 'Daily Walk', streak: 7, time: '1 day ago', icon: '🚶' },
        { id: 3, type: 'badge', name: 'Early Bird', time: '3 days ago', icon: '🌅' },
        { id: 4, type: 'completed', habit: 'Reading', time: '1 week ago', icon: '📚' }
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
      showSuccess('🌱 Habit completed! Your garden grows! 🎉');
      
      // Add celebration animation to the habit
      const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
      if (habitElement) {
        habitElement.classList.add('celebrate-completion');
        setTimeout(() => {
          habitElement.classList.remove('celebrate-completion');
        }, 1000);
      }
      
      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to mark habit complete:', error);
      showError('Failed to mark habit as complete');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.first_name || user?.username || 'gardener';
    
    if (hour < 6) return `Good night, ${name} 🌙`;
    if (hour < 12) return `Good morning, ${name}! 🌅`;
    if (hour < 18) return `Good afternoon, ${name}! ☀️`;
    if (hour < 22) return `Good evening, ${name}! 🌇`;
    return `Good night, ${name} 🌙`;
  };

  const getMotivationalMessage = () => {
    const { completion_rate, current_streak, completed_today } = stats;
    
    if (completion_rate >= 90) return "🌟 Your garden is flourishing magnificently! You're a habit master!";
    if (completion_rate >= 75) return "🌿 Excellent progress today! Your habits are growing strong!";
    if (completion_rate >= 50) return "🌱 Great work! You're nurturing your garden well!";
    if (current_streak >= 7) return `🔥 ${current_streak} day streak! Your consistency is paying off!`;
    if (completed_today > 0) return "✨ Every small step helps your garden grow!";
    return "🌱 Ready to plant some good habits today?";
  };

  const getProgressRingStyle = (percentage) => {
    const circumference = 2 * Math.PI * 36; // radius = 36
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return {
      strokeDasharray,
      strokeDashoffset,
      transition: 'stroke-dashoffset 0.7s cubic-bezier(0.23, 1, 0.32, 1)'
    };
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content">
          <div className="container">
            {/* Loading state with nature theme */}
            <div className="dashboard-header mb-8">
              <div className="loading-skeleton" style={{ width: '300px', height: '40px', marginBottom: 'var(--space-3)' }}></div>
              <div className="loading-skeleton" style={{ width: '400px', height: '24px' }}></div>
            </div>
            
            <div className="dashboard-stats stagger-container">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="loading-skeleton" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-full)', margin: '0 auto var(--space-4)' }}></div>
                  <div className="loading-skeleton" style={{ width: '40px', height: '32px', margin: '0 auto var(--space-2)' }}></div>
                  <div className="loading-skeleton" style={{ width: '80px', height: '16px', margin: '0 auto' }}></div>
                </div>
              ))}
            </div>
            
            <div className="dashboard-grid">
              <div className="card">
                <div className="card-header">
                  <div className="loading-skeleton" style={{ width: '150px', height: '24px', marginBottom: 'var(--space-2)' }}></div>
                  <div className="loading-skeleton" style={{ width: '200px', height: '16px' }}></div>
                </div>
                <div className="card-body">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-200 last:border-b-0">
                      <div className="loading-skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-xl)' }}></div>
                      <div className="flex-1">
                        <div className="loading-skeleton" style={{ width: '120px', height: '16px', marginBottom: 'var(--space-1)' }}></div>
                        <div className="loading-skeleton" style={{ width: '180px', height: '14px' }}></div>
                      </div>
                      <div className="loading-skeleton" style={{ width: '80px', height: '36px', borderRadius: 'var(--radius-lg)' }}></div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <div className="card-header">
                  <div className="loading-skeleton" style={{ width: '130px', height: '24px', marginBottom: 'var(--space-2)' }}></div>
                  <div className="loading-skeleton" style={{ width: '160px', height: '16px' }}></div>
                </div>
                <div className="card-body">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-200 last:border-b-0">
                      <div className="loading-skeleton" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)' }}></div>
                      <div className="flex-1">
                        <div className="loading-skeleton" style={{ width: '140px', height: '16px', marginBottom: 'var(--space-1)' }}></div>
                        <div className="loading-skeleton" style={{ width: '100px', height: '14px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="empty-state-icon">🌿</div>
              <h2 className="empty-state-title">Oops! Something went wrong</h2>
              <p className="empty-state-description">{error}</p>
              <button className="btn btn-primary" onClick={fetchDashboardData}>
                🔄 Try Again
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
          <div className="dashboard-header animate-fade-in-up">
            <h1 className="dashboard-greeting">
              {getGreeting()}
            </h1>
            <p className="dashboard-subtitle">
              {getMotivationalMessage()}
            </p>
          </div>

          {/* Stats Garden */}
          <div className="dashboard-stats grid-stagger">
            <div className="stat-card hover-lift">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{stats.total_habits}</div>
              <div className="stat-label">Total Habits</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">✅</div>
              <div className="stat-value">{stats.completed_today}</div>
              <div className="stat-label">Completed Today</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{stats.current_streak}</div>
              <div className="stat-label">Current Streak</div>
            </div>

            <div className="stat-card hover-lift">
              <div className="stat-icon">🌟</div>
              <div className="stat-value">{stats.completion_rate}%</div>
              <div className="stat-label">Today's Progress</div>
            </div>
          </div>

          {/* Daily Progress Ring */}
          <div className="card card-nature mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-body text-center">
              <h3 className="heading-4 mb-6">Today's Garden Growth</h3>
              
              <div className="flex items-center justify-center gap-8 mb-6">
                {/* Progress Ring */}
                <div className="progress-ring">
                  <svg width="80" height="80" className="transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="var(--color-neutral-200)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="var(--color-primary-500)"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      style={getProgressRingStyle(stats.completion_rate)}
                    />
                  </svg>
                  <div className="progress-ring-content">
                    <div className="progress-ring-value">{stats.completion_rate}%</div>
                    <div className="progress-ring-label">Complete</div>
                  </div>
                </div>
                {/* Gamified plant growth visual tied to completion rate */}
                <PlantGrowth level={stats.completion_rate} size={80} />
                
                <div className="flex flex-col gap-2">
                  <div className="body-large font-semibold text-primary">
                    {stats.completed_today} of {stats.active_habits} habits
                  </div>
                  <div className="body-small">
                    {stats.active_habits - stats.completed_today > 0 
                      ? `${stats.active_habits - stats.completed_today} more to go!` 
                      : 'All done for today! 🎉'
                    }
                  </div>
                </div>
              </div>
              
              <Link to="/habits" className="btn btn-secondary">
                🌱 Tend to Your Garden
              </Link>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Today's Habits Garden */}
            <div className="card animate-fade-in-left">
              <div className="card-header">
                <h3 className="heading-4 mb-2">Today's Garden</h3>
                <p className="body-small">Your daily habit collection</p>
              </div>
              <div className="card-body p-0">
                {todayHabits.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🌱</div>
                    <h4 className="empty-state-title">Your garden awaits</h4>
                    <p className="empty-state-description">
                      Plant your first habit and watch your garden flourish!
                    </p>
                    <Link to="/habits" className="btn btn-primary">
                      🌱 Plant Your First Habit
                    </Link>
                  </div>
                ) : (
                  <div className="stagger-container">
                    {todayHabits.map((habit, index) => (
                      <div
                        key={habit.id}
                        data-habit-id={habit.id}
                        className="habit-card-compact p-4 border-b border-neutral-200 last:border-b-0"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="habit-icon"
                            style={{
                              background: habit.completed_today 
                                ? 'var(--gradient-primary)' 
                                : 'var(--color-primary-50)',
                              borderColor: habit.completed_today 
                                ? 'var(--color-primary-600)' 
                                : 'var(--color-primary-200)',
                              color: habit.completed_today ? 'white' : 'var(--color-primary-600)'
                            }}
                          >
                            {habit.icon || '🎯'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h5 className="habit-title">
                              {habit.title}
                              {habit.is_micro_habit && (
                                <span className="badge badge-micro ml-2">⚡ 2m</span>
                              )}
                            </h5>
                            <p className="habit-description">{habit.description || 'Building this habit step by step'}</p>
                            <div className="habit-meta">
                              <span className="badge badge-secondary">{habit.category}</span>
                              {habit.current_streak > 0 && (
                                <span className="streak-flame">
                                  🔥 {habit.current_streak} days
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {habit.completed_today ? (
                            <div className="badge badge-success">
                              ✓ Completed
                            </div>
                          ) : (
                            <button
                              onClick={() => markHabitComplete(habit.id)}
                              className="habit-checkbox hover-grow"
                              aria-label="Mark habit as complete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 text-center border-t border-neutral-100">
                      <Link to="/habits" className="btn btn-ghost">
                        View All Habits →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Growth Activity */}
            <div className="card animate-fade-in-right">
              <div className="card-header">
                <h3 className="heading-4 mb-2">Recent Growth</h3>
                <p className="body-small">Your latest achievements</p>
              </div>
              <div className="card-body p-0">
                {recentActivity.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h4 className="empty-state-title">No activity yet</h4>
                    <p className="empty-state-description">
                      Complete some habits to see your growth here!
                    </p>
                  </div>
                ) : (
                  <div className="stagger-container">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 p-4 border-b border-neutral-200 last:border-b-0 hover-lift"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{
                            background: activity.type === 'completed' ? 'var(--color-primary-100)' : 
                                       activity.type === 'streak' ? 'var(--color-earth-100)' : 
                                       'var(--color-sky-100)',
                            color: activity.type === 'completed' ? 'var(--color-primary-700)' : 
                                  activity.type === 'streak' ? 'var(--color-earth-700)' : 
                                  'var(--color-sky-700)'
                          }}
                        >
                          {activity.icon}
                        </div>
                        
                        <div className="flex-1">
                          {activity.type === 'completed' && (
                            <p className="font-medium text-primary mb-1">
                              Completed {activity.habit}
                            </p>
                          )}
                          {activity.type === 'streak' && (
                            <p className="font-medium text-primary mb-1">
                              🔥 {activity.streak} day streak on {activity.habit}!
                            </p>
                          )}
                          {activity.type === 'badge' && (
                            <p className="font-medium text-primary mb-1">
                              🏆 Earned "{activity.name}" badge!
                            </p>
                          )}
                          <p className="body-small text-tertiary">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-4 text-center border-t border-neutral-100">
                      <Link to="/social" className="btn btn-ghost">
                        View All Activity →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Garden Actions */}
          <div className="card card-nature mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-body text-center">
              <h3 className="heading-3 mb-4">Grow Your Garden</h3>
              <p className="body-large text-secondary mb-8">
                Plant new habits, join challenges, and connect with fellow gardeners.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/habits" className="btn btn-primary hover-grow">
                  🌱 Plant New Habit
                </Link>
                <Link to="/challenges" className="btn btn-secondary hover-grow">
                  🏆 Join Challenge
                </Link>
                <Link to="/social" className="btn btn-ghost hover-grow">
                  👥 Community Garden
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NatureDashboard;