import React, { useState, useEffect } from 'react';

const CommunityAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'streaks', name: 'Streaks', icon: '🔥' },
    { id: 'milestones', name: 'Milestones', icon: '⭐' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'challenges', name: 'Challenges', icon: '🎯' }
  ];

  useEffect(() => {
    // Mock achievements data - replace with actual API call
    const mockAchievements = [
      {
        id: 1,
        type: 'streaks',
        title: '🔥 Fire Starter',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        progress: 100,
        unlocked: true,
        rarity: 'common',
        unlockedAt: '2025-11-15T10:00:00Z',
        users: 234
      },
      {
        id: 2,
        type: 'streaks',
        title: '💪 Consistency Champion',
        description: 'Maintained a 30-day streak',
        icon: '💪',
        progress: 85,
        unlocked: false,
        rarity: 'rare',
        requirement: '30 days',
        users: 89
      },
      {
        id: 3,
        type: 'milestones',
        title: '🌟 Rising Star',
        description: 'Completed 50 habits',
        icon: '🌟',
        progress: 100,
        unlocked: true,
        rarity: 'uncommon',
        unlockedAt: '2025-11-20T14:30:00Z',
        users: 156
      },
      {
        id: 4,
        type: 'social',
        title: '🤝 Community Builder',
        description: 'Helped 10 community members',
        icon: '🤝',
        progress: 60,
        unlocked: false,
        rarity: 'epic',
        requirement: '10 helps',
        users: 45
      },
      {
        id: 5,
        type: 'challenges',
        title: '🎯 Challenge Master',
        description: 'Completed 5 community challenges',
        icon: '🎯',
        progress: 100,
        unlocked: true,
        rarity: 'legendary',
        unlockedAt: '2025-11-25T09:15:00Z',
        users: 23
      },
      {
        id: 6,
        type: 'milestones',
        title: '⚡ Lightning Fast',
        description: 'Completed habit in under 5 minutes',
        icon: '⚡',
        progress: 100,
        unlocked: true,
        rarity: 'common',
        unlockedAt: '2025-11-10T08:45:00Z',
        users: 345
      }
    ];
    
    setAchievements(mockAchievements);
    setLoading(false);
  }, []);

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.type === selectedCategory);

  const getRarityStyle = (rarity) => {
    const styles = {
      common: {
        bg: 'linear-gradient(135deg, #6b7280, #4b5563)',
        border: 'rgba(107, 114, 128, 0.3)',
        glow: 'rgba(107, 114, 128, 0.2)'
      },
      uncommon: {
        bg: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'rgba(16, 185, 129, 0.3)',
        glow: 'rgba(16, 185, 129, 0.2)'
      },
      rare: {
        bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        border: 'rgba(59, 130, 246, 0.3)',
        glow: 'rgba(59, 130, 246, 0.2)'
      },
      epic: {
        bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        border: 'rgba(139, 92, 246, 0.3)',
        glow: 'rgba(139, 92, 246, 0.2)'
      },
      legendary: {
        bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'rgba(245, 158, 11, 0.3)',
        glow: 'rgba(245, 158, 11, 0.2)'
      }
    };
    return styles[rarity] || styles.common;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="achievements-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2 className="achievements-title">🏆 Community Achievements</h2>
        <p className="achievements-subtitle">
          Unlock badges by completing habits and engaging with the community
        </p>
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="achievements-grid">
        {filteredAchievements.map(achievement => {
          const rarityStyle = getRarityStyle(achievement.rarity);
          return (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-header">
                <div 
                  className="achievement-icon"
                  style={{ background: rarityStyle.bg }}
                >
                  {achievement.icon}
                </div>
                <div className="achievement-rarity">
                  <span 
                    className="rarity-badge"
                    style={{ 
                      background: rarityStyle.bg,
                      boxShadow: `0 0 20px ${rarityStyle.glow}`
                    }}
                  >
                    {achievement.rarity}
                  </span>
                </div>
              </div>

              <div className="achievement-content">
                <h3 className="achievement-name">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>

                {achievement.unlocked ? (
                  <div className="achievement-unlocked">
                    <div className="unlock-info">
                      <span className="unlock-text">✅ Unlocked</span>
                      <span className="unlock-time">
                        {formatTimeAgo(achievement.unlockedAt)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${achievement.progress}%`,
                          background: rarityStyle.bg
                        }}
                      />
                    </div>
                    <div className="progress-text">
                      {achievement.progress}% • {achievement.requirement}
                    </div>
                  </div>
                )}

                <div className="achievement-stats">
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span className="stat-text">{achievement.users} earned</span>
                  </div>
                </div>
              </div>

              {achievement.unlocked && (
                <div className="celebration-effect">
                  <div className="particle particle-1">✨</div>
                  <div className="particle particle-2">⭐</div>
                  <div className="particle particle-3">💫</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .achievements-container {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 1.5rem;
          backdrop-filter: blur(10px);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .achievements-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .achievements-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 0.5rem 0;
        }

        .achievements-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin: 0;
          line-height: 1.6;
        }

        .category-filters {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }

        .category-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .category-icon {
          font-size: 1.25rem;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .achievement-card {
          background: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .achievement-card.unlocked {
          border-color: rgba(16, 185, 129, 0.3);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.1);
        }

        .achievement-card.locked {
          opacity: 0.7;
          filter: grayscale(20%);
        }

        .achievement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .achievement-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        .achievement-icon::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: inherit;
          border-radius: 50%;
          z-index: -1;
          opacity: 0.3;
          filter: blur(8px);
        }

        .rarity-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .achievement-content {
          text-align: center;
        }

        .achievement-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .achievement-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }

        .achievement-unlocked {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
          border-radius: 1rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
        }

        .unlock-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .unlock-text {
          color: #059669;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .unlock-time {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        .achievement-progress {
          margin-bottom: 1rem;
        }

        .progress-bar {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 1rem;
          height: 8px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          border-radius: 1rem;
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .achievement-stats {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .stat-icon {
          font-size: 1rem;
        }

        .celebration-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          font-size: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        .particle-1 {
          top: 10%;
          left: 20%;
          animation-delay: 0s;
        }

        .particle-2 {
          top: 30%;
          right: 15%;
          animation-delay: 1s;
        }

        .particle-3 {
          bottom: 20%;
          left: 50%;
          animation-delay: 2s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 767px) {
          .achievements-container {
            padding: 1.5rem;
          }

          .achievements-title {
            font-size: 1.75rem;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .achievement-card {
            padding: 1rem;
          }

          .achievement-icon {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }

          .category-filters {
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .category-btn {
            white-space: nowrap;
            flex-shrink: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .achievement-card,
          .particle,
          .progress-fill::after {
            animation: none;
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunityAchievements;