import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const HabitStackBuilder = () => {
  const [habits, setHabits] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [form, setForm] = useState({ habit: '', anchor_habit: '', position: 0 });
  const { showError, showSuccess } = useNotification();

  const load = async () => {
    try {
      const hs = await api.getHabits();
      setHabits(hs.results || hs || []);
      const stackList = await api.getHabitStacks();
      setStacks(stackList.results || stackList || []);
    } catch (e) {
      console.error(e);
      showError('Failed to load habit stacks');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.createHabitStack(form);
      showSuccess('Added to stack');
      setForm({ habit: '', anchor_habit: '', position: 0 });
      load();
    } catch (e) {
      console.error(e);
      showError('Could not create stack');
    }
  };

  return (
    <div className="forest-card">
      <h3 className="card-title">Habit Stacking</h3>
      <p className="text-secondary">After I [anchor habit], I will [habit].</p>
      <form onSubmit={create} className="forest-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Anchor Habit</label>
            <select className="form-input" value={form.anchor_habit} onChange={e=>setForm({...form, anchor_habit: e.target.value})} required>
              <option value="">Select habit</option>
              {habits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">New Habit</label>
            <select className="form-input" value={form.habit} onChange={e=>setForm({...form, habit: e.target.value})} required>
              <option value="">Select habit</option>
              {habits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Position</label>
            <input className="form-input" type="number" value={form.position} onChange={e=>setForm({...form, position: Number(e.target.value)})} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary">Add</button>
        </div>
      </form>

      {stacks.length > 0 && (
        <div className="stack-list">
          {stacks.map(s => (
            <div key={s.id} className="stack-item">
              <span className="text-secondary">After</span> <strong>{s.anchor_habit_title}</strong> <span className="text-secondary">I will</span> <strong>{s.habit_title}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitStackBuilder;
