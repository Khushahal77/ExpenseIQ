import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  signup: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get('/api/transactions', { params }),
  create: (data) => api.post('/api/transactions', data),
  update: (id, data) => api.put(`/api/transactions/${id}`, data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => api.get('/api/analytics/summary'),
  getCategoryBreakdown: () => api.get('/api/analytics/categories'),
  getMonthlyTrend: () => api.get('/api/analytics/monthly'),
};

// AI Insights API
export const aiInsightsAPI = {
  generate: () => api.post('/api/ai-insights/generate'),
  getLatest: () => api.get('/api/ai-insights/latest'),
};

export default api;
