import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const IdentityTracker = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [identity, setIdentity] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile(data);
      setIdentity(data?.identity || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await api.updateProfile({ identity });
      setProfile(updatedProfile);
      setEditing(false);
      showSuccess('Identity updated successfully!');
    } catch (error) {
      console.error('Failed to update identity:', error);
      showError('Failed to update identity');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'var(--color-success-500)';
    if (progress >= 60) return 'var(--color-primary-500)';
    if (progress >= 40) return 'var(--color-warning-500)';
    return 'var(--color-neutral-400)';
  };

  const identityProgress = profile?.identity_progress || 0;

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Identity Progress</h3>
        </div>
        <div className="card-body">
          <div className="loading-skeleton" style={{ height: '80px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Identity Progress</h3>
        <p className="text-sm text-secondary">
          Track progress toward who you want to become
        </p>
      </div>

      <div className="card-body">
        <div className="identity-section" style={{ textAlign: 'center' }}>
          {/* Identity Statement */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="form-label">I am becoming...</label>
            {editing ? (
              <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="e.g., A person who exercises daily"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary btn-sm" onClick={handleSave}>
                  Save
                </button>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => {
                    setEditing(false);
                    setIdentity(profile?.identity || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div 
                style={{ 
                  padding: 'var(--space-md)',
                  backgroundColor: 'var(--color-neutral-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed var(--border-primary)',
                  cursor: 'pointer',
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setEditing(true)}
              >
                {identity ? (
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      "{identity}"
                    </div>
                    <div className="text-sm text-secondary" style={{ marginTop: 'var(--space-xs)' }}>
                      Click to edit
                    </div>
                  </div>
                ) : (
                  <div className="text-secondary">
                    Click to set your identity goal
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Circle */}
          {identity && (
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <div className="progress-circle-container" style={{ position: 'relative', display: 'inline-block' }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--color-neutral-200)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={getProgressColor(identityProgress)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - identityProgress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {identityProgress}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Progress
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tips */}
          <div className="identity-tips" style={{ textAlign: 'left' }}>
            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
              Building Your Identity
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              color: 'var(--text-secondary)',
              fontSize: '0.875rem'
            }}>
              <li style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span>✅</span> 
                <span>Each completed habit is a vote for your new identity</span>
              </li>
              <li style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span>🔁</span> 
                <span>Focus on small, consistent actions</span>
              </li>
              <li style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span aria-hidden="true" style={{width: '1rem', display: 'inline-block'}} /> 
                <span>Ask "What would a {identity ? identity.toLowerCase() : 'successful person'} do?"</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityTracker;