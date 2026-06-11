import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const postAPI = {
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  create: (data) => api.post('/posts', data),
  like: (id) => api.post(`/posts/${id}/like`),
  comment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  delete: (id) => api.delete(`/posts/${id}`),
};

export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  update: (data) => api.put('/users/profile', data),
  follow: (id) => api.post(`/users/${id}/follow`),
  search: (q) => api.get(`/users/search?q=${q}`),
};

export const analyticsAPI = {
  getMyAnalytics: (period = '7d') => api.get(`/analytics/me?period=${period}`),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  readAll: () => api.put('/notifications/read-all'),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
};

export default api;
