import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  create: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  list: async (filters = {}) => {
    const response = await api.get('/tasks', { params: filters });
    return response.data;
  },

  get: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  update: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  delete: async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
  },

  complete: async (taskId) => {
    const response = await api.patch(`/tasks/${taskId}/complete`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  get: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  getTasks: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  update: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  delete: async (projectId) => {
    await api.delete(`/projects/${projectId}`);
  },
};

export default api;
