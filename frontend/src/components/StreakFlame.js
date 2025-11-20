import React from 'react';

const StreakFlame = ({ value = 0 }) => {
  const active = value > 0;
  return (
    <div className={`streak-flame ${active ? 'active' : ''}`} title={`${value} day streak`} aria-label={`${value} day streak`}>
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ marginRight: 6 }}>
        <path fill="currentColor" d="M12 2c1.5 3-1 5-1 7 0 2 1.5 3 3 3s3-1.3 3-3c0-1.8-1.2-3.6-3-5.5C12.8 1.5 12 1 12 1s.2 1.2-1 2.5C9 5 8 6.3 8 8c0 3 2.5 5.5 5.5 5.5S19 11 19 8c0-2-1-3.9-3-6 2.5 5-.5 5.5-.5 7.5 0 1.4 1 2.5 2.5 2.5 2 0 3.5-1.7 3.5-3.8C21.5 5.8 20 3.6 17.5 1.5 16 .2 15 0 15 0s.1 1.1-1.3 2.7C12.6 4.1 11.5 5.6 11.5 7.5c0 2.3 1.7 4 4 4 2.1 0 3.5-1.7 3.5-3.8"/>
      </svg>
      <span className="streak-count">{value}</span>
    </div>
  );
};

export default StreakFlame;
