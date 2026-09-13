import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskTable } from './components/TaskTable';
import { AnalyticsView } from './components/AnalyticsView';
import { TeamView } from './components/TeamView';
import { ActivityAuditView } from './components/ActivityAuditView';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskCreateModal } from './components/TaskCreateModal';
import { AcceptanceModal } from './components/AcceptanceModal';
import { LoginView } from './components/LoginView';
import { api } from './api/client';
import './styles/components.css';

const MainApplication = () => {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('kanban'); // 'kanban' | 'table' | 'analytics' | 'team' | 'audit'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [scope, setScope] = useState('all'); // 'all' | 'my'

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [acceptModalData, setAcceptModalData] = useState({ isOpen: false, task: null, mode: 'accept' });

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch Tasks with filters
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (scope === 'my') params.scope = 'my';

      const res = await api.getTasks(params);
      if (res.success) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, departmentFilter, searchQuery, scope]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Quick Accept & Reject Handlers
  const handleQuickAccept = (task) => {
    setAcceptModalData({
      isOpen: true,
      task,
      mode: 'accept',
    });
  };

  const handleQuickReject = (task) => {
    setAcceptModalData({
      isOpen: true,
      task,
      mode: 'reject',
    });
  };

  const handleConfirmAcceptance = async (taskId, note) => {
    const isAccept = acceptModalData.mode === 'accept';
    if (isAccept) {
      await api.acceptTask(taskId, note);
    } else {
      await api.rejectTask(taskId, note);
    }
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending_acceptance').length;
  const activeCount = tasks.filter((t) => ['pending_acceptance', 'in_progress', 'in_review'].includes(t.status)).length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openCreateModal={() => setCreateModalOpen(true)}
        pendingCount={pendingCount}
        activeCount={activeCount}
      />

      {/* Main Workspace Area */}
      <div className="main-content">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />

        <main className="content-body">
          {currentView === 'kanban' && (
            <KanbanBoard
              tasks={tasks}
              loading={loading}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onQuickAccept={handleQuickAccept}
              onQuickReject={handleQuickReject}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              scope={scope}
              setScope={setScope}
            />
          )}

          {currentView === 'table' && (
            <TaskTable
              tasks={tasks}
              loading={loading}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onQuickAccept={handleQuickAccept}
              onQuickReject={handleQuickReject}
              onDeleteTask={handleDeleteTask}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              scope={scope}
              setScope={setScope}
            />
          )}

          {currentView === 'analytics' && <AnalyticsView />}

          {currentView === 'team' && (
            <TeamView
              onSelectEmployeeTasks={(empId) => {
                setCurrentView('table');
              }}
            />
          )}

          {currentView === 'audit' && (
            <ActivityAuditView onSelectTask={(id) => setSelectedTaskId(id)} />
          )}
        </main>
      </div>

      {/* Modals */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onOpenAcceptModal={(task) => {
            setSelectedTaskId(null);
            handleQuickAccept(task);
          }}
          onOpenRejectModal={(task) => {
            setSelectedTaskId(null);
            handleQuickReject(task);
          }}
          onTaskUpdated={() => fetchTasks()}
        />
      )}

      {createModalOpen && (
        <TaskCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onTaskCreated={() => fetchTasks()}
        />
      )}

      {acceptModalData.isOpen && (
        <AcceptanceModal
          isOpen={acceptModalData.isOpen}
          onClose={() => setAcceptModalData({ isOpen: false, task: null, mode: 'accept' })}
          task={acceptModalData.task}
          mode={acceptModalData.mode}
          onConfirm={handleConfirmAcceptance}
        />
      )}
    </div>
  );
};

const AppContent = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
      }}>
        Loading TaskFlow Pro...
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <MainApplication />;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

