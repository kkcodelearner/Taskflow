import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { PlusCircle, X, Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';

export const TaskCreateModal = ({ isOpen, onClose, onTaskCreated }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [department, setDepartment] = useState('Engineering');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('16');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState(['', '']);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set default due date to 5 days from now
    const d = new Date();
    d.setDate(d.getDate() + 5);
    setDueDate(d.toISOString().slice(0, 10));

    // Fetch active employees
    const fetchEmployees = async () => {
      try {
        const res = await api.getEmployees();
        if (res.success && res.employees.length > 0) {
          setEmployees(res.employees);
          setAssignedTo(res.employees[0]._id);
        }
      } catch (err) {
        console.error('Failed to load employees for assignment', err);
      }
    };

    fetchEmployees();
  }, [isOpen]);

  const handleAddSubtaskField = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleSubtaskChange = (index, val) => {
    const next = [...subtasks];
    next[index] = val;
    setSubtasks(next);
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !assignedTo || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const validSubtasks = subtasks
        .filter((st) => st.trim().length > 0)
        .map((st) => ({ title: st.trim() }));

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        department,
        assignedTo,
        dueDate,
        estimatedHours: Number(estimatedHours) || 0,
        subtasks: validSubtasks,
        tags,
      });

      if (res.success) {
        if (onTaskCreated) onTaskCreated(res.task);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Create & Assign New Task</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                New tasks will be assigned in "Pending Acceptance" state.
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            {/* Task Title */}
            <div className="input-group">
              <label className="input-label">Task Title *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Implement OAuth2 SSO Integration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="input-group">
              <label className="input-label">Description & Requirements *</label>
              <textarea
                className="textarea-field"
                placeholder="Provide detailed instructions, context, and expected deliverable criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Row: Priority & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Priority Level</label>
                <select
                  className="select-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Department / Domain</label>
                <select
                  className="select-field"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            {/* Row: Assignee & Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Assign To Employee *</label>
                <select
                  className="select-field"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department} • {emp.activeTasksCount} active tasks)
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Due Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row: Estimated Hours & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Est. Hours</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Security, Backend, Sprint-15..."
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>

            {/* Subtask / Checklist Builder */}
            <div style={{ marginTop: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Checklist Deliverables / Subtasks
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  onClick={handleAddSubtaskField}
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>

              {subtasks.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ height: '34px', fontSize: '0.8rem' }}
                    placeholder={`Checklist item ${idx + 1}...`}
                    value={st}
                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                  />
                  {subtasks.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: '#ef4444' }}
                      onClick={() => handleRemoveSubtask(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
