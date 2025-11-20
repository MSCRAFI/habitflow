import React, { useState, useMemo, useCallback, useRef } from 'react';
import HabitCard from './HabitCard';

/**
 * Drag-and-drop + selection list for habits.
 *
 * Note: The DnD here is intentionally simple DOM DnD — no heavy libs required.
 */
const HabitList = ({
  habits,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleSelectAll,
  onReorder,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const [dragId, setDragId] = useState(null);
  const dragOverIdRef = useRef(null);

  const orderedHabits = useMemo(() => habits, [habits]);

  // Begin drag for reordering
  const handleDragStart = (id) => (e) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  // Track hover target while dragging
  const handleDragOver = (id) => (e) => {
    e.preventDefault();
    dragOverIdRef.current = id;
  };

  // Compute new order by moving dragged id to the drop index
  const handleDrop = (id) => (e) => {
    e.preventDefault();
    const fromId = dragId ?? Number(e.dataTransfer.getData('text/plain'));
    const toId = id;
    if (!fromId || !toId || fromId === toId) return;

    const ids = orderedHabits.map((h) => h.id);
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const newIds = [...ids];
    const [moved] = newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, moved);
    onReorder?.(newIds);
    setDragId(null);
    dragOverIdRef.current = null;
  };

  const handleDragEnd = () => {
    setDragId(null);
    dragOverIdRef.current = null;
  };

  const renderItem = useCallback((habit) => {
    const selected = selectedIds.has(habit.id);
    return (
      <div
        key={habit.id}
        className={`habit-row ${dragId === habit.id ? 'dragging' : ''}`}
        draggable
        onDragStart={handleDragStart(habit.id)}
        onDragOver={handleDragOver(habit.id)}
        onDrop={handleDrop(habit.id)}
        onDragEnd={handleDragEnd}
      >
        <div className="habit-row-left">
          <button className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">⋮⋮</button>
          <input
            type="checkbox"
            className="habit-select"
            checked={selected}
            onChange={() => onToggleSelect?.(habit.id)}
            aria-label={`Select ${habit.title}`}
          />
        </div>
        <div className="habit-row-card">
          <HabitCard
            habit={habit}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    );
  }, [selectedIds, onComplete, onEdit, onDelete, dragId, handleDrop, onToggleSelect]);

  return (
    <div className="habit-list">
      <div className="habit-list-header">
        <div className="left">
          <input
            type="checkbox"
            className="habit-select"
            checked={habits.length > 0 && selectedIds.size === habits.length}
            onChange={onToggleSelectAll}
            aria-label="Select all habits"
          />
          <span className="text-secondary">Select All</span>
        </div>
      </div>

      <div className="habit-list-body">
        {orderedHabits.map(renderItem)}
      </div>
    </div>
  );
};

export default React.memo(HabitList);
