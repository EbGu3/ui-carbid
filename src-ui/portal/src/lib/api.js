// src/lib/api.js
import { getToken } from './session'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')

// Defensa extra por si algún código externo setea algo raro
function safeToken() {
  const t = getToken();
  if (!t) return null;
  if (t === 'null' || t === 'undefined' || t === '"null"' || t === '"undefined"') return null;
  return t;
}

async function http(path, { method = 'GET', body, headers = {}, ...options } = {}) {
  const token = safeToken();

  console.log('API_BASE:', API_BASE);

  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  let data;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await res.json();
  else data = await res.text();

  if (!res.ok) {
    const msg = typeof data === 'string' ? data : (data?.error?.message || `HTTP ${res.status}`);
    const eobj = typeof data === 'object' ? (data?.error || data) : {};
    const err = new Error(msg);
    err.extra = eobj;
    err.status = res.status;
    throw err;
  }
  return data?.data !== undefined ? data.data : data;
}

export const Api = {
  auth: {
    login: (email, password) => http('/auth/login', { method: 'POST', body: { email, password } }),
    me: () => http('/auth/me'),
    register: (payload) => http('/auth/register', { method: 'POST', body: payload }),
    changePassword: ({ old_password, new_password }) =>
        http('/auth/change-password', { method: 'POST', body: { old_password, new_password } }),
  },
  vehicles: {
    list: (q) => http('/vehicles' + (q ? `?q=${encodeURIComponent(q)}` : '')),
    create: (payload) => http('/vehicles', { method: 'POST', body: payload }),
    get: (id) => http(`/vehicles/${id}`),
    upcoming: (limit = 10) => http(`/vehicles/upcoming?limit=${encodeURIComponent(limit)}`),
    bids: {
      list: (vehicleId) => http(`/vehicles/${vehicleId}/bids`),
      place: (vehicleId, amount) => http(`/vehicles/${vehicleId}/bids`, { method: 'POST', body: { amount } }),
    },
    sseUrl: (vehicleId) => `${API_BASE}/sse/vehicles/${vehicleId}`,
  },
  users: {
    myHistory: () => http('/users/me/history'),
    agenda: () => http('/users/me/agenda'),
    notifications: {
      list: () => http('/users/me/notifications'),
      markAllRead: () => http('/users/me/notifications/read-all', { method: 'POST' }),
    },
  },
};
