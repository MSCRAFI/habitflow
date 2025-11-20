import React from 'react';

const ChallengeCard = ({ challenge, onJoin }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="challenge-card">
      <h3 className="challenge-title">{challenge.title}</h3>
      {challenge.description && (
        <p className="text-secondary mb-lg">{challenge.description}</p>
      )}
      
      <div className="challenge-meta">
        <span>
          <span aria-hidden="true" className="icon" />
          {formatDate(challenge.start_date)} → {formatDate(challenge.end_date)}
        </span>
        <span>
          <span aria-hidden="true" className="icon" />
          Goal: {challenge.goal} days
        </span>
        <span>
          <span aria-hidden="true" className="icon" />
          {challenge.participants_count || 0} participants
        </span>
      </div>
      
      {onJoin && (
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => onJoin(challenge.id)}
          style={{ marginTop: 'var(--space-lg)' }}
        >
          Join Challenge
        </button>
      )}
    </div>
  );
};

export default ChallengeCard;
