import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  X,
  Clock,
  Calendar,
  UserCheck,
  Ban,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  History,
  MessageSquare,
  FileText,
  Hourglass,
  Tag,
} from 'lucide-react';

export const TaskDetailModal = ({
  taskId,
  onClose,
  onOpenAcceptModal,
  onOpenRejectModal,
  onTaskUpdated,
}) => {
  const { user, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'comments' | 'audit'
  const [loading, setLoading] = useState(true);

  // New subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  // Log time state
  const [logHours, setLogHours] = useState('');
  const [logNote, setLogNote] = useState('');
  const [showLogTime, setShowLogTime] = useState(false);
  // New comment state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getTaskById(taskId);
      if (res.success) {
        setTask(res.task);
        setActivityLogs(res.activityLogs || []);
      }
      const commentRes = await api.getComments(taskId);
      if (commentRes.success) {
        setComments(commentRes.comments || []);
      }
    } catch (err) {
      console.error('Failed to load task details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await api.toggleSubtask(task._id, subtaskId);
      if (res.success) {
        setTask(res.task);
        if (onTaskUpdated) onTaskUpdated(res.task);
      }
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      const res = await api.addSubtask(task._id, newSubtaskTitle.trim());
      if (res.success) {
        setTask(res.task);
        setNewSubtaskTitle('');
        if (onTaskUpdated) onTaskUpdated(res.task);
      }
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const handleLogTime = async (e) => {
    e.preventDefault();
    const h = parseFloat(logHours);
    if (isNaN(h) || h <= 0) return;

    try {
      const res = await api.logTime(task._id, h, logNote);
      if (res.success) {
        setTask((prev) => ({ ...prev, actualHours: res.actualHours }));
        setLogHours('');
        setLogNote('');
        setShowLogTime(false);
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error('Failed to log time', err);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    try {
      const res = await api.updateTask(task._id, { status: newStatus });
      if (res.success) {
        setTask(res.task);
        fetchTaskDetails();
        if (onTaskUpdated) onTaskUpdated(res.task);
      }
    } catch (err) {
      console.error('Status transition failed', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.addComment(task._id, commentText.trim());
      if (res.success) {
        setComments((prev) => [...prev, res.comment]);
        setCommentText('');
        fetchTaskDetails();
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!taskId) return null;

  const isAssignee = task && (task.assignedTo?._id === user?.id || task.assignedTo === user?.id);
  const canAcceptDecline = (isAssignee || isAdmin) && task?.status === 'pending_acceptance';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        {loading || !task ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading task details...
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, paddingRight: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className={`badge badge-${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`badge badge-priority-${task.priority}`}>
                    {task.priority === 'urgent' && <span className="pulsing-dot" />}
                    {task.priority}
                  </span>
                  <span className="badge badge-dept">{task.department}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>{task.title}</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Acceptance / Rejection Status Callouts */}
              {task.status === 'pending_acceptance' && (
                <div className="acceptance-callout pending">
                  <div className="callout-header pending">
                    <Clock size={18} />
                    <span>Awaiting Employee Acceptance</span>
                  </div>
                  <div className="callout-body">
                    This task has been assigned to <strong>{task.assignedTo?.name || 'an employee'}</strong>. Work cannot officially commence until the employee reviews and accepts the assignment.
                  </div>
                  {canAcceptDecline && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onOpenAcceptModal(task)}
                      >
                        <UserCheck size={16} />
                        <span>Accept Task & Begin</span>
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onOpenRejectModal(task)}
                      >
                        <Ban size={16} />
                        <span>Decline Assignment</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {task.status === 'rejected' && (
                <div className="acceptance-callout rejected">
                  <div className="callout-header rejected">
                    <AlertCircle size={18} />
                    <span>Task Assignment Declined by Employee</span>
                  </div>
                  <div className="callout-body">
                    <strong>Reason given:</strong> "{task.rejectionReason}"
                  </div>
                  {isAdmin && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      As an administrator, you may reassign this task to another team member or update requirements.
                    </div>
                  )}
                  {isAssignee && (
                    <div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenAcceptModal(task)}
                      >
                        Re-evaluate and Accept
                      </button>
                    </div>
                  )}
                </div>
              )}

              {task.status === 'in_progress' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#0ea5e9', fontWeight: 600 }}>
                    🚀 Task in progress. Completed work can be submitted for review.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusTransition('in_review')}
                    >
                      Submit for Review
                    </button>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusTransition('completed')}
                    >
                      <CheckCircle2 size={15} />
                      <span>Complete Task</span>
                    </button>
                  </div>
                </div>
              )}

              {task.status === 'in_review' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: 600 }}>
                    👀 Work submitted for verification.
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusTransition('completed')}
                      >
                        Approve & Mark Completed
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusTransition('in_progress')}
                      >
                        Request Changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Subtask Checklist & Progress Bar Section */}
              <div style={{ marginBottom: '1.5rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Subtask Checklist
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {task.progressPercentage}% Completed ({task.subtasks?.filter((st) => st.completed).length || 0}/{task.subtasks?.length || 0})
                  </div>
                </div>

                <div className="progress-track" style={{ height: '8px', marginBottom: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${task.progressPercentage}%` }} />
                </div>

                {/* Subtask Items */}
                <div>
                  {task.subtasks && task.subtasks.map((st) => (
                    <div key={st._id} className="subtask-item">
                      <input
                        type="checkbox"
                        className="subtask-checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st._id)}
                      />
                      <span className={`subtask-text ${st.completed ? 'completed' : ''}`}>
                        {st.title}
                      </span>
                      {st.completed && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Subtask Form */}
                <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ height: '36px', fontSize: '0.825rem' }}
                    placeholder="Add checklist item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px' }}>
                    <Plus size={15} />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* Time Tracking Widget */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-surface-elevated)',
                padding: '0.85rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hourglass size={18} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{task.estimatedHours || 0} hrs</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Actual Logged</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--status-progress)' }}>
                      {task.actualHours || 0} hrs
                    </div>
                  </div>
                </div>

                {!showLogTime ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowLogTime(true)}
                  >
                    + Log Hours Worked
                  </button>
                ) : (
                  <form onSubmit={handleLogTime} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="Hrs"
                      className="input-field"
                      style={{ width: '70px', height: '34px', fontSize: '0.8rem' }}
                      value={logHours}
                      onChange={(e) => setLogHours(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Note..."
                      className="input-field"
                      style={{ width: '130px', height: '34px', fontSize: '0.8rem' }}
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: '34px' }}>
                      Log
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ height: '34px' }}
                      onClick={() => setShowLogTime(false)}
                    >
                      ✕
                    </button>
                  </form>
                )}
              </div>

              {/* Tabs: Details | Discussion | Audit History */}
              <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <button
                  className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  onClick={() => setActiveTab('details')}
                >
                  <FileText size={15} />
                  <span>Overview & Specs</span>
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'comments' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  onClick={() => setActiveTab('comments')}
                >
                  <MessageSquare size={15} />
                  <span>Discussion ({comments.length})</span>
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                  onClick={() => setActiveTab('audit')}
                >
                  <History size={15} />
                  <span>Audit History ({activityLogs.length})</span>
                </button>
              </div>

              {/* Tab 1: Details */}
              {activeTab === 'details' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Description & Deliverables
                    </h4>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                      {task.description}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Assigned Employee</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <img
                          src={task.assignedTo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Assignee'}
                          alt={task.assignedTo?.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{task.assignedTo?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{task.assignedTo?.title}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Created By</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                        <img
                          src={task.createdBy?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
                          alt={task.createdBy?.name}
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{task.createdBy?.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Manager / Admin</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due Date</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Calendar size={16} />
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Tags</div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {task.tags.map((t, idx) => (
                          <span key={idx} className="badge badge-dept" style={{ fontSize: '0.75rem' }}>
                            <Tag size={11} /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Comments */}
              {activeTab === 'comments' && (
                <div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1rem' }}>
                    {comments.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No comments yet on this task. Start the collaboration thread below.
                      </div>
                    ) : (
                      comments.map((c) => (
                        <div key={c._id} className="comment-item">
                          <img
                            src={c.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={c.author?.name}
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          />
                          <div className="comment-bubble">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                              <span className="comment-author">{c.author?.name}</span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="comment-text">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Write a comment or status update..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment}>
                      <Send size={15} />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 3: Activity Audit History */}
              {activeTab === 'audit' && (
                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {activityLogs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No audit history recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activityLogs.map((log) => (
                        <div
                          key={log._id}
                          style={{
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start',
                            padding: '0.65rem 0.85rem',
                            background: 'var(--bg-surface-elevated)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <img
                            src={log.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                            alt={log.user?.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', marginTop: '2px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                              {log.description}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
