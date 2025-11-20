import React, { useState } from 'react';
import { validateHabit } from '../utils/validation';

/**
 * Form for creating/updating a Habit. Keeps validation simple and predictable.
 * Does not submit to any API by itself; delegates save to parent via onSubmit.
 */
const HabitForm = ({ initial = {}, onSubmit, submitLabel = 'Save' }) => {
  const [values, setValues] = useState({
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || 'general',
    frequency: initial.frequency || 'daily',
    color_code: initial.color_code || '',
    icon: initial.icon || '',
    is_micro_habit: initial.is_micro_habit || false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = validateHabit(values);
    if (!res.valid) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    onSubmit?.(values);
  };

  return (
    <form onSubmit={handleSubmit} className="forest-form" noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={values.title} onChange={handleChange('title')} required />
          {errors.title && <div className="form-error" role="alert">{errors.title}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" value={values.description} onChange={handleChange('description')} rows={3} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={values.category} onChange={handleChange('category')}>
            <option value="general">General</option>
            <option value="health">Health</option>
            <option value="work">Work</option>
            <option value="learning">Learning</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Frequency</label>
          <select className="form-input" value={values.frequency} onChange={handleChange('frequency')}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <input className="form-input" value={values.icon} onChange={handleChange('icon')} placeholder="e.g., 🌱" />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <input className="form-input" value={values.color_code} onChange={handleChange('color_code')} placeholder="#3B82F6" />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <input id="is_micro_habit" type="checkbox" checked={values.is_micro_habit} onChange={handleChange('is_micro_habit')} />
          <label htmlFor="is_micro_habit" className="form-label" style={{ margin: 0 }}>Micro habit (2m rule)</label>
        </div>
      </div>

      <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
};

export default React.memo(HabitForm);
