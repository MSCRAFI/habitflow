import React, { useState } from 'react';
import ThemeSelector from '../components/ThemeSelector';
import HabitCard from '../components/HabitCard';
import ChallengeCard from '../components/ChallengeCard';
import SocialFeedItem from '../components/SocialFeedItem';

const ThemeDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  // Sample data for demonstration
  const sampleHabit = {
    id: 1,
    title: "Drink Water",
    description: "Drink 8 glasses of water daily for better health",
    category: "health",
    frequency: "daily",
    color_code: "#3B82F6",
    icon: "💧",
    is_micro_habit: false,
    current_streak: 7,
    completed_today: false
  };

  const sampleChallenge = {
    id: 1,
    title: "30-Day Fitness Challenge",
    description: "Complete 30 minutes of exercise every day",
    start_date: "2025-11-01",
    end_date: "2025-11-30",
    goal: 30,
    participants_count: 24
  };

  const sampleFeedItem = {
    id: 1,
    type: "completion",
    message: "Sarah completed her 'Morning Meditation' habit and reached a 10-day streak! 🧘‍♀️",
    created_at: new Date().toISOString(),
    comments: [
      { id: 1, user_name: "Alex", text: "Amazing! Keep it up! 💪" },
      { id: 2, user_name: "Maria", text: "Inspiring! I should start meditating too." }
    ]
  };

  const mockComplete = (id) => {
    // Complete habit (demo)
  };

  const mockEdit = (habit) => {
    // Edit habit (demo)
    setShowModal(true);
  };

  const mockDelete = (id) => {
    // Delete habit (demo)
  };

  const mockJoin = (id) => {
    // Join challenge (demo)
  };

  const mockFeedAction = () => {
    // Feed action triggered (demo)
  };

  return (
    <div style={{ padding: 'var(--space-xl)' }} className="page-transition">
      <div className="page-header">
        <div></div>
        <h1 className="page-title">Theme Showcase</h1>
        <div></div>
      </div>

      {/* Theme Selector */}
      <div className="card mb-xl">
        <div className="card-header">
          <h2>Theme Selector</h2>
        </div>
        <div className="card-body">
          <ThemeSelector />
        </div>
      </div>

      {/* Component Showcase */}
      <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
        
        {/* Buttons */}
        <div className="card">
          <div className="card-header">
            <h3>Button Styles</h3>
          </div>
          <div className="card-body">
            <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              <button className="btn btn-ghost">Ghost Button</button>
              <button className="btn btn-primary btn-sm">Small Button</button>
              <button className="btn btn-primary btn-lg">Large Button</button>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="card">
          <div className="card-header">
            <h3>Form Elements</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: 'var(--space-lg)', maxWidth: '400px' }}>
              <div className="form-group">
                <label className="form-label">Text Input</label>
                <input className="form-input" placeholder="Enter text here..." />
              </div>
              
              <div className="form-group">
                <label className="form-label">Select Dropdown</label>
                <select className="form-select">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Textarea</label>
                <textarea className="form-textarea" placeholder="Enter longer text..." rows="3" />
              </div>
              
              <div className="form-group">
                <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                  <div className="checkbox-wrapper">
                    <div 
                      className={`checkbox ${checkboxChecked ? 'checked' : ''}`}
                      onClick={() => setCheckboxChecked(!checkboxChecked)}
                    />
                  </div>
                  Checkbox with tick mark animation
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Habit Card */}
        <div className="card">
          <div className="card-header">
            <h3>Habit Card</h3>
          </div>
          <div className="card-body">
            <HabitCard 
              habit={sampleHabit}
              onComplete={mockComplete}
              onEdit={mockEdit}
              onDelete={mockDelete}
            />
          </div>
        </div>

        {/* Challenge Card */}
        <div className="card">
          <div className="card-header">
            <h3>Challenge Card</h3>
          </div>
          <div className="card-body">
            <div style={{ maxWidth: '350px' }}>
              <ChallengeCard 
                challenge={sampleChallenge}
                onJoin={mockJoin}
              />
            </div>
          </div>
        </div>

        {/* Social Feed Item */}
        <div className="card">
          <div className="card-header">
            <h3>Social Feed Item</h3>
          </div>
          <div className="card-body">
            <SocialFeedItem 
              item={sampleFeedItem}
              onAction={mockFeedAction}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="card">
          <div className="card-header">
            <h3>Badges & Labels</h3>
          </div>
          <div className="card-body">
            <div className="flex gap-md items-center" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-primary">Primary Badge</span>
              <span className="badge badge-success">Success Badge</span>
              <span className="badge badge-micro">Micro Badge</span>
              <div className="streak-flame">
                <span>🔥</span>
                <span className="streak-count">15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div className="card">
          <div className="card-header">
            <h3>Loading States</h3>
          </div>
          <div className="card-body">
            <div className="loading">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Demo */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Modal Example</h2>
            </div>
            
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <p>This is a sample modal with the new elegant design system.</p>
              <p className="text-secondary">Notice the smooth backdrop blur and slide-up animation.</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowModal(false)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Controls */}
      <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card-header">
          <h3>Demo Controls</h3>
        </div>
        <div className="card-body">
          <div className="flex gap-md">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Show Modal
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setCheckboxChecked(!checkboxChecked)}
            >
              Toggle Checkbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;