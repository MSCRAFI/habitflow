import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import HabitCard from '../../components/HabitCard';
import Skeleton from '../../components/common/Skeleton';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ProgressRing from '../../components/ProgressRing';
import TreeGrowth from '../../components/TreeGrowth';
import AnalyticsChart from '../../components/AnalyticsChart';
import BadgeShowcase from '../../components/BadgeShowcase';
import IdentityTracker from '../../components/IdentityTracker';

const HabitList = React.lazy(() => import('../../components/HabitList'));
const HabitStackBuilder = React.lazy(() => import('../../components/HabitStackBuilder'));

const ModernHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [activeTab, setActiveTab] = useState('habits');
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { showError, showSuccess } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    frequency: 'daily',
    color_code: '#3B82F6',
    icon: '',
    is_micro_habit: false,
  });

  const categories = [
    { value: 'health', label: 'Health', icon: '🏥', color: 'var(--emerald-500)' },
    { value: 'productivity', label: 'Productivity', icon: '⚡', color: 'var(--blue-500)' },
    { value: 'learning', label: 'Learning', icon: '📚', color: 'var(--purple-500)' },
    { value: 'fitness', label: 'Fitness', icon: '💪', color: 'var(--orange-500)' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: 'var(--pink-500)' },
    { value: 'social', label: 'Social', icon: '👥', color: 'var(--teal-500)' },
    { value: 'other', label: 'Other', icon: '📋', color: 'var(--gray-500)' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' },
  ];

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (formData.title.length > 100) errs.title = 'Title must be 100 characters or less';
    if (!['daily','weekly','custom'].includes(formData.frequency)) errs.frequency = 'Invalid frequency';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingHabit) {
        await api.updateHabit(editingHabit.id, formData);
        showSuccess('Habit updated successfully!');
      } else {
        await api.createHabit(formData);
        showSuccess('Habit created successfully!');
      }
      
      setShowModal(false);
      setEditingHabit(null);
      resetForm();
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      const msg = error.response?.data?.detail || 'Failed to save habit. Please try again.';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      title: habit.title,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      color_code: habit.color_code,
      icon: habit.icon,
      is_micro_habit: habit.is_micro_habit,
    });
    setShowModal(true);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await api.deleteHabit(habitId);
        showSuccess('Habit deleted successfully!');
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
        showError('Failed to delete habit. Please try again.');
      }
    }
  };

  const handleComplete = async (habitId) => {
    try {
      await api.createHabitEntry(habitId, {
        completed: true,
        date: new Date().toISOString().split('T')[0]
      });
      showSuccess('Habit completed successfully');
      fetchHabits();
    } catch (error) {
      console.error('Error completing habit:', error);
      showError('Failed to complete habit. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      frequency: 'daily',
      color_code: '#3B82F6',
      icon: '',
      is_micro_habit: false,
    });
  };

  // Filter habits based on active tab
  const filteredHabits = useMemo(() => {
    if (activeTab === 'all') return habits;
    return habits.filter(habit => habit.category === activeTab);
  }, [habits, activeTab]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const [habitsResponse, weeklyResponse, monthlyResponse] = await Promise.all([
        api.getHabits(),
        api.getWeeklyAnalytics().catch(() => ({ data: [] })),
        api.getMonthlyAnalytics().catch(() => ({ data: [] }))
      ]);
      
      setHabits(habitsResponse.results || []);
      setWeeklyData(weeklyResponse?.data || []);
      setMonthlyData(monthlyResponse?.data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setError(error);
      showError('Failed to load habits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modern-habits-container">
        <div className="habits-header">
          <Skeleton height="120px" />
        </div>
        <div className="stats-grid">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height="140px" />
          ))}
        </div>
        <div className="habits-content">
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div className="modern-habits-container">
      {/* Enhanced Header */}
      <div className="habits-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title">Your Habit Forest</h1>
            <p className="page-subtitle">
              Cultivate daily habits and watch your personal growth flourish
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary btn-lg modern-btn"
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Plant New Habit
            </button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-header">
              <div className="stat-icon">🌱</div>
              <div className="stat-badge">Active</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">{habits.length}</div>
              <div className="stat-label">Total Habits</div>
            </div>
            <div className="stat-trend positive">+2 this week</div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-header">
              <div className="stat-icon">🔥</div>
              <div className="stat-badge">Streaks</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {habits.filter(h => h.current_streak > 0).length}
              </div>
              <div className="stat-label">Active Streaks</div>
            </div>
            <div className="stat-trend neutral">Best: 21 days</div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-header">
              <div className="stat-icon">📈</div>
              <div className="stat-badge">Success</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {Math.round(habits.reduce((acc, h) => acc + (h.completion_rate || 0), 0) / Math.max(habits.length, 1))}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
            <div className="stat-trend positive">+5% this month</div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-header">
              <div className="stat-icon">🎯</div>
              <div className="stat-badge">Focus</div>
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {habits.filter(h => h.category === 'health' || h.category === 'fitness').length}
              </div>
              <div className="stat-label">Wellness Habits</div>
            </div>
            <div className="stat-trend neutral">Main focus</div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="habits-content">
        {/* Category Filter Tabs */}
        <div className="category-tabs">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Habits
          </button>
          {categories.map((category) => (
            <button
              key={category.value}
              className={`tab-button ${activeTab === category.value ? 'active' : ''}`}
              onClick={() => setActiveTab(category.value)}
            >
              <span className="tab-icon">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Habits Grid */}
        <div className="habits-grid">
          {filteredHabits.length === 0 && habits.length > 0 ? (
            <EmptyState
              title={`No ${activeTab === 'all' ? '' : activeTab} habits yet`}
              description={`You haven't created any ${activeTab === 'all' ? '' : activeTab} habits yet. Start building better habits today!`}
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  Create {activeTab === 'all' ? 'New' : categories.find(c => c.value === activeTab)?.label} Habit
                </button>
              }
            />
          ) : habits.length === 0 ? (
            <EmptyState
              title="Start Your Habit Journey"
              description="Create your first habit and begin building a better you, one day at a time."
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  Plant Your First Habit
                </button>
              }
            />
          ) : (
            filteredHabits.map((habit) => (
              <div key={habit.id} className="habit-card-wrapper">
                <HabitCard
                  habit={habit}
                  onEdit={() => handleEdit(habit)}
                  onDelete={() => handleDelete(habit.id)}
                  onComplete={() => handleComplete(habit.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Habit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content habit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingHabit ? 'Edit Habit' : 'Plant New Habit'}</h2>
              <button 
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="habit-form">
              <div className="form-group">
                <label className="form-label">Habit Title *</label>
                <input 
                  className={`form-input ${formErrors.title ? 'error' : ''}`}
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g., Morning meditation, Daily exercise"
                  maxLength={100}
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your habit..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select 
                    className="form-select"
                    value={formData.frequency} 
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input 
                    type="color"
                    className="form-color"
                    value={formData.color_code} 
                    onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon (optional)</label>
                  <input 
                    className="form-input"
                    value={formData.icon} 
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="🏃‍♂️, 📚, 🧘‍♀️"
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={formData.is_micro_habit}
                    onChange={(e) => setFormData({...formData, is_micro_habit: e.target.checked})}
                  />
                  <span className="checkbox-text">This is a micro habit (takes less than 2 minutes)</span>
                </label>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : (editingHabit ? 'Update Habit' : 'Plant Habit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modern-habits-container {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--forest-50) 0%, var(--wood-50) 100%);
          padding: var(--space-6) var(--space-4);
        }

        .habits-header {
          margin-bottom: var(--space-8);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: var(--space-8);
          gap: var(--space-6);
        }

        .header-main {
          flex: 1;
        }

        .page-title {
          font-size: var(--text-5xl);
          font-weight: var(--font-weight-bold);
          color: var(--forest-800);
          margin: 0 0 var(--space-3) 0;
          line-height: var(--leading-tight);
        }

        .page-subtitle {
          font-size: var(--text-lg);
          color: var(--forest-600);
          margin: 0;
          line-height: var(--leading-relaxed);
        }

        .modern-btn {
          position: relative;
          overflow: hidden;
          transform: perspective(1px) translateZ(0);
        }

        .modern-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .modern-btn:hover::before {
          left: 100%;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          position: relative;
          overflow: hidden;
          transition: all var(--duration-300) var(--ease-out);
          box-shadow: var(--shadow-sm);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-forest-primary);
          transform: scaleX(0);
          transition: transform var(--duration-300) var(--ease-out);
          transform-origin: left;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--forest-300);
        }

        .stat-card:hover::before {
          transform: scaleX(1);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, var(--forest-50), white);
        }

        .stat-card.success {
          background: linear-gradient(135deg, var(--emerald-50), white);
        }

        .stat-card.info {
          background: linear-gradient(135deg, var(--blue-50), white);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, var(--amber-50), white);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .stat-icon {
          font-size: var(--text-2xl);
          padding: var(--space-2);
          background: rgba(255, 255, 255, 0.8);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .stat-badge {
          background: var(--forest-100);
          color: var(--forest-700);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-content {
          margin-bottom: var(--space-3);
        }

        .stat-number {
          font-size: var(--text-4xl);
          font-weight: var(--font-weight-bold);
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
        }

        .stat-trend {
          font-size: var(--text-xs);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-base);
          font-weight: var(--font-weight-medium);
        }

        .stat-trend.positive {
          background: var(--emerald-100);
          color: var(--emerald-700);
        }

        .stat-trend.neutral {
          background: var(--stone-100);
          color: var(--stone-700);
        }

        .habits-content {
          background: var(--bg-surface);
          border-radius: var(--radius-3xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          min-height: 600px;
        }

        .category-tabs {
          display: flex;
          background: var(--stone-50);
          border-bottom: 1px solid var(--border-primary);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .category-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: var(--font-weight-medium);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--duration-200) var(--ease-out);
          white-space: nowrap;
          position: relative;
        }

        .tab-button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--forest-500);
          transform: scaleX(0);
          transition: transform var(--duration-200) var(--ease-out);
        }

        .tab-button:hover {
          color: var(--forest-600);
          background: rgba(255, 255, 255, 0.6);
        }

        .tab-button.active {
          color: var(--forest-700);
          background: var(--bg-surface);
        }

        .tab-button.active::after {
          transform: scaleX(1);
        }

        .tab-icon {
          font-size: var(--text-base);
        }

        .habits-grid {
          padding: var(--space-8);
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-6);
        }

        .habit-card-wrapper {
          animation: fadeInUp 0.5s ease-out;
          animation-fill-mode: both;
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

        /* Responsive Design */
        @media (max-width: 1023px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-6);
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: var(--space-4);
          }

          .habits-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            padding: var(--space-6);
          }
        }

        @media (max-width: 767px) {
          .modern-habits-container {
            padding: var(--space-4) var(--space-3);
          }

          .page-title {
            font-size: var(--text-4xl);
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-3);
          }

          .stat-card {
            padding: var(--space-4);
          }

          .stat-number {
            font-size: var(--text-3xl);
          }

          .habits-grid {
            grid-template-columns: 1fr;
            padding: var(--space-4);
            gap: var(--space-4);
          }

          .category-tabs {
            padding: 0 var(--space-2);
          }

          .tab-button {
            padding: var(--space-3) var(--space-4);
          }
        }

        /* Modal Styles */
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

        .habit-modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--bg-surface);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-2xl);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-6);
          border-bottom: 1px solid var(--border-primary);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: var(--text-2xl);
        }

        .close-button {
          background: none;
          border: none;
          font-size: var(--text-xl);
          cursor: pointer;
          color: var(--text-secondary);
          padding: var(--space-2);
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: var(--stone-100);
          color: var(--text-primary);
        }

        .habit-form {
          padding: var(--space-6);
        }

        .form-group {
          margin-bottom: var(--space-6);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }

        .form-label {
          display: block;
          margin-bottom: var(--space-2);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          font-size: var(--text-sm);
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          transition: border-color 0.2s ease;
          background: var(--bg-surface);
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--forest-500);
        }

        .form-input.error {
          border-color: var(--red-500);
        }

        .form-color {
          width: 60px;
          height: 44px;
          padding: var(--space-1);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          background: none;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          cursor: pointer;
          font-size: var(--text-sm);
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--forest-500);
        }

        .error-text {
          color: var(--red-600);
          font-size: var(--text-xs);
          margin-top: var(--space-1);
          display: block;
        }

        .modal-actions {
          display: flex;
          gap: var(--space-3);
          justify-content: flex-end;
          margin-top: var(--space-8);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-primary);
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .stat-card {
            border-width: 2px;
          }

          .tab-button.active {
            border: 2px solid var(--forest-600);
          }

          .form-input,
          .form-textarea,
          .form-select {
            border-width: 3px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .stat-card,
          .modern-btn,
          .habit-card-wrapper {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernHabits;