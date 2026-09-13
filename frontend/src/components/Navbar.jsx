import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CheckSquare,
  Bell,
  Sun,
  Moon,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
} from 'lucide-react';

export const Navbar = ({ searchQuery, setSearchQuery, theme, toggleTheme, onSelectTask }) => {
  const { user, isAdmin, quickSwitch, demoAccounts, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand-logo">
          <div className="brand-icon">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <span>TaskFlow <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span></span>
        </div>

        <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-employee'}`}>
          {isAdmin ? '👑 ADMIN / MANAGER' : '👤 EMPLOYEE'}
        </span>
      </div>

      <div className="navbar-right">
        {/* Live Search Input */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem' }}
            placeholder="Search tasks, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Demo Switcher */}
        <div className="demo-switcher" title="Switch between Admin and Employee demo accounts">
          <Users size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Demo:</span>
          <select
            value={user?.email || ''}
            onChange={(e) => quickSwitch(e.target.value)}
          >
            {demoAccounts.map((acc) => (
              <option key={acc.email} value={acc.email}>
                {acc.role === 'admin' ? '⭐' : '💼'} {acc.name} ({acc.role})
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          className="notif-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="notif-wrapper">
          <button
            className="notif-btn"
            onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="notif-menu">
              <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="column-count" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => {
                        markAsRead(notif._id);
                        if (notif.task?._id && onSelectTask) {
                          onSelectTask(notif.task._id);
                          setShowNotifs(false);
                        }
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {notif.type === 'task_assigned' && <Clock size={16} style={{ color: '#f59e0b' }} />}
                        {notif.type === 'task_accepted' && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                        {notif.type === 'task_rejected' && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                        {(!['task_assigned', 'task_accepted', 'task_rejected'].includes(notif.type)) && (
                          <Bell size={16} style={{ color: 'var(--primary)' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-msg">{notif.message}</div>
                        <div className="notif-time">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="user-avatar"
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {user?.title || user?.department}
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={logout}
            title="Log out of TaskFlow Pro"
            style={{
              padding: '0.4rem 0.75rem',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
};
