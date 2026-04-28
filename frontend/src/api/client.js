import axios from 'axios';

const BASE = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fct_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data).then(r => r.data),
  login: (data) => api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  updateProfile: (data) => api.patch('/auth/me', data).then(r => r.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(r => r.data),
};

export const filesApi = {
  list: () => api.get('/files').then(r => r.data),
  get: (id) => api.get(`/files/${id}`).then(r => r.data),
  upload: (formData, onProgress) =>
    api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(r => r.data),
  downloadUrl: (id, kind) => `${BASE}/files/${id}/download/${kind}`,
  getMessages: (id) => api.get(`/files/${id}/messages`).then(r => r.data),
  sendMessage: (id, content) => api.post(`/files/${id}/messages`, { content }).then(r => r.data),
};

export const creditsApi = {
  packages: () => api.get('/credits/packages').then(r => r.data),
  purchase: (packageId) => api.post('/credits/purchase', { packageId }).then(r => r.data),
  transactions: () => api.get('/credits/transactions').then(r => r.data),
};

export const notificationsApi = {
  list: () => api.get('/notifications').then(r => r.data),
  readAll: () => api.post('/notifications/read-all').then(r => r.data),
};

export const adminApi = {
  users: () => api.get('/admin/users').then(r => r.data),
  adjustCredits: (userId, amount, reason) =>
    api.patch(`/admin/users/${userId}/credits`, { amount, reason }).then(r => r.data),
  files: (statusFilter) => api.get('/admin/files', { params: { status_filter: statusFilter } }).then(r => r.data),
  updateStatus: (fileId, status) => api.patch(`/admin/files/${fileId}/status`, { status }).then(r => r.data),
  uploadTuned: (fileId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/admin/files/${fileId}/upload-tuned`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  stats: () => api.get('/admin/stats').then(r => r.data),
};

// Helper to download protected file via fetch + token
export const downloadProtected = async (url, suggestedName) => {
  const token = localStorage.getItem('fct_token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = suggestedName || 'file.bin';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};

export default api;
