import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';

const BadgeShowcase = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const data = await api.getBadges();
      setBadges(Array.isArray(data) ? data : (data?.results || []));
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      showError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>Achievements</h3>
        </div>
        <div className="card-body">
          <div className="flex gap-md">
            {[1, 2, 3].map(i => (
              <div key={i} className="loading-skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Achievements</h3>
        <div className="text-sm text-secondary">
          {badges.length} earned
        </div>
      </div>
      <div className="card-body">
        {badges.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--space-2xl)' }}>
            <div style={{ height: '48px', marginBottom: 'var(--space-md)' }} />
            <p className="text-secondary">
              Complete habits to earn your first badge!
            </p>
          </div>
        ) : (
          <div className="badges-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 'var(--space-md)',
            padding: 'var(--space-sm)'
          }}>
            {badges.map(userBadge => (
              <div 
                key={userBadge.id}
                className="badge-item"
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-neutral-50)',
                  border: '2px solid var(--color-primary-200)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--color-primary-400)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--color-primary-200)';
                }}
                title={userBadge.badge.description}
              >
                <div 
                  className="badge-icon"
                  style={{
                    fontSize: '2.5rem',
                    marginBottom: 'var(--space-sm)',
                    display: 'block'
                  }}
                >
                  {userBadge.badge.icon}
                </div>
                <div 
                  className="badge-name"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-xs)',
                    lineHeight: 1.2
                  }}
                >
                  {userBadge.badge.name}
                </div>
                <div 
                  className="badge-points"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-primary-600)',
                    fontWeight: '500'
                  }}
                >
                  +{userBadge.badge.points}pts
                </div>
                <div 
                  className="badge-date"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--space-xs)'
                  }}
                >
                  {new Date(userBadge.awarded_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeShowcase;