import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Hourglass,
  ArrowRight,
  UserCheck,
  Ban,
} from 'lucide-react';

export const ActivityAuditView = ({ onSelectTask }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.getActivityFeed({ limit: 50 });
        if (res.success) {
          setActivities(res.activities);
        }
      } catch (err) {
        console.error('Failed to load activity logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'accepted':
        return <span className="badge badge-completed"><UserCheck size={12} /> Accepted</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><Ban size={12} /> Declined</span>;
      case 'created':
        return <span className="badge badge-dept">Created</span>;
      case 'assigned':
      case 'reassigned':
        return <span className="badge badge-pending">Assigned</span>;
      case 'status_changed':
        return <span className="badge badge-in_progress">Status Changed</span>;
      case 'subtask_completed':
        return <span className="badge badge-completed">Checklist Item</span>;
      case 'time_logged':
        return <span className="badge badge-dept"><Hourglass size={12} /> Logged Hours</span>;
      case 'comment_added':
        return <span className="badge badge-dept"><MessageSquare size={12} /> Comment</span>;
      default:
        return <span className="badge badge-dept">{action}</span>;
    }
  };

  return (
    <div>
      <div className="kanban-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Enterprise System Audit Trail</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tamper-evident chronological log of all task assignments, acceptances, rejections, and state updates.
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit feed...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No activity recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activities.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={act.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt={act.user?.name}
                  style={{ width: '34px', height: '34px', borderRadius: '50%', marginTop: '2px' }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {act.user?.name || 'System User'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({act.user?.role})
                    </span>
                    {getActionBadge(act.action)}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {act.description}
                  </div>

                  {act.task && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task:</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', color: 'var(--primary)' }}
                        onClick={() => onSelectTask(act.task._id)}
                      >
                        {act.task.title}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
