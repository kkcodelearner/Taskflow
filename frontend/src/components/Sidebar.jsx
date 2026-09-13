import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Kanban,
  TableProperties,
  Users2,
  History,
  CheckCircle,
  PlusCircle,
  Clock,
  Sparkles,
  LogOut,
} from 'lucide-react';


export const Sidebar = ({ currentView, setCurrentView, openCreateModal, pendingCount, activeCount }) => {
  const { user, isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        {/* Create Task Button (Admin Only or Quick Action) */}
        {isAdmin && (
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={openCreateModal}
            >
              <PlusCircle size={17} />
              <span>Create New Task</span>
            </button>
          </div>
        )}

        <div className="sidebar-nav">
          <div className="nav-section-label">Main Workspace</div>

          <button
            className={`nav-item ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => setCurrentView('kanban')}
          >
            <Kanban size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Kanban Board</span>
            {pendingCount > 0 && (
              <span className="column-count" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            className={`nav-item ${currentView === 'table' ? 'active' : ''}`}
            onClick={() => setCurrentView('table')}
          >
            <TableProperties size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Task Data Grid</span>
          </button>

          <button
            className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentView('analytics')}
          >
            <LayoutDashboard size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Analytics Hub</span>
          </button>

          <div className="nav-section-label" style={{ marginTop: '0.75rem' }}>Organization</div>

          <button
            className={`nav-item ${currentView === 'team' ? 'active' : ''}`}
            onClick={() => setCurrentView('team')}
          >
            <Users2 size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Team Workload</span>
          </button>

          <button
            className={`nav-item ${currentView === 'audit' ? 'active' : ''}`}
            onClick={() => setCurrentView('audit')}
          >
            <History size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Audit Trail</span>
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-snippet">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
            alt={user?.name}
            className="user-avatar"
          />
          <div className="user-meta">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{user?.title || user?.role}</span>
          </div>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            localStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_user');
            window.location.reload();
          }}
          title="Logout"
          style={{ color: 'var(--text-muted)', padding: '0.4rem' }}
        >
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
};
