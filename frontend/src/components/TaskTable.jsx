import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Download,
  Eye,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  UserCheck,
  Ban,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const TaskTable = ({
  tasks,
  loading,
  onSelectTask,
  onQuickAccept,
  onQuickReject,
  onDeleteTask,
  priorityFilter,
  setPriorityFilter,
  departmentFilter,
  setDepartmentFilter,
  scope,
  setScope,
}) => {
  const { user, isAdmin } = useAuth();
  const [statusTab, setStatusTab] = useState('all');
  const [sortField, setSortField] = useState('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredTasks = tasks.filter((task) => {
    if (statusTab !== 'all' && task.status !== statusTab) return false;
    return true;
  });

  // Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'dueDate') {
      aVal = new Date(a.dueDate).getTime();
      bVal = new Date(b.dueDate).getTime();
    } else if (sortField === 'progressPercentage') {
      aVal = a.progressPercentage || 0;
      bVal = b.progressPercentage || 0;
    } else if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Department', 'Assignee', 'Due Date', 'Progress %', 'Estimated Hours', 'Actual Hours'];
    const rows = sortedTasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.department,
      `"${t.assignedTo?.name || 'Unassigned'}"`,
      new Date(t.dueDate).toLocaleDateString(),
      t.progressPercentage || 0,
      t.estimatedHours || 0,
      t.actualHours || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaskFlow_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sortedTasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `TaskFlow_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusPill = (status) => {
    const labels = {
      pending_acceptance: 'Pending Acceptance',
      in_progress: 'In Progress',
      in_review: 'In Review',
      completed: 'Completed',
      rejected: 'Declined',
    };
    return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      {/* Controls & Filter Header */}
      <div className="kanban-header">
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'pending_acceptance', label: '🟡 Pending' },
            { id: 'in_progress', label: '🔵 In Progress' },
            { id: 'in_review', label: '🟣 In Review' },
            { id: 'completed', label: '🟢 Completed' },
            { id: 'rejected', label: '🔴 Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${statusTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setStatusTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls: Export CSV/JSON */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportToCSV}
            title="Export filtered data to CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={exportToJSON}
            title="Export filtered data to JSON"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Task Title</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Status</th>
              <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Priority</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Department</th>
              <th>Assignee</th>
              <th onClick={() => handleSort('progressPercentage')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Checklist</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Due Date</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No tasks found matching current filters.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const overdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                const isAssignee = task.assignedTo?._id === user?.id || task.assignedTo === user?.id;
                const canAccept = (isAssignee || isAdmin) && task.status === 'pending_acceptance';

                return (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {task.tags && task.tags.slice(0, 3).map((tag) => `#${tag} `)}
                      </div>
                    </td>
                    <td>{statusPill(task.status)}</td>
                    <td>
                      <span className={`badge badge-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-dept">{task.department}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={task.assignedTo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt={task.assignedTo?.name}
                          style={{ width: '26px', height: '26px', borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{task.assignedTo?.name || 'Unassigned'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.assignedTo?.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ minWidth: '120px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                        {task.progressPercentage}%
                      </div>
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${task.progressPercentage}%` }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: overdue ? '#ef4444' : 'var(--text-secondary)', fontWeight: overdue ? 700 : 400 }}>
                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {overdue && ' (Overdue)'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {canAccept && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onQuickAccept(task)}
                              title="Accept Task"
                            >
                              <UserCheck size={13} />
                              <span>Accept</span>
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => onQuickReject(task)}
                              title="Decline Task"
                            >
                              <Ban size={13} />
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                          onClick={() => onSelectTask(task._id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.35rem 0.6rem', color: '#ef4444' }}
                            onClick={() => onDeleteTask(task._id)}
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
