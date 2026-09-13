import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Mail, CheckCircle2, Clock, Briefcase, UserPlus } from 'lucide-react';

export const TeamView = ({ onSelectEmployeeTasks }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await api.getEmployees();
        if (res.success) {
          setEmployees(res.employees);
        }
      } catch (err) {
        console.error('Failed to load team', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading team directory...
      </div>
    );
  }

  const getCapacityBadge = (count) => {
    if (count >= 4) {
      return <span className="badge badge-priority-urgent">High Workload ({count})</span>;
    }
    if (count >= 2) {
      return <span className="badge badge-priority-high">Moderate ({count})</span>;
    }
    return <span className="badge badge-completed">Available ({count})</span>;
  };

  return (
    <div>
      <div className="kanban-header">
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Engineering & Operations Team</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time workload distribution and capacity monitoring across team members.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {employees.map((member) => (
          <div key={member._id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img
                src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt={member.name}
                style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid var(--border-subtle)' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {member.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{member.title}</div>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className="badge badge-dept">{member.department}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Tasks</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {member.activeTasksCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Completed</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--status-completed)' }}>
                  {member.completedTasksCount}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Capacity</div>
                {getCapacityBadge(member.activeTasksCount)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} />
                <span>{member.email}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onSelectEmployeeTasks(member._id)}
              >
                View Tasks
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
