// src/lib/api.js
import { getToken } from './session'

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')

// Defensa extra por si algún código externo setea algo raro
function safeToken() {
  const t = getToken()
  if (!t) return null
  if (t === 'null' || t === 'undefined' || t === '"null"' || t === '"undefined"') return null
  return t
}

// Ejecuta una función asíncrona con AbortController y timeout
async function withTimeout(run, ms = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await run(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

async function tryParseBody(res) {
  const ct = (res.headers.get('content-type') || '').toLowerCase()
  const text = await res.text()
  if (!text) return {}
  if (ct.includes('application/json')) {
    try { return JSON.parse(text) } catch { /* cae a texto abajo */ }
  }
  return text
}

async function http(path, { method = 'GET', body, headers = {}, timeoutMs = 12000, ...options } = {}) {
  const token = safeToken()

  // Útil en diagnóstico; puedes comentar si no lo necesitas
  console.log('API_BASE:', API_BASE)

  try {
    return await withTimeout(async (signal) => {
      const res = await fetch(API_BASE + path, {
        method,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body != null ? JSON.stringify(body) : undefined,
        credentials: 'omit',
        signal,
        ...options,
      })

      const parsed = await tryParseBody(res)

      if (!res.ok) {
        const msg =
            typeof parsed === 'string'
                ? parsed
                : parsed?.error?.message || parsed?.message || `HTTP ${res.status}`
        const eobj = typeof parsed === 'object' ? (parsed?.error || parsed) : {}
        const err = new Error(msg)
        err.extra = eobj
        err.status = res.status
        throw err
      }

      return parsed?.data !== undefined ? parsed.data : parsed
    }, timeoutMs)
  } catch (err) {
    // Mensaje claro si fue un timeout/abort
    if (err?.name === 'AbortError') {
      const to = typeof timeoutMs === 'number' ? `${timeoutMs} ms` : 'el tiempo configurado'
      const e = new Error(`Tiempo de espera agotado al contactar la API (${to}).`)
      e.code = 'TIMEOUT'
      throw e
    }
    throw err
  }
}

export const Api = {
  auth: {
    login: (email, password) =>
        http('/auth/login', { method: 'POST', body: { email, password }, timeoutMs: 12000 }),
    me: () =>
        http('/auth/me', { timeoutMs: 12000 }),
    register: (payload) =>
        http('/auth/register', { method: 'POST', body: payload, timeoutMs: 15000 }),
    changePassword: ({ old_password, new_password }) =>
        http('/auth/change-password', {
          method: 'POST',
          body: { old_password, new_password },
          timeoutMs: 15000,
        }),
  },
  vehicles: {
    list: (q) => http('/vehicles' + (q ? `?q=${encodeURIComponent(q)}` : ''), { timeoutMs: 12000 }),
    create: (payload) => http('/vehicles', { method: 'POST', body: payload, timeoutMs: 15000 }),
    get: (id) => http(`/vehicles/${id}`, { timeoutMs: 12000 }),
    upcoming: (limit = 10) =>
        http(`/vehicles/upcoming?limit=${encodeURIComponent(limit)}`, { timeoutMs: 12000 }),
    bids: {
      list: (vehicleId) => http(`/vehicles/${vehicleId}/bids`, { timeoutMs: 12000 }),
      place: (vehicleId, amount) =>
          http(`/vehicles/${vehicleId}/bids`, { method: 'POST', body: { amount }, timeoutMs: 15000 }),
    },
    sseUrl: (vehicleId) => `${API_BASE}/sse/vehicles/${vehicleId}`,
  },
  users: {
    myHistory: () => http('/users/me/history', { timeoutMs: 12000 }),
    agenda: () => http('/users/me/agenda', { timeoutMs: 12000 }),
    notifications: {
      list: () => http('/users/me/notifications', { timeoutMs: 12000 }),
      markAllRead: () =>
          http('/users/me/notifications/read-all', { method: 'POST', timeoutMs: 12000 }),
    },
  },
}
