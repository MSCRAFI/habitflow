import React from 'react';

const BadgeCard = ({ badge }) => {
  const icon = badge.badge?.icon || badge.icon || '🏅';
  const name = badge.badge?.name || badge.name;
  const description = badge.badge?.description || badge.description;
  return (
    <div className={`badge-card ${badge.earned || badge.awarded_at ? 'earned' : 'locked'}`}>
      <div className="badge-icon">{icon}</div>
      <div className="badge-info">
        <h4 className="badge-name">{name}</h4>
        {description && <p className="badge-description">{description}</p>}
      </div>
      {badge.earned || badge.awarded_at ? <div className="badge-shine"/> : null}
    </div>
  );
};

export default BadgeCard;
