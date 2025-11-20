// Imports: React -> third-party -> services -> hooks -> components -> styles
import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import ChallengeCard from '../components/ChallengeCard';

const emptyForm = () => ({
  title: '',
  description: '',
  start_date: new Date().toISOString().slice(0,10),
  end_date: new Date(Date.now() + 1000*60*60*24*7).toISOString().slice(0,10),
  goal: 7,
});

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const { showError, showSuccess } = useNotification();

  const fetchChallenges = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getChallenges();
      setChallenges(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error(e);
      showError('Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Initial fetch on mount; dependency keeps it stable
  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createChallenge(form);
      showSuccess('Challenge created!');
      setShowCreate(false);
      setForm(emptyForm());
      fetchChallenges();
    } catch (e) {
      console.error(e);
      showError('Could not create challenge');
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.joinChallenge(id);
      showSuccess('Joined challenge');
      fetchChallenges();
    } catch (e) {
      console.error(e);
      showError('Failed to join challenge');
    }
  };

  return (
    <div className="modern-challenges-container">
      <div className="challenges-header">
        <div className="header-content">
          <div className="header-main">
            <h1 className="page-title">🏆 Community Challenges</h1>
            <p className="page-subtitle">
              Join challenges, compete with friends, and achieve your goals together
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary btn-lg modern-btn" 
              onClick={() => setShowCreate(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create Challenge
            </button>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content challenge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Challenge</h2>
            </div>
            
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  className="form-input" 
                  value={form.title} 
                  onChange={e=>setForm({...form,title:e.target.value})} 
                  required
                  placeholder="Enter challenge title"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  value={form.description} 
                  onChange={e=>setForm({...form,description:e.target.value})}
                  placeholder="Describe your challenge"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-lg">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.start_date} 
                    onChange={e=>setForm({...form,start_date:e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.end_date} 
                    onChange={e=>setForm({...form,end_date:e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Goal (days)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={form.goal} 
                    onChange={e=>setForm({...form,goal:Number(e.target.value)})}
                    min="1"
                    placeholder="7"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="challenges-content">
        {challenges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No challenges yet</h3>
            <p>Create or join challenges to compete with others and stay motivated on your habit journey!</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreate(true)}>
              Create First Challenge
            </button>
          </div>
        ) : (
          <div className="challenges-grid">
            {challenges.map(ch => (
              <ChallengeCard key={ch.id} challenge={ch} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
      .modern-challenges-container {
        min-height: 100vh;
        background: linear-gradient(135deg, var(--forest-50) 0%, var(--amber-50) 100%);
        padding: var(--space-6) var(--space-4);
      }

      .challenges-header {
        margin-bottom: var(--space-8);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: var(--space-6);
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

      .challenges-content {
        background: var(--bg-surface);
        border-radius: var(--radius-3xl);
        box-shadow: var(--shadow-xl);
        min-height: 600px;
        padding: var(--space-8);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 400px;
        padding: var(--space-8);
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: var(--space-6);
        opacity: 0.7;
      }

      .empty-state h3 {
        font-size: var(--text-2xl);
        color: var(--text-primary);
        margin-bottom: var(--space-4);
      }

      .empty-state p {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        max-width: 400px;
        margin-bottom: var(--space-6);
        line-height: var(--leading-relaxed);
      }

      .challenges-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: var(--space-6);
      }

      /* Modal Styles - Fixed for better visibility */
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
        backdrop-filter: blur(4px);
      }

      .challenge-modal {
        width: 100%;
        max-width: 700px;
        background: var(--bg-surface);
        border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-2xl);
        border: 1px solid var(--border-primary);
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        z-index: 1001;
      }

      .modal-header {
        padding: var(--space-6) var(--space-6) var(--space-4);
        border-bottom: 1px solid var(--border-primary);
        background: var(--stone-50);
        border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
      }

      .modal-header h2 {
        margin: 0;
        color: var(--text-primary);
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
      }

      .challenge-modal form {
        padding: var(--space-6);
      }

      .form-group {
        margin-bottom: var(--space-6);
      }

      .form-label {
        display: block;
        margin-bottom: var(--space-2);
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
        font-size: var(--text-sm);
      }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        border: 2px solid var(--border-primary);
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        transition: all 0.2s ease;
        background: var(--bg-surface);
        font-family: inherit;
      }

      .form-input:focus,
      .form-textarea:focus {
        outline: none;
        border-color: var(--forest-500);
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
      }

      .form-textarea {
        resize: vertical;
        min-height: 80px;
      }

      .flex {
        display: flex;
      }

      .gap-lg {
        gap: var(--space-4);
      }

      .modal-actions {
        display: flex;
        gap: var(--space-3);
        justify-content: flex-end;
        margin-top: var(--space-8);
        padding-top: var(--space-6);
        border-top: 1px solid var(--border-primary);
      }

      /* Responsive Design */
      @media (max-width: 1023px) {
        .header-content {
          flex-direction: column;
          align-items: stretch;
          gap: var(--space-6);
        }

        .challenges-grid {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
      }

      @media (max-width: 767px) {
        .modern-challenges-container {
          padding: var(--space-4) var(--space-3);
        }

        .page-title {
          font-size: var(--text-4xl);
        }

        .challenges-content {
          padding: var(--space-6);
        }

        .challenges-grid {
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        .flex {
          flex-direction: column;
        }

        .gap-lg {
          gap: var(--space-3);
        }

        .modal-header {
          padding: var(--space-4);
        }

        .challenge-modal form {
          padding: var(--space-4);
        }

        .modal-actions {
          flex-direction: column;
        }
      }

      /* Animation for modal */
      .modal-overlay {
        animation: fadeIn 0.3s ease-out;
      }

      .challenge-modal {
        animation: slideIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
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

      /* Accessibility */
      .form-input:focus-visible,
      .form-textarea:focus-visible {
        outline: 2px solid var(--forest-500);
        outline-offset: 2px;
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .challenge-modal {
          border-width: 3px;
        }

        .form-input,
        .form-textarea {
          border-width: 3px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .modal-overlay,
        .challenge-modal,
        .modern-btn {
          animation: none;
          transition: none;
        }
      }
    `}</style>
    </div>
  );
};

export default Challenges;
