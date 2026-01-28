import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (name, email) => api.post('/auth/login', { name, email }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

// Candidate endpoints
export const candidates = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.cv_analysis_status) params.append('cv_analysis_status', filters.cv_analysis_status);
    if (filters.reviewed_by_me !== undefined) params.append('reviewed_by_me', filters.reviewed_by_me);
    return api.get(`/candidates?${params}`);
  },
  get: (id) => api.get(`/candidates/${id}`),
  sync: () => api.post('/candidates/sync'),
  getRoles: () => api.get('/candidates/roles')
};

// Review endpoints
export const reviews = {
  submit: (candidateId, data) => api.post('/reviews', { candidate_id: candidateId, ...data }),
  getForCandidate: (candidateId) => api.get(`/reviews/candidate/${candidateId}`),
  getMy: () => api.get('/reviews/my')
};

// Analysis endpoints
export const analysis = {
  trigger: (candidateId) => api.post(`/analysis/trigger/${candidateId}`),
  get: (candidateId) => api.get(`/analysis/${candidateId}`)
};

// Google endpoints
export const google = {
  status: () => api.get('/google/status'),
  getAuthUrl: () => api.get('/google/auth-url'),
  disconnect: () => api.post('/google/disconnect'),
  setSpreadsheet: (spreadsheetId) => api.post('/google/set-spreadsheet', { spreadsheetId })
};

export default api;
