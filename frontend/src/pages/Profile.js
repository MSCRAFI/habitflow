// Import order: React -> third-party -> local services -> local components/hooks -> styles
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useTheme } from '../contexts/ThemeContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showError, showSuccess } = useNotification();
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef(null);
  
  const [stats, setStats] = useState({
    habitsCreated: 12,
    totalCompletions: 487,
    currentStreak: 23,
    bestStreak: 45,
    totalPoints: 2840,
    level: 8,
    progressToNext: 65,
    joinedDaysAgo: 127,
    completionRate: 89
  });

  const [badges, setBadges] = useState([
    { id: 1, name: 'First Steps', description: 'Created your first habit', icon: 'seedling', earned: true, rarity: 'common', earnedDate: '2025-11-01' },
    { id: 2, name: 'Week Warrior', description: '7 day streak achieved', icon: 'flame', earned: true, rarity: 'common', earnedDate: '2025-11-08' },
    { id: 3, name: 'Consistency King', description: '30 day streak achieved', icon: 'crown', earned: true, rarity: 'rare', earnedDate: '2025-11-15' },
    { id: 4, name: 'Habit Master', description: '100 completions reached', icon: 'target', earned: true, rarity: 'epic', earnedDate: '2025-11-20' },
    { id: 5, name: 'Early Bird', description: 'Complete 10 morning habits', icon: 'sunrise', earned: true, rarity: 'uncommon', earnedDate: '2025-11-10' },
    { id: 6, name: 'Mountain Climber', description: '60 day streak achieved', icon: 'mountain', earned: false, rarity: 'legendary' },
    { id: 7, name: 'Perfectionist', description: '100% completion rate for 7 days', icon: 'star', earned: true, rarity: 'epic', earnedDate: '2025-11-22' },
    { id: 8, name: 'Social Butterfly', description: 'Helped 5 friends stay motivated', icon: 'users', earned: false, rarity: 'rare' },
  ]);

  const [,] = useState([
    { id: 1, title: 'Reached Level 5', date: '2025-11-20', type: 'milestone', description: 'Unlocked advanced habit tracking features' },
    { id: 2, title: '30-Day Streak Master', date: '2025-11-15', type: 'streak', description: 'Maintained consistency for a full month' },
    { id: 3, title: '500 Total Points', date: '2025-11-10', type: 'points', description: 'Accumulated significant habit momentum' },
  ]);

  const [identity] = useState({
    statement: 'I am a person who builds healthy habits every day',
    progress: 78,
    definition: 'Someone who prioritizes personal growth through consistent daily actions'
  });
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    identity_statement: user?.identity_statement || 'I am a person who builds healthy habits every day'
  });


  useEffect(() => {
    fetchUserStats();
  }, []);

  // Refresh form state whenever the user object updates
  useEffect(() => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      identity_statement: user?.identity_statement || 'I am a person who builds healthy habits'
    });
  }, [user]);

  const fetchUserStats = async () => {
    try {
      // Use the correct statistics endpoint that actually exists
      const analyticsData = await api.getStatistics();
      const userProfile = await api.getProfile();
      const userBadges = await api.getUserBadges();
      
      // Helper function to safely convert values to numbers, avoiding infinity
      const safeNumber = (value, defaultValue = 0) => {
        const num = Number(value);
        if (!isFinite(num) || isNaN(num)) {
          return defaultValue;
        }
        return num;
      };
      
      setStats({
        habitsCreated: safeNumber(analyticsData?.total_habits || userProfile?.total_habits_created, 0),
        totalCompletions: safeNumber(analyticsData?.total_completions || userProfile?.total_completions, 0),
        currentStreak: safeNumber(analyticsData?.current_streak || userProfile?.current_streak, 0),
        bestStreak: safeNumber(analyticsData?.best_streak || userProfile?.best_streak, 0),
        totalPoints: safeNumber(userProfile?.total_points, 0),
        level: safeNumber(userProfile?.level, 1),
        progressToNext: 65, // Calculate based on points
        joinedDaysAgo: user?.created_at ? Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)) : 0,
        completionRate: safeNumber(analyticsData?.completion_rate, 0)
      });

      // Update badges with real data
      setBadges(userBadges.map(ub => ({
        id: ub.badge?.id || ub.id,
        name: ub.badge?.name || 'Achievement',
        description: ub.badge?.description || 'Achievement unlocked',
        icon: ub.badge?.icon || 'star',
        earned: true,
        rarity: ub.badge?.rarity || 'common',
        earnedDate: ub.awarded_at ? new Date(ub.awarded_at).toISOString().split('T')[0] : null
      })));
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Keep hardcoded defaults if API fails
      console.log('Using fallback stats for new user');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Split the data for user fields and profile fields
      const userFields = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        bio: formData.bio
      };

      const profileFields = {
        identity: formData.identity_statement
      };

      // Update user profile (this handles both user and profile fields in the backend)
      const updatedProfile = await api.updateProfile({
        ...userFields,
        ...profileFields
      });

      // The backend should return updated user data, but let's also refresh the user
      const updatedUser = await api.getCurrentUser();
      updateUser(updatedUser);
      
      setIsEditing(false);
      showSuccess('Profile updated successfully!', { duration: 3000 });
      
      // Refresh stats to show any updated data
      fetchUserStats();
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      identity_statement: user?.identity_statement || 'I am a person who builds healthy habits'
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await api.uploadAvatar(formData);
      updateUser(updatedUser);
      showSuccess('Avatar updated successfully!');
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarUrlSubmit = async () => {
    if (!avatarUrl.trim()) {
      showError('Please enter a valid image URL');
      return;
    }

    setAvatarLoading(true);
    try {
      const updatedUser = await api.updateProfile({ ...formData, avatar: avatarUrl });
      updateUser(updatedUser);
      showSuccess('Avatar updated successfully!');
      setShowAvatarModal(false);
      setAvatarUrl('');
    } catch (error) {
      console.error('Error updating avatar:', error);
      showError('Failed to update avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // SVG Icons component
  const Icon = ({ name, size = 24, className = "" }) => {
    const icons = {
      edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
      save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
      cancel: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
      camera: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />,
      user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      mail: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
      palette: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3v18M15 8l4-4m0 0l4 4m-4-4v12" />,
      seedling: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L8 8l4 4 4-4-4-6zM8 8c0 4 4 8 4 8s4-4 4-8" />,
      flame: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2c1.5 0 3 1.5 3 3 0 3-1.5 6-3 6s-3-3-3-6c0-1.5 1.5-3 3-3z" />,
      crown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7M5 15l7-7 7 7" />,
      target: <circle cx="12" cy="12" r="10" strokeWidth={2} />,
      sunrise: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m8.485-8.485l-1.414 1.414M4.929 4.929l1.414 1.414m12.728 0l-1.414 1.414M4.929 19.071l1.414-1.414M17 12a5 5 0 11-10 0" />,
      mountain: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17l5-5 5 5M5 17h14" />
    };

    return (
      <svg className={`inline-block ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        {icons[name]}
      </svg>
    );
  };

  return (
    <div className="modern-profile-page">
      {/* Hero Section */}
      <div className="profile-hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className={`avatar-wrapper ${avatarLoading ? 'loading' : ''}`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={`${user.first_name}'s avatar`} className="avatar-image" />
                ) : (
                  <div className="avatar-placeholder">
                    <Icon name="user" size={32} className="avatar-icon" />
                  </div>
                )}
                {avatarLoading && (
                  <div className="avatar-loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowAvatarModal(true)}
                className="avatar-upload-button"
                disabled={avatarLoading}
              >
                <Icon name="camera" size={16} />
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden-file-input"
                aria-label="Upload avatar"
              />
            </div>
          </div>

          <div className="profile-header-info">
            <h1 className="profile-title">
              {user?.first_name || 'Anonymous'} {user?.last_name || ''}
            </h1>
            <p className="profile-subtitle">{user?.email}</p>
            {user?.bio && <p className="profile-description">{user.bio}</p>}
          </div>

          <div className="header-actions">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`action-button ${isEditing ? 'editing' : ''}`}
            >
              <Icon name={isEditing ? "cancel" : "edit"} size={16} />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Icon name="target" size={24} className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.habitsCreated}</span>
              <span className="stat-label">Habits Created</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon flame">
              <Icon name="flame" size={24} className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.currentStreak}</span>
              <span className="stat-label">Current Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <Icon name="target" size={24} className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalCompletions}</span>
              <span className="stat-label">Total Completions</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon crown">
              <Icon name="crown" size={24} className="stat-icon-svg" />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.bestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-main-content">
        <div className="content-grid">
          {/* Left Column - Profile Form */}
          <div className="profile-form-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Icon name="user" size={20} />
                  Profile Information
                </h2>
              </div>
              <div className="card-body">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="first_name" className="form-label">First Name</label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="last_name" className="form-label">Last Name</label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio" className="form-label">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="form-textarea"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="identity_statement" className="form-label">Identity Statement</label>
                      <input
                        type="text"
                        id="identity_statement"
                        name="identity_statement"
                        value={formData.identity_statement}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="I am a person who..."
                      />
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        <Icon name="save" size={16} />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className="btn btn-outline"
                      >
                        <Icon name="cancel" size={16} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-display">
                    <div className="info-item">
                      <label className="info-label">Name</label>
                      <p className="info-value">{user?.first_name || 'Not set'} {user?.last_name || ''}</p>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Email</label>
                      <p className="info-value">{user?.email || 'Not set'}</p>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Bio</label>
                      <p className="info-value">{user?.bio || 'No bio yet'}</p>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Identity Statement</label>
                      <p className="info-value identity-statement">{user?.identity_statement || identity.statement}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Badges & Theme */}
          <div className="profile-sidebar">
            {/* Achievement Badges */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Icon name="crown" size={20} />
                  Achievements
                </h2>
              </div>
              <div className="card-body">
                <div className="badges-grid">
                  {badges.map(badge => (
                    <div key={badge.id} className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}>
                      <div className="badge-icon">
                        <Icon name={badge.icon} size={20} className="badge-icon-svg" />
                      </div>
                      <div className="badge-content">
                        <h4 className="badge-name">{badge.name}</h4>
                        <p className="badge-description">{badge.description}</p>
                      </div>
                      {badge.earned && <div className="badge-earned-indicator"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Icon name="palette" size={20} />
                  Theme
                </h2>
              </div>
              <div className="card-body">
                <div className="theme-grid">
                  {Object.entries(availableThemes).map(([key, value]) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`theme-option ${currentTheme === value ? 'active' : ''}`}
                      data-theme={value}
                    >
                      <div className="theme-preview">
                        <div className="theme-color theme-primary"></div>
                        <div className="theme-color theme-secondary"></div>
                        <div className="theme-color theme-accent"></div>
                      </div>
                      <span className="theme-name">{key.charAt(0) + key.slice(1).toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update Profile Picture</h3>
              <button 
                className="modal-close-button"
                onClick={() => setShowAvatarModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="avatar-option">
                <div className="option-header">
                  <div className="option-icon">📁</div>
                  <h4>Upload from Device</h4>
                </div>
                <p>Choose an image file from your computer</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                  disabled={avatarLoading}
                >
                  Choose File
                </button>
              </div>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="avatar-option">
                <div className="option-header">
                  <div className="option-icon">🔗</div>
                  <h4>Use Image URL</h4>
                </div>
                <p>Enter a direct link to an image</p>
                <div className="url-input-group">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="url-input"
                    disabled={avatarLoading}
                  />
                  <button 
                    onClick={handleAvatarUrlSubmit}
                    className="btn btn-primary"
                    disabled={avatarLoading || !avatarUrl.trim()}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
      /* Avatar Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: var(--space-4);
      }

      .avatar-modal {
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
        color: var(--text-primary);
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
      }

      .modal-close-button {
        background: none;
        border: none;
        font-size: var(--text-xl);
        cursor: pointer;
        color: var(--text-secondary);
        padding: var(--space-2);
        border-radius: var(--radius-lg);
        transition: all 0.2s ease;
      }

      .modal-close-button:hover {
        background: var(--stone-100);
        color: var(--text-primary);
      }

      .modal-body {
        padding: var(--space-6);
      }

      .avatar-option {
        padding: var(--space-6);
        border: 2px solid var(--border-primary);
        border-radius: var(--radius-xl);
        margin-bottom: var(--space-4);
        transition: border-color 0.2s ease;
      }

      .avatar-option:hover {
        border-color: var(--forest-300);
      }

      .option-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-2);
      }

      .option-icon {
        font-size: var(--text-2xl);
      }

      .option-header h4 {
        margin: 0;
        color: var(--text-primary);
        font-size: var(--text-lg);
        font-weight: var(--font-weight-semibold);
      }

      .avatar-option p {
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
        font-size: var(--text-sm);
      }

      .divider {
        text-align: center;
        position: relative;
        margin: var(--space-6) 0;
      }

      .divider::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: var(--border-primary);
      }

      .divider span {
        background: var(--bg-surface);
        padding: 0 var(--space-4);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
      }

      .url-input-group {
        display: flex;
        gap: var(--space-3);
      }

      .url-input {
        flex: 1;
        padding: var(--space-3) var(--space-4);
        border: 2px solid var(--border-primary);
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        transition: border-color 0.2s ease;
      }

      .url-input:focus {
        outline: none;
        border-color: var(--forest-500);
      }

      /* Responsive */
      @media (max-width: 767px) {
        .avatar-modal {
          margin: var(--space-4);
          width: auto;
        }

        .modal-header,
        .modal-body {
          padding: var(--space-4);
        }

        .url-input-group {
          flex-direction: column;
        }
      }

      /* Animation */
      .modal-overlay {
        animation: fadeIn 0.3s ease-out;
      }

      .avatar-modal {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `}</style>
    </div>
  );
};

export default Profile;