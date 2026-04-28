import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor (attach JWT) ─────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor (handle 401) ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ═══════════════════════════════════════════════════════════════════════════════
// USER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUIZ ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const quizAPI = {
  getQuizByTopic: (topic) => api.get(`/quiz/${topic}`),
  submitQuiz: (data) => api.post('/quiz/submit', data),
};

// ═══════════════════════════════════════════════════════════════════════════════
// AI ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const aiAPI = {
  generateQuiz: (data) => api.post('/ai/generate-quiz', data),
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEADERBOARD ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
};

export default api;
