import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Hourglass,
  CheckSquare,
} from 'lucide-react';

export const AnalyticsView = () => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading performance metrics and insights...
      </div>
    );
  }

  const { summary, priorityBreakdown, departmentBreakdown, teamWorkload } = analytics;

  return (
    <div>
      {/* Metric Cards Row */}
      <div className="analytics-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="metric-value">{summary.totalTasks}</div>
            <div className="metric-label">Total Assigned Tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-value">{summary.pendingTasks}</div>
            <div className="metric-label">Awaiting Acceptance</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="metric-value">{summary.inProgressTasks}</div>
            <div className="metric-label">In Progress</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="metric-value">{summary.completionRate}%</div>
            <div className="metric-label">Completion Velocity</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="metric-value" style={{ color: summary.overdueTasks > 0 ? '#ef4444' : 'inherit' }}>
              {summary.overdueTasks}
            </div>
            <div className="metric-label">Overdue Tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
            <Hourglass size={24} />
          </div>
          <div>
            <div className="metric-value">{summary.totalActualHours}h</div>
            <div className="metric-label">Logged / {summary.totalEstimatedHours}h Est.</div>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="charts-row">
        {/* Status Distribution Meter */}
        <div className="chart-card">
          <h3 className="chart-title">Workflow Stage Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'Pending Acceptance', count: summary.pendingTasks, color: 'var(--status-pending)' },
              { label: 'In Progress', count: summary.inProgressTasks, color: 'var(--status-progress)' },
              { label: 'In Review', count: summary.inReviewTasks, color: 'var(--status-review)' },
              { label: 'Completed', count: summary.completedTasks, color: 'var(--status-completed)' },
              { label: 'Declined / Rejected', count: summary.rejectedTasks, color: 'var(--status-rejected)' },
            ].map((item) => {
              const pct = summary.totalTasks > 0 ? Math.round((item.count / summary.totalTasks) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown Meter */}
        <div className="chart-card">
          <h3 className="chart-title">Priority Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'Urgent', count: priorityBreakdown.urgent, color: 'var(--priority-urgent)' },
              { label: 'High', count: priorityBreakdown.high, color: 'var(--priority-high)' },
              { label: 'Medium', count: priorityBreakdown.medium, color: 'var(--priority-medium)' },
              { label: 'Low', count: priorityBreakdown.low, color: 'var(--priority-low)' },
            ].map((item) => {
              const pct = summary.totalTasks > 0 ? Math.round((item.count / summary.totalTasks) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label} Priority</span>
                    <span style={{ fontWeight: 700 }}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Workload Breakdown (If Admin) */}
      {isAdmin && teamWorkload && teamWorkload.length > 0 && (
        <div className="chart-card">
          <h3 className="chart-title">Team Workload & Distribution Capacity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {teamWorkload.map((member) => (
              <div key={member.id} className="workload-row">
                <div className="workload-user">
                  <img
                    src={member.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                    alt={member.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{member.title} • {member.department}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: member.activeTasks > 3 ? '#f97316' : 'var(--text-primary)' }}>
                      {member.activeTasks} Active
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {member.completedTasks} completed
                    </div>
                  </div>

                  <div style={{ width: '120px' }}>
                    <div className="progress-track" style={{ height: '7px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${member.totalAssigned > 0 ? Math.round((member.completedTasks / member.totalAssigned) * 100) : 0}%`,
                          background: 'var(--status-completed)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
