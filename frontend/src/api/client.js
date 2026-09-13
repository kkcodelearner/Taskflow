const BASE_URL = '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('taskflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = new Error(data.message || 'Request failed with status ' + response.status);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// API Endpoint Helper Methods
export const api = {
  // Auth
  login: (email, password) =>
    apiClient('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => apiClient('/auth/me'),
  getDemoAccounts: () => apiClient('/auth/demo-accounts'),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/tasks${query ? `?${query}` : ''}`);
  },
  getTaskById: (id) => apiClient(`/tasks/${id}`),
  createTask: (taskData) =>
    apiClient('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, updates) =>
    apiClient(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  acceptTask: (id, acceptanceNotes) =>
    apiClient(`/tasks/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ acceptanceNotes }),
    }),
  rejectTask: (id, rejectionReason) =>
    apiClient(`/tasks/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    }),
  toggleSubtask: (taskId, subtaskId) =>
    apiClient(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'PATCH' }),
  addSubtask: (taskId, title) =>
    apiClient(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  logTime: (taskId, hours, note) =>
    apiClient(`/tasks/${taskId}/log-time`, {
      method: 'POST',
      body: JSON.stringify({ hours, note }),
    }),
  deleteTask: (taskId) =>
    apiClient(`/tasks/${taskId}`, { method: 'DELETE' }),

  // Comments
  getComments: (taskId) => apiClient(`/tasks/${taskId}/comments`),
  addComment: (taskId, content) =>
    apiClient(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Analytics
  getAnalytics: () => apiClient('/analytics/dashboard'),

  // Users / Employees
  getEmployees: () => apiClient('/users/employees'),
  getAllUsers: () => apiClient('/users/all'),

  // Notifications
  getNotifications: () => apiClient('/notifications'),
  markNotificationRead: (id) =>
    apiClient(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiClient('/notifications/mark-all-read', { method: 'PATCH' }),

  // Activity Feed
  getActivityFeed: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/activity${query ? `?${query}` : ''}`);
  },
};
