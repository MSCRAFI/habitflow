import React, { useState } from 'react';
import StreakFlame from './StreakFlame';

// Single habit card with streaks, quick-complete, and a dash of flair.
const HabitCard = ({ habit, onComplete, onEdit, onDelete }) => {
  const category = habit.category?.charAt(0).toUpperCase() + habit.category?.slice(1);
  const isCompleted = habit.completed_today;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const a11yId = `habit-${habit.id}`;
  return (
    <div 
      className={`habit-card ${isCompleted ? 'completed' : ''} ${isHovered ? 'hover-sway' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="habit-info" aria-labelledby={`${a11yId}-title`} aria-describedby={`${a11yId}-desc`}>
        <div 
          className="habit-icon" 
          style={{ 
            background: habit.color_code ? `linear-gradient(135deg, ${habit.color_code}, ${habit.color_code}90)` : 'var(--color-primary-200)',
            borderColor: habit.color_code || 'var(--color-primary-300)'
          }}
        >
          {habit.icon || ''}
        </div>
        <div className="habit-details">
          <h3 id={`${a11yId}-title`}>
            {habit.title}
            {habit.is_micro_habit && (
              <span className="badge badge-micro" title="2-minute rule">⚡ 2m</span>
            )}
          </h3>
          <p>{habit.description || 'Building this habit step by step'}</p>
          <div className="habit-meta">
            <span className="badge badge-primary">{category}</span>
            <span className="text-muted">• {habit.frequency}</span>
          </div>
        </div>
      </div>
      <div className="habit-actions">
        <StreakFlame value={habit.current_streak} />
        
        {onComplete && (
          <button 
            className={`habit-checkbox ${isCompleted ? 'completed' : ''} ${isPressed ? 'pressed' : ''}`}
            onClick={(e) => {
              // Quick CSS pulse for instant feedback 
              e.currentTarget.classList.add('completing');
              setTimeout(() => e.currentTarget.classList.remove('completing'), 600);
              onComplete(habit.id);
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            title={isCompleted ? 'Completed today' : 'Mark as completed'}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted && (
              <svg className="checkmark-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            )}
          </button>
        )}
        
        {onEdit && (
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => onEdit(habit)} 
            title="Edit habit"
            aria-label="Edit habit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        )}
        
        {onDelete && (
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => onDelete(habit.id)} 
            title="Delete habit"
            aria-label="Delete habit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(HabitCard);
