import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  Calendar,
  CheckSquare,
  ArrowRight,
  UserCheck,
  Ban,
  Tag,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'pending_acceptance',
    title: 'Pending Acceptance',
    color: 'var(--status-pending)',
    icon: Clock,
    badgeClass: 'badge-pending',
    description: 'Assigned, awaiting employee acceptance or decline',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: 'var(--status-progress)',
    icon: ArrowRight,
    badgeClass: 'badge-in_progress',
    description: 'Accepted and actively being worked on',
  },
  {
    id: 'in_review',
    title: 'In Review',
    color: 'var(--status-review)',
    icon: CheckSquare,
    badgeClass: 'badge-in_review',
    description: 'Work completed, awaiting manager verification',
  },
  {
    id: 'completed',
    title: 'Completed',
    color: 'var(--status-completed)',
    icon: CheckCircle2,
    badgeClass: 'badge-completed',
    description: 'Approved and delivered',
  },
  {
    id: 'rejected',
    title: 'Declined / Rejected',
    color: 'var(--status-rejected)',
    icon: XCircle,
    badgeClass: 'badge-rejected',
    description: 'Declined by assignee with justification',
  },
];

export const KanbanBoard = ({
  tasks,
  loading,
  onSelectTask,
  onQuickAccept,
  onQuickReject,
  priorityFilter,
  setPriorityFilter,
  departmentFilter,
  setDepartmentFilter,
  scope,
  setScope,
}) => {
  const { user, isAdmin } = useAuth();

  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      {/* Filter and Scope Control Bar */}
      <div className="kanban-header">
        <div className="filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Filter size={15} />
            <span>Filters:</span>
          </div>

          {/* Scope Toggle for Employees */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn btn-sm ${scope === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setScope('all')}
            >
              All Team Tasks
            </button>
            <button
              className={`btn btn-sm ${scope === 'my' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
              onClick={() => setScope('my')}
            >
              Assigned to Me
            </button>
          </div>

          {/* Priority Filter */}
          <select
            className="select-field"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Department Filter */}
          <select
            className="select-field"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
            <option value="DevOps">DevOps</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Showing <strong>{tasks.length}</strong> tasks
        </div>
      </div>

      {/* 5-Stage Kanban Grid */}
      <div className="kanban-grid">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="kanban-column">
              <div className="column-header">
                <div className="column-title-group">
                  <ColIcon size={16} style={{ color: col.color }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{col.title}</span>
                </div>
                <span className="column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-cards-container">
                {colTasks.length === 0 ? (
                  <div style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.5rem',
                  }}>
                    No tasks in {col.title.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    const isAssignee = task.assignedTo?._id === user?.id || task.assignedTo === user?.id;
                    const canAcceptDecline = (isAssignee || isAdmin) && task.status === 'pending_acceptance';

                    return (
                      <div
                        key={task._id}
                        className="kanban-card"
                        onClick={() => onSelectTask(task._id)}
                      >
                        {/* Top Meta Row */}
                        <div className="card-top">
                          <span className={`badge badge-priority-${task.priority}`}>
                            {task.priority === 'urgent' && <span className="pulsing-dot" />}
                            {task.priority}
                          </span>
                          <span className="badge badge-dept">
                            {task.department}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h4 className="card-title">{task.title}</h4>
                        <p className="card-desc">{task.description}</p>

                        {/* Subtasks Progress Bar */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div style={{ margin: '0.6rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                              <span>Checklist</span>
                              <span>{task.progressPercentage}% ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})</span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{ width: `${task.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Rejection alert box preview if rejected */}
                        {task.status === 'rejected' && task.rejectionReason && (
                          <div style={{
                            fontSize: '0.72rem',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            color: '#f43f5e',
                            marginBottom: '0.5rem',
                          }}>
                            <strong>Declined:</strong> "{task.rejectionReason.slice(0, 70)}..."
                          </div>
                        )}

                        {/* Quick Card Accept / Decline Buttons for Pending Acceptance */}
                        {canAcceptDecline && (
                          <div
                            className="card-quick-actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-success btn-sm"
                              title="Accept this task and begin work"
                              onClick={() => onQuickAccept(task)}
                            >
                              <UserCheck size={14} />
                              <span>Accept</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              title="Decline this task with a reason"
                              onClick={() => onQuickReject(task)}
                            >
                              <Ban size={14} />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}

                        {/* Footer: Assignee & Due Date */}
                        <div className="card-footer">
                          <div className="card-assignee" title={`Assigned to ${task.assignedTo?.name || 'Employee'}`}>
                            <img
                              src={task.assignedTo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Assignee'}
                              alt={task.assignedTo?.name}
                              style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {task.assignedTo?.name ? task.assignedTo.name.split(' ')[0] : 'Unassigned'}
                            </span>
                          </div>

                          <div className={`card-due ${overdue ? 'overdue' : ''}`}>
                            <Calendar size={13} />
                            <span>{formatDate(task.dueDate)}</span>
                            {overdue && <span>(Overdue!)</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
