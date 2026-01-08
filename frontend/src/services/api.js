import api from '../api/axios';

// ==================== PROJECTS ====================
export const projectsAPI = {
  getAll: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects`),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data),
  update: (projectId, data) => api.patch(`/projects/${projectId}`, data),
  delete: (projectId) => api.patch(`/projects/${projectId}/delete`),
};

// ==================== TASKS ====================
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (taskId, data) => api.patch(`/tasks/${taskId}`, data),
  updateStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, { status }),
  updateAssignee: (taskId, assigneeId) => api.patch(`/tasks/${taskId}/assignee`, { assigneeId }),
  delete: (taskId) => api.patch(`/tasks/${taskId}/delete`),
  restore: (taskId) => api.patch(`/tasks/${taskId}/restore`),
};

// ==================== ACTIVITY ====================
export const activityAPI = {
  getAll: (workspaceId) => api.get(`/workspaces/${workspaceId}/activity`),
};

// ==================== WORKSPACES ====================
export const workspaceAPI = {
  getMy: () => api.get('/workspaces/my'),
  getDashboard: (workspaceId) => api.get(`/workspaces/${workspaceId}/dashboard`),
};

// ==================== AUTH ====================
export const authAPI = {
  getMe: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// ==================== TEAM ====================
export const teamAPI = {
  getMembers: (workspaceId) => api.get(`/workspaces/${workspaceId}/users`),
  inviteMember: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/invite`, data),
  removeMember: (workspaceId, userId) => api.delete(`/workspaces/${workspaceId}/users/${userId}`),
};
