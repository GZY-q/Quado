import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const { data } = await api.post('/auth/token', formData);
    return data;
  },
  register: async (username, password, email) => {
    const { data } = await api.post('/auth/register', { username, password, email });
    return data;
  }
};

export const tasks = {
  getAll: async () => {
    const { data } = await api.get('/tasks');
    return data;
  },
  create: async (task) => {
    const { data } = await api.post('/tasks', task);
    return data;
  },
  update: async (id, task) => {
    const { data } = await api.put(`/tasks/${id}`, task);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  }
};

export default api;
