import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

// Simple Add Habit Form Component
const AddHabitForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'health',
    frequency: 'daily'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form submitted (debug)
    
    if (formData.name.trim()) {
      setIsSubmitting(true);
      try {
        // Calling onSubmit handler
        await onSubmit(formData);
        // onSubmit completed
      } catch (error) {
        console.error('Form submission error:', error);
        // Don't throw the error here, let the parent function handle it
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Form validation failed - name is required
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-habit-form">
      <div className="form-group">
        <label htmlFor="habit-name">Habit Name *</label>
        <input
          id="habit-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter habit name..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="habit-description">Description</label>
        <textarea
          id="habit-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your habit..."
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="habit-category">Category</label>
        <select
          id="habit-category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="health">Health</option>
          <option value="productivity">Productivity</option>
          <option value="learning">Learning</option>
          <option value="fitness">Fitness</option>
          <option value="mindfulness">Mindfulness</option>
          <option value="social">Social</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
};

const ModernForestDashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  // Fetch user's habits from API
  const fetchHabits = async () => {
    try {
      // Fetching habits from API...
      setIsLoading(true);
      
      // Get all user habits, not just today's habits
      const response = await api.getHabits();
      // All habits response
      
      // Also get today's completion status
      const todayResponse = await api.getTodayHabits();
      // Today habits response
      
      // Create a map of today's completion status
      const todayCompletions = {};
      (todayResponse || []).forEach(habit => {
        todayCompletions[habit.id] = habit.completed_today || false;
      });
      
      // Map API response to component format
      const mappedHabits = (response?.results || response || []).map(habit => ({
        id: habit.id,
        name: habit.title, // API uses 'title', component expects 'name'
        description: habit.description || `Track your ${habit.title.toLowerCase()} progress`,
        category: habit.category || 'General',
        streak: habit.current_streak || 0,
        completed: todayCompletions[habit.id] || false,
        progress: todayCompletions[habit.id] ? 1 : 0, // Simple progress for today
        target: 7, // Weekly target
        color_code: habit.color_code
      }));
      
      // Mapped habits (derived from API response)
      setHabits(mappedHabits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Habits',
        message: 'Failed to load your habits. Please try again.'
      });
      setHabits([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();

    // Update time every minute
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timeTimer);
    };
  }, []);

  const toggleHabit = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    try {
      if (!habit.completed) {
        // Mark habit as complete
        await api.createHabitEntry(habitId);
        
        // Update local state optimistically
        setHabits(prev => prev.map(h => {
          if (h.id === habitId) {
            const newStreak = h.streak + 1;
            addNotification({
              type: 'success',
              title: 'Habit Completed!',
              message: `Great job completing "${h.name}"! Your forest grows stronger.`
            });
            return {
              ...h,
              completed: true,
              streak: newStreak,
              progress: Math.min((h.progress || 0) + 1, h.target || 7)
            };
          }
          return h;
        }));
      } else {
        // For unchecking, we'd need a different API endpoint
        // For now, just show a message that it's already completed
        addNotification({
          type: 'info',
          title: 'Habit Already Completed',
          message: 'This habit is already completed for today!'
        });
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update habit. Please try again.'
      });
    }
  };

  const handleAddHabit = () => {
    // Open Add Habit modal
    setShowAddHabitModal(true);
  };

  const handleQuickAction = (action) => {
    // Quick action clicked
    
    switch (action) {
      case 'analytics':
        // Navigate to analytics/stats page
        addNotification({
          type: 'info',
          title: 'Analytics',
          message: 'Navigating to your progress analytics...'
        });
        // You can replace this with actual navigation
        window.location.href = '/analytics';
        break;
        
      case 'community':
        // Navigate to community page (social feed)
        addNotification({
          type: 'info',
          title: 'Community',
          message: 'Opening community page...'
        });
        // Navigate to existing community page (social feed)
        window.location.href = '/social';
        break;
        
      case 'achievements':
        // Navigate to profile achievements section
        addNotification({
          type: 'info',
          title: 'Achievements',
          message: 'Opening your profile achievements...'
        });
        // Navigate to profile page with achievements focus
        window.location.href = '/profile#achievements';
        break;
        
      default:
        addNotification({
          type: 'error',
          title: 'Feature Coming Soon',
          message: 'This feature is currently being developed!'
        });
    }
  };

  // Test API function - you can call this from browser console
  window.testCreateHabit = async () => {
    try {
      const testData = {
        title: 'Test Habit from Console',
        description: 'This is a test habit',
        category: 'Wellness',
        frequency: 'daily',
        is_active: true
      };
      // Testing habit creation
      const result = await api.createHabit(testData);
      // Test habit creation successful
      return result;
    } catch (error) {
      console.error('Test habit creation failed:', error);
      return error;
    }
  };

  const createNewHabit = async (habitData) => {
    try {
      // Creating habit with data
      
      // Validate form data
      if (!habitData.name || !habitData.name.trim()) {
        console.error('Habit name is required');
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Habit name is required.'
        });
        return;
      }

      // Check if user is authenticated
      if (!user) {
        console.error('User not authenticated');
        addNotification({
          type: 'error',
          title: 'Authentication Error',
          message: 'You must be logged in to create habits.'
        });
        return;
      }

      // Verify token exists
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No access token found');
        addNotification({
          type: 'error',
          title: 'Authentication Error',
          message: 'Please log in again to create habits.'
        });
        return;
      }
      
      // Map form data to API format
      const apiData = {
        title: habitData.name.trim(), // API expects 'title'
        description: habitData.description?.trim() || '',
        category: habitData.category || 'health',
        frequency: habitData.frequency || 'daily',
        is_active: true
      };
      
      // Sending to API
      // Using token (present?)
      
      // Ensure API client has the current token
      api.setAuthToken(token);
      
      const newHabit = await api.createHabit(apiData);
      // API response received
      
      // Close modal immediately
      setShowAddHabitModal(false);
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Habit Created!',
        message: `"${habitData.name}" has been added to your forest.`
      });
      
      // Refresh the entire habits list to get the latest data from the backend
      // Refreshing habits list...
      await fetchHabits();
      // Habits refreshed successfully
      
    } catch (error) {
      console.error('Error creating habit:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Failed to create habit. Please try again.';
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Could redirect to login here if needed
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.title) {
          errorMessage = Array.isArray(error.response.data.title) 
            ? error.response.data.title[0] 
            : error.response.data.title || 'Invalid habit title';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Error Creating Habit',
        message: errorMessage
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good Morning';
    else if (hour < 18) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';
    
    // Use first name if available, otherwise use username
    const displayName = user?.first_name || user?.username || 'Forest Guardian';
    
    return `${timeGreeting}, ${displayName}`;
  };

  const getProgressPercentage = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
  };

  const getStreakDescription = (streak) => {
    if (streak < 7) return 'Seedling';
    if (streak < 30) return 'Growing Tree';
    if (streak < 100) return 'Mature Tree';
    return 'Ancient Oak';
  };

  const getTotalProgress = () => {
    if (habits.length === 0) return 0; // Prevent NaN when no habits exist
    const completed = habits.filter(h => h.completed).length;
    return (completed / habits.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Loading your forest...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-forest-dashboard">
      <div className="container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="welcome-title">
                {getGreeting()}
              </h1>
              <p className="welcome-subtitle">
                Your forest is thriving with {habits.filter(h => h.completed).length} of {habits.length} habits completed today
              </p>
            </div>
            <div className="date-section">
              <div className="current-date">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="time">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Progress Overview */}
        <section className="progress-overview">
          <div className="overview-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 16l4 4L24 8" stroke="currentColor" strokeWidth="3" fill="none"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{habits.filter(h => h.completed).length}/{habits.length}</div>
                <div className="stat-label">Today's Progress</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 2L8 8v6l8 8 8-8V8l-8-6z"/>
                  <path d="M16 14L12 18v8l4 4 4-4v-8l-4-4z" opacity="0.7"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</div>
                <div className="stat-label">Best Streak</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                  <rect x="4" y="8" width="24" height="3" rx="1"/>
                  <rect x="4" y="14" width="18" height="3" rx="1"/>
                  <rect x="4" y="20" width="20" height="3" rx="1"/>
                  <rect x="4" y="26" width="16" height="3" rx="1"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{habits.length}</div>
                <div className="stat-label">Active Habits</div>
              </div>
            </div>
          </div>

          <div className="forest-progress">
            <div className="progress-header">
              <h3>Forest Growth</h3>
              <span className="progress-percentage">{Math.round(getTotalProgress())}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getTotalProgress()}%` }}
              ></div>
            </div>
          </div>
        </section>

        {/* Interactive Forest Animation */}
        <section className="forest-animation-section">
          <div className="forest-container">
            <div className="forest-header">
              <h2 className="forest-title">Your Habit Forest</h2>
              <p className="forest-subtitle">Watch your forest grow as you complete your daily habits</p>
            </div>
            
            <div className="forest-scene">
              {/* Background Elements */}
              <div className="forest-background">
                <div className="sky-gradient"></div>
                <div className="hills"></div>
                <div className="ground"></div>
              </div>
              
              {/* Habit Trees */}
              <div className="habit-trees">
                {habits.length > 0 ? (
                  habits.slice(0, 5).map((habit, index) => {
                    const completionRate = habit.streak / 30; // 30 days as max for visual scaling
                    const treeHeight = Math.max(0.3, Math.min(1, 0.3 + completionRate * 0.7));
                    const treeStage = habit.streak < 3 ? 'seedling' : habit.streak < 10 ? 'sapling' : habit.streak < 30 ? 'mature' : 'ancient';
                    
                    return (
                      <div 
                        key={habit.id}
                        className={`habit-tree ${treeStage} ${habit.completed ? 'completed-today' : ''}`}
                        style={{ 
                          left: `${15 + index * 15}%`,
                          transform: `scale(${treeHeight})`,
                          zIndex: 5 - index
                        }}
                        onClick={() => !habit.completed && toggleHabit(habit.id)}
                        title={`${habit.name} - ${habit.streak} day streak`}
                      >
                        {/* Tree Trunk */}
                        <div className="tree-trunk"></div>
                        
                        {/* Tree Crown */}
                        <div className="tree-crown">
                          <div className="crown-layer crown-back"></div>
                          <div className="crown-layer crown-mid"></div>
                          <div className="crown-layer crown-front"></div>
                          
                          {/* Streak Sparkles for long streaks */}
                          {habit.streak > 7 && (
                            <div className="streak-sparkles">
                              <div className="sparkle sparkle-1"></div>
                              <div className="sparkle sparkle-2"></div>
                              <div className="sparkle sparkle-3"></div>
                            </div>
                          )}
                          
                          {/* Completion Glow */}
                          {habit.completed && (
                            <div className="completion-glow"></div>
                          )}
                        </div>
                        
                        {/* Habit Label */}
                        <div className="tree-label">
                          <span className="habit-name">{habit.name.split(' ')[0]}</span>
                          <span className="streak-count">{habit.streak}d</span>
                        </div>
                        
                        {/* Growth Animation */}
                        {habit.completed && (
                          <div className="growth-animation">
                            <div className="growth-particle particle-1"></div>
                            <div className="growth-particle particle-2"></div>
                            <div className="growth-particle particle-3"></div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Empty forest state
                  <div className="empty-forest">
                    <div className="placeholder-tree" onClick={handleAddHabit}>
                      <div className="empty-trunk"></div>
                      <div className="empty-crown">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2v10m-5-5h10"/>
                        </svg>
                      </div>
                      <div className="empty-label">Plant Your First Habit</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Wildlife (appears with good progress) */}
              {habits.filter(h => h.completed).length >= 2 && (
                <div className="forest-wildlife">
                  <div className="bird bird-1">
                    <div className="bird-body"></div>
                  </div>
                  {habits.filter(h => h.streak > 7).length >= 1 && (
                    <div className="butterfly">
                      <div className="wing wing-left"></div>
                      <div className="wing wing-right"></div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Weather Effects */}
              {habits.some(h => h.completed) && (
                <div className="weather-effects">
                  <div className="sun-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Forest Stats */}
            <div className="forest-stats">
              <div className="forest-stat">
                <span className="stat-value">{habits.length}</span>
                <span className="stat-label">Trees</span>
              </div>
              <div className="forest-stat">
                <span className="stat-value">{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}</span>
                <span className="stat-label">Best Streak</span>
              </div>
              <div className="forest-stat">
                <span className="stat-value">{Math.round((habits.filter(h => h.completed).length / Math.max(habits.length, 1)) * 100)}%</span>
                <span className="stat-label">Today's Growth</span>
              </div>
            </div>
          </div>
        </section>

        {/* Habits Grid */}
        <section className="habits-section">
          <div className="section-header">
            <h2 className="section-title">Today's Habits</h2>
            <button className="btn btn-primary btn-sm" onClick={handleAddHabit}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2v6h6"/>
                <path d="M8 2v12"/>
                <path d="M2 8h12"/>
              </svg>
              Add Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
                  <path d="M32 8L8 16v12l24 24 24-24V16L32 8z" opacity="0.3"/>
                  <path d="M32 20L20 28v16l12 12 12-12V28L32 20z"/>
                </svg>
              </div>
              <h3 className="empty-title">Start Growing Your Forest</h3>
              <p className="empty-description">
                Create your first habit and watch your virtual forest flourish as you build positive routines.
              </p>
              <button className="btn btn-primary start-forest-btn" onClick={handleAddHabit}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2v12M2 8h12"/>
                </svg>
                Start Your Forest
              </button>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map((habit) => (
              <div key={habit.id} className={`habit-card ${habit.completed ? 'completed' : ''}`}>
                <div className="habit-header">
                  <div className="habit-info">
                    <h3 className="habit-name">{habit.name}</h3>
                    <p className="habit-description">{habit.description}</p>
                  </div>
                  <button
                    className={`habit-checkbox ${habit.completed ? 'completed' : ''}`}
                    onClick={() => toggleHabit(habit.id)}
                    aria-label={`Toggle ${habit.name}`}
                  >
                    {habit.completed && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.5 3.5L6 11l-3.5-3.5"/>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="habit-progress">
                  <div className="progress-info">
                    <span className="progress-text">
                      {habit.progress}/{habit.target} this week
                    </span>
                    <span className="streak-badge">
                      {habit.streak} day streak
                    </span>
                  </div>
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressPercentage(habit.progress, habit.target)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="habit-footer">
                  <span className="habit-category">{habit.category}</span>
                  <span className="streak-type">{getStreakDescription(habit.streak)}</span>
                </div>
              </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card start-growing-btn" onClick={() => handleQuickAction('analytics')}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
                </svg>
              </div>
              <div className="action-content">
                <div className="action-title">Start Growing</div>
                <div className="action-subtitle">Track your progress</div>
              </div>
            </button>

            <button className="action-card start-growing-btn" onClick={() => handleQuickAction('community')}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16"/>
                </svg>
              </div>
              <div className="action-content">
                <div className="action-title">Join Community</div>
                <div className="action-subtitle">Connect with others</div>
              </div>
            </button>

            <button className="action-card start-growing-btn" onClick={() => handleQuickAction('achievements')}>
              <div className="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div className="action-content">
                <div className="action-title">Achievements</div>
                <div className="action-subtitle">View your badges</div>
              </div>
            </button>
          </div>
        </section>

        {/* Add Habit Modal */}
        {showAddHabitModal && (
          <div className="modal-overlay" onClick={() => setShowAddHabitModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Habit</h3>
                <button className="modal-close" onClick={() => setShowAddHabitModal(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <AddHabitForm onSubmit={createNewHabit} onCancel={() => setShowAddHabitModal(false)} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ===== DASHBOARD LOADING ===== */
        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-content {
          text-align: center;
          color: var(--text-secondary);
        }

        .loading-content .loading-spinner {
          margin: 0 auto var(--space-4);
        }

        /* ===== DASHBOARD LAYOUT ===== */
        .modern-forest-dashboard {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: var(--space-8) 0;
        }

        /* ===== DASHBOARD HEADER ===== */
        .dashboard-header {
          margin-bottom: var(--space-12);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-8);
        }

        .welcome-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0 0 var(--space-2) 0;
          line-height: var(--leading-tight);
        }

        .welcome-subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .date-section {
          text-align: right;
          flex-shrink: 0;
        }

        .current-date {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .time {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        /* ===== PROGRESS OVERVIEW ===== */
        .progress-overview {
          background: var(--gradient-canopy);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          margin-bottom: var(--space-12);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          border: 1px solid var(--border-primary);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: var(--gradient-forest-light);
          border-radius: var(--radius-xl);
          color: var(--text-inverse);
          flex-shrink: 0;
        }

        .stat-number {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--space-1);
        }

        .forest-progress {
          background: var(--bg-surface);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          border: 1px solid var(--border-primary);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
        }

        .progress-header h3 {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin: 0;
        }

        .progress-percentage {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-bold);
          color: var(--forest-600);
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: var(--stone-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar.small {
          height: 6px;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-forest-primary);
          border-radius: var(--radius-full);
          transition: width var(--duration-500) var(--ease-out);
        }

        /* ===== HABITS SECTION ===== */
        .habits-section {
          margin-bottom: var(--space-12);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-8);
        }

        .section-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: var(--space-6);
        }

        .habit-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          transition: all var(--duration-200) var(--ease-out);
        }

        .habit-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--forest-200);
        }

        .habit-card.completed {
          background: var(--forest-50);
          border-color: var(--forest-200);
        }

        .habit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .habit-info {
          flex: 1;
        }

        .habit-name {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin: 0 0 var(--space-2) 0;
        }

        .habit-description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .habit-checkbox {
          width: 32px;
          height: 32px;
          border: 2px solid var(--border-secondary);
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-out);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .habit-checkbox:hover {
          border-color: var(--forest-400);
          transform: scale(1.05);
        }

        .habit-checkbox.completed {
          background: var(--gradient-forest-primary);
          border-color: var(--forest-600);
          color: var(--text-inverse);
        }

        .habit-progress {
          margin-bottom: var(--space-4);
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }

        .progress-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .streak-badge {
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-2);
          background: var(--forest-100);
          color: var(--forest-700);
          border-radius: var(--radius-base);
          font-weight: var(--font-weight-medium);
        }

        .habit-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .habit-category,
        .streak-type {
          font-size: var(--text-xs);
          color: var(--text-muted);
          padding: var(--space-1) var(--space-2);
          background: var(--stone-100);
          border-radius: var(--radius-base);
        }

        .streak-type {
          background: var(--wood-100);
          color: var(--wood-700);
        }

        /* ===== QUICK ACTIONS ===== */
        .quick-actions {
          margin-bottom: var(--space-8);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-4);
          margin-top: var(--space-6);
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-out);
          text-align: left;
        }

        .action-card:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          border-color: var(--forest-200);
        }

        .action-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--gradient-canopy);
          border-radius: var(--radius-xl);
          color: var(--forest-600);
          flex-shrink: 0;
        }

        .action-title {
          font-size: var(--text-base);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .action-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        /* ===== RESPONSIVE DESIGN ===== */
        @media (max-width: 1023px) {
          .header-content {
            flex-direction: column;
            gap: var(--space-4);
          }

          .date-section {
            text-align: left;
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .habits-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 767px) {
          .modern-forest-dashboard {
            padding: var(--space-6) 0;
          }

          .dashboard-header {
            margin-bottom: var(--space-8);
          }

          .welcome-title {
            font-size: var(--text-3xl);
          }

          .progress-overview {
            padding: var(--space-6);
            margin-bottom: var(--space-8);
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .habit-card {
            padding: var(--space-4);
          }

          .stat-card {
            padding: var(--space-4);
          }

          .stat-icon {
            width: 48px;
            height: 48px;
          }
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          text-align: center;
          padding: var(--space-16) var(--space-8);
          color: var(--text-secondary);
        }

        .empty-icon {
          color: var(--forest-300);
          margin-bottom: var(--space-6);
        }

        .empty-title {
          font-size: var(--text-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          margin: 0 0 var(--space-3) 0;
        }

        .empty-description {
          font-size: var(--text-base);
          line-height: var(--leading-relaxed);
          margin: 0 0 var(--space-6) 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ===== MODAL ===== */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }

        .modal-content {
          background: var(--bg-surface);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-2xl);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6);
          border-bottom: 1px solid var(--border-primary);
        }

        .modal-header h3 {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2);
          color: var(--text-secondary);
          border-radius: var(--radius-lg);
          transition: all var(--duration-200) var(--ease-out);
        }

        .modal-close:hover {
          background: var(--stone-100);
          color: var(--text-primary);
        }

        /* ===== FORM ===== */
        .add-habit-form {
          padding: var(--space-6);
        }

        .form-group {
          margin-bottom: var(--space-6);
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: var(--space-3);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          font-size: var(--text-base);
          color: var(--text-primary);
          background: var(--bg-primary);
          transition: border-color var(--duration-200) var(--ease-out);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--forest-400);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
          margin-top: var(--space-8);
        }

        .btn {
          padding: var(--space-3) var(--space-6);
          border: none;
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          transition: all var(--duration-200) var(--ease-out);
          text-decoration: none;
        }

        .btn-primary {
          background: var(--gradient-forest-primary);
          color: var(--text-inverse);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          background: var(--stone-100);
          color: var(--text-secondary);
          border: 1px solid var(--border-primary);
        }

        .btn-secondary:hover {
          background: var(--stone-200);
          color: var(--text-primary);
        }

        .btn-sm {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-xs);
        }

        /* ===== BUTTON COLOR FIXES ===== */
        /* Start Your Forest button - Hero Section */
        .start-forest-btn {
          background: var(--gradient-forest-primary);
          color: white !important;
          border: 1px solid var(--forest-600);
          transition: all 0.2s ease;
        }

        .start-forest-btn:hover:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          border-color: var(--forest-600);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .start-forest-btn:active:not(:disabled) {
          background: var(--forest-700) !important;
          color: white !important;
          border-color: var(--forest-700);
          transform: translateY(0);
        }

        .start-forest-btn:focus:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          outline: 2px solid var(--forest-300);
          outline-offset: 2px;
        }

        /* Start Growing buttons (Quick Actions) */
        .start-growing-btn {
          background: var(--gradient-forest-primary) !important;
          color: white !important;
          border: 1px solid var(--forest-600);
          transition: all 0.2s ease;
        }

        .start-growing-btn:hover:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          border-color: var(--forest-600);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .start-growing-btn:active:not(:disabled) {
          background: var(--forest-700) !important;
          color: white !important;
          border-color: var(--forest-700);
          transform: translateY(0);
        }

        .start-growing-btn:focus:not(:disabled) {
          background: var(--forest-600) !important;
          color: white !important;
          outline: 2px solid var(--forest-300);
          outline-offset: 2px;
        }

        /* Force white text for action titles and subtitles in Start Growing buttons */
        .start-growing-btn .action-title {
          color: white !important;
        }

        .start-growing-btn:hover .action-title {
          color: white !important;
        }

        .start-growing-btn:active .action-title {
          color: white !important;
        }

        .start-growing-btn .action-subtitle {
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .start-growing-btn:hover .action-subtitle {
          color: white !important;
        }

        .start-growing-btn:active .action-subtitle {
          color: white !important;
        }

        /* Force white color for action icons in Start Growing buttons */
        .start-growing-btn .action-icon {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }

        .start-growing-btn:hover .action-icon {
          background: rgba(255, 255, 255, 0.3) !important;
          color: white !important;
        }

        /* ===== FOREST ANIMATION SECTION ===== */
        .forest-animation-section {
          margin-bottom: var(--space-12);
          background: var(--gradient-canopy);
          border-radius: var(--radius-2xl);
          overflow: hidden;
        }

        .forest-container {
          padding: var(--space-8);
        }

        .forest-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .forest-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          margin: 0 0 var(--space-2) 0;
        }

        .forest-subtitle {
          font-size: var(--text-base);
          color: var(--text-secondary);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .forest-scene {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: linear-gradient(180deg, #87ceeb 0%, #98e4d6 100%);
          cursor: pointer;
        }

        /* ===== FOREST BACKGROUND ===== */
        .forest-background {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .sky-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(180deg, 
            #87ceeb 0%,    /* Sky blue */
            #b8e6ff 30%,   /* Light blue */
            #e6f3ff 100%   /* Very light blue */
          );
        }

        .hills {
          position: absolute;
          bottom: 25%;
          left: 0;
          right: 0;
          height: 35%;
          background: linear-gradient(180deg, 
            var(--forest-300) 0%,
            var(--forest-400) 100%
          );
          clip-path: polygon(
            0 70%,
            15% 45%,
            35% 60%,
            55% 35%,
            75% 55%,
            90% 40%,
            100% 50%,
            100% 100%,
            0 100%
          );
        }

        .ground {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 25%;
          background: linear-gradient(180deg, 
            var(--forest-200) 0%,
            var(--forest-300) 100%
          );
        }

        /* ===== HABIT TREES ===== */
        .habit-trees {
          position: absolute;
          inset: 0;
          z-index: 3;
        }

        .habit-tree {
          position: absolute;
          bottom: 25%;
          width: 80px;
          height: 120px;
          cursor: pointer;
          transition: all var(--duration-300) var(--ease-out);
          transform-origin: bottom center;
        }

        .habit-tree:hover {
          transform: scale(1.05) !important;
          filter: brightness(1.1);
        }

        .habit-tree.completed-today {
          animation: celebrationPulse 2s ease-in-out infinite;
        }

        /* Tree Trunk */
        .tree-trunk {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 40px;
          background: linear-gradient(180deg, 
            var(--wood-400) 0%,
            var(--wood-600) 100%
          );
          border-radius: 2px;
          box-shadow: inset -2px 0 4px rgba(0, 0, 0, 0.1);
        }

        /* Tree Crown */
        .tree-crown {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
        }

        .crown-layer {
          position: absolute;
          border-radius: 50%;
          transition: all var(--duration-300) var(--ease-out);
        }

        .crown-back {
          top: 10px;
          left: 5px;
          width: 35px;
          height: 35px;
          background: var(--forest-400);
          opacity: 0.7;
        }

        .crown-mid {
          top: 5px;
          left: 15px;
          width: 45px;
          height: 45px;
          background: var(--forest-300);
          opacity: 0.8;
        }

        .crown-front {
          top: 0;
          left: 10px;
          width: 40px;
          height: 40px;
          background: var(--forest-200);
        }

        /* Tree Growth Stages */
        .habit-tree.seedling .tree-crown {
          transform: translateX(-50%) scale(0.6);
        }

        .habit-tree.seedling .tree-trunk {
          height: 25px;
        }

        .habit-tree.sapling .tree-crown {
          transform: translateX(-50%) scale(0.8);
        }

        .habit-tree.sapling .tree-trunk {
          height: 35px;
        }

        .habit-tree.mature .crown-front {
          background: var(--forest-300);
        }

        .habit-tree.mature .crown-mid {
          background: var(--forest-400);
        }

        .habit-tree.ancient .crown-front {
          background: var(--forest-400);
        }

        .habit-tree.ancient .crown-mid {
          background: var(--forest-500);
        }

        .habit-tree.ancient .tree-trunk {
          width: 16px;
          height: 50px;
        }

        /* Streak Sparkles */
        .streak-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--amber-warm);
          border-radius: 50%;
          animation: sparkleFloat 3s ease-in-out infinite;
        }

        .sparkle-1 {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: 30%;
          right: 15%;
          animation-delay: 1s;
        }

        .sparkle-3 {
          bottom: 20%;
          left: 60%;
          animation-delay: 2s;
        }

        /* Completion Glow */
        .completion-glow {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, 
            rgba(34, 197, 94, 0.3) 0%,
            rgba(34, 197, 94, 0.1) 50%,
            transparent 100%
          );
          border-radius: 50%;
          animation: pulseGlow 2s ease-in-out infinite;
        }

        /* Tree Label */
        .tree-label {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: var(--text-xs);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-base);
          padding: var(--space-1) var(--space-2);
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-sm);
        }

        .habit-name {
          display: block;
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-bottom: 1px;
        }

        .streak-count {
          font-size: var(--text-2xs);
          color: var(--forest-600);
          font-weight: var(--font-weight-bold);
        }

        /* Growth Animation */
        .growth-animation {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .growth-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--forest-300);
          border-radius: 50%;
          animation: growthParticle 1.5s ease-out forwards;
        }

        .particle-1 {
          top: 50%;
          left: 30%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 40%;
          right: 25%;
          animation-delay: 0.3s;
        }

        .particle-3 {
          bottom: 40%;
          left: 50%;
          animation-delay: 0.6s;
        }

        /* ===== EMPTY FOREST STATE ===== */
        .empty-forest {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .placeholder-tree {
          text-align: center;
          cursor: pointer;
          transition: all var(--duration-300) var(--ease-out);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
        }

        .placeholder-tree:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
        }

        .empty-trunk {
          width: 8px;
          height: 30px;
          background: var(--wood-300);
          margin: 0 auto;
          border-radius: 2px;
          opacity: 0.5;
        }

        .empty-crown {
          width: 40px;
          height: 40px;
          background: var(--stone-200);
          border: 2px dashed var(--stone-400);
          border-radius: 50%;
          margin: -5px auto var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--stone-500);
        }

        .empty-label {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
          margin-top: var(--space-2);
        }

        /* ===== FOREST WILDLIFE ===== */
        .forest-wildlife {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
        }

        .bird {
          position: absolute;
          width: 12px;
          height: 8px;
          animation: birdFly 8s ease-in-out infinite;
        }

        .bird-1 {
          top: 20%;
          left: -20px;
        }

        .bird-body {
          width: 100%;
          height: 100%;
          background: var(--stone-600);
          border-radius: 50%;
          position: relative;
        }

        .bird-body::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -8px;
          width: 8px;
          height: 3px;
          background: var(--stone-600);
          border-radius: 50%;
          animation: wingFlap 0.5s ease-in-out infinite alternate;
        }

        .bird-body::after {
          content: '';
          position: absolute;
          top: -2px;
          right: -8px;
          width: 8px;
          height: 3px;
          background: var(--stone-600);
          border-radius: 50%;
          animation: wingFlap 0.5s ease-in-out infinite alternate;
          animation-delay: 0.1s;
        }

        .butterfly {
          position: absolute;
          top: 40%;
          right: 20%;
          width: 16px;
          height: 12px;
          animation: butterflyFloat 6s ease-in-out infinite;
        }

        .wing {
          position: absolute;
          width: 6px;
          height: 8px;
          background: linear-gradient(45deg, var(--amber-warm), var(--amber-light));
          border-radius: 50% 10% 50% 10%;
        }

        .wing-left {
          left: 2px;
          transform-origin: bottom right;
          animation: wingFlutter 0.8s ease-in-out infinite;
        }

        .wing-right {
          right: 2px;
          transform-origin: bottom left;
          animation: wingFlutter 0.8s ease-in-out infinite;
          animation-delay: 0.1s;
        }

        /* ===== WEATHER EFFECTS ===== */
        .weather-effects {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .sun-rays {
          position: absolute;
          top: 10%;
          right: 15%;
          width: 60px;
          height: 60px;
        }

        .ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 20px;
          background: linear-gradient(180deg, transparent, var(--amber-light), transparent);
          transform-origin: center bottom;
          opacity: 0.6;
          animation: rayRotate 4s linear infinite;
        }

        .ray-1 {
          transform: translate(-50%, -50%) rotate(0deg);
        }

        .ray-2 {
          transform: translate(-50%, -50%) rotate(120deg);
        }

        .ray-3 {
          transform: translate(-50%, -50%) rotate(240deg);
        }

        /* ===== FOREST STATS ===== */
        .forest-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-top: var(--space-6);
          padding: var(--space-6);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-primary);
        }

        .forest-stat {
          text-align: center;
          padding: var(--space-3);
        }

        .stat-value {
          display: block;
          font-size: var(--text-xl);
          font-weight: var(--font-weight-bold);
          color: var(--forest-600);
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        /* ===== ANIMATIONS ===== */
        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes sparkleFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes growthParticle {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0);
          }
        }

        @keyframes birdFly {
          0% {
            left: -20px;
            transform: translateY(0px);
          }
          25% {
            transform: translateY(-10px);
          }
          50% {
            left: 50%;
            transform: translateY(0px);
          }
          75% {
            transform: translateY(-8px);
          }
          100% {
            left: 120%;
            transform: translateY(0px);
          }
        }

        @keyframes wingFlap {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-20deg); }
        }

        @keyframes butterflyFloat {
          0%, 100% { 
            transform: translate(0px, 0px) rotate(0deg);
          }
          25% {
            transform: translate(10px, -5px) rotate(2deg);
          }
          50% {
            transform: translate(0px, -10px) rotate(0deg);
          }
          75% {
            transform: translate(-8px, -5px) rotate(-2deg);
          }
        }

        @keyframes wingFlutter {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.8); }
        }

        @keyframes rayRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* ===== RESPONSIVE DESIGN FOR FOREST ===== */
        @media (max-width: 1023px) {
          .forest-scene {
            height: 350px;
          }

          .habit-tree {
            width: 70px;
            height: 105px;
          }

          .tree-crown {
            width: 50px;
            height: 50px;
          }

          .forest-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--space-3);
            padding: var(--space-4);
          }
        }

        @media (max-width: 767px) {
          .forest-container {
            padding: var(--space-6);
          }

          .forest-scene {
            height: 250px;
          }

          .habit-tree {
            width: 60px;
            height: 90px;
          }

          .tree-crown {
            width: 40px;
            height: 40px;
          }

          .crown-back {
            width: 25px;
            height: 25px;
          }

          .crown-mid {
            width: 35px;
            height: 35px;
          }

          .crown-front {
            width: 30px;
            height: 30px;
          }

          .tree-trunk {
            width: 10px;
            height: 30px;
          }

          .tree-label {
            font-size: 10px;
            padding: 2px 4px;
          }

          .forest-stats {
            grid-template-columns: repeat(3, 1fr);
            padding: var(--space-4);
          }

          .stat-value {
            font-size: var(--text-lg);
          }

          .stat-label {
            font-size: var(--text-xs);
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .habit-card,
          .action-card,
          .habit-checkbox,
          .progress-fill,
          .btn,
          .modal-close,
          .habit-tree,
          .sparkle,
          .completion-glow,
          .growth-particle,
          .bird,
          .butterfly,
          .ray {
            transition: none;
            animation: none;
          }

          .habit-tree.completed-today {
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernForestDashboard;