// js/api.js - Centralized API helper

const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('rar_token');
const saveAuth = (token, user) => { localStorage.setItem('rar_token', token); localStorage.setItem('rar_user', JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem('rar_token'); localStorage.removeItem('rar_user'); };
const getUser = () => { const u = localStorage.getItem('rar_user'); return u ? JSON.parse(u) : null; };

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (response.status === 403 && data.message && data.message.toLowerCase().includes('suspended')) {
    clearAuth();
    alert('Your account has been suspended. Please contact support.');
    window.location.href = '../pages/login.html';
    return;
  }
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
};

// ── Auth ──────────────────────────────────────────────────
const authAPI = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  adminLogin: (body) => apiFetch('/auth/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  profile: () => apiFetch('/auth/profile'),  // fresh user data including loyalty_points
};

// ── Cars ──────────────────────────────────────────────────
const carsAPI = {
  getAll: (params = '') => apiFetch(`/cars${params}`),
  getOne: (id) => apiFetch(`/cars/${id}`),
  create: (fd) => apiFetch('/cars', { method: 'POST', body: fd }),
  update: (id, fd) => apiFetch(`/cars/${id}`, { method: 'PUT', body: fd }),
  delete: (id) => apiFetch(`/cars/${id}`, { method: 'DELETE' }),
};

// ── Rentals ───────────────────────────────────────────────
const rentalsAPI = {
  create: (body) => apiFetch('/rentals', { method: 'POST', body: JSON.stringify(body) }),
  getMy: () => apiFetch('/rentals/my'),
  getMyById: (id) => apiFetch(`/rentals/my/${id}`),    // for payment form
  getAll: (p = '') => apiFetch(`/rentals${p}`),
  updateStatus: (id, status) => apiFetch(`/rentals/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancel: (id) => apiFetch(`/rentals/${id}/cancel`, { method: 'PUT' }),
};

// ── Payments ──────────────────────────────────────────────
const paymentsAPI = {
  create: (body) => apiFetch('/payments', { method: 'POST', body: JSON.stringify(body) }),
  getMy: () => apiFetch('/payments/my'),
  getUnpaid: () => apiFetch('/payments/unpaid'),
  getAll: () => apiFetch('/payments'),
};

// ── Admin ─────────────────────────────────────────────────
const adminAPI = {
  dashboard: () => apiFetch('/admin/dashboard'),
  getUsers: () => apiFetch('/admin/users'),
  updateUser: (id, status) => apiFetch(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteUser: (id) => apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdmins: () => apiFetch('/admin/admins'),
  createAdmin: (body) => apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(body) }),
  getTickets: () => apiFetch('/admin/tickets'),
  replyTicket: (id, body) => apiFetch(`/admin/tickets/${id}/reply`, { method: 'PUT', body: JSON.stringify(body) }),
};