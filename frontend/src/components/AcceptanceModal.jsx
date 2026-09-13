import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export const AcceptanceModal = ({ isOpen, onClose, task, mode, onConfirm }) => {
  if (!isOpen || !task) return null;

  const isAccept = mode === 'accept';
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const quickReasons = [
    'Capacity saturated with current sprint commitments',
    'Technical scope requires additional architecture clarification',
    'External prerequisite dependencies not yet satisfied',
    'Requires skillset outside of current engineering domain',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAccept && (!note || note.trim().length < 5)) {
      setError('Please provide a clear reason (minimum 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(task._id, note);
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isAccept ? (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <CheckCircle2 size={18} />
              </div>
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                <AlertTriangle size={18} />
              </div>
            )}
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
                {isAccept ? 'Accept Task Assignment' : 'Decline Task Assignment'}
              </h3>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Task to {isAccept ? 'Accept' : 'Decline'}:</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                Due Date: {new Date(task.dueDate).toLocaleDateString()} • Priority: {task.priority.toUpperCase()}
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            {isAccept ? (
              <div className="input-group">
                <label className="input-label">Acceptance Notes / Kickoff Message (Optional)</label>
                <textarea
                  className="textarea-field"
                  placeholder="e.g. Reviewed requirements, starting branch setup today..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Accepting this task will change its status to <strong>In Progress</strong> and notify the assigner.
                </span>
              </div>
            ) : (
              <div className="input-group">
                <label className="input-label">
                  Reason for Declining <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  className="textarea-field"
                  placeholder="Explain why this task cannot be accepted (workload, scope, dependencies)..."
                  value={note}
                  required
                  onChange={(e) => {
                    setNote(e.target.value);
                    setError('');
                  }}
                />

                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Quick suggestions:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {quickReasons.map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          fontSize: '0.74rem',
                          background: 'var(--bg-surface-elevated)',
                          padding: '0.35rem 0.6rem',
                        }}
                        onClick={() => {
                          setNote(reason);
                          setError('');
                        }}
                      >
                        • {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${isAccept ? 'btn-success' : 'btn-danger'}`}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : isAccept ? 'Confirm & Accept Task' : 'Confirm Decline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
