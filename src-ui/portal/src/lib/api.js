// src/lib/api.js
import { getToken } from './session'

// Base de API
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '')

// ===== Config de transporte para login =====
// 'qs' = GET con query-string (sin body, sin Content-Type)
// 'post' = POST JSON (usa body)
const LOGIN_TRANSPORT = 'qs'

// Defensa por si alguien dejó basura en storage
function safeToken() {
  const t = getToken()
  if (!t) return null
  if (t === 'null' || t === 'undefined' || t === '"null"' || t === '"undefined"') return null
  return t
}

// Wrap con AbortController + timeout
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
    try { return JSON.parse(text) } catch { /* cae a texto */ }
  }
  return text
}

// HTTP helper
async function http(path, { method = 'GET', body, headers = {}, timeoutMs = 12000, ...options } = {}) {
  const token = safeToken()

  // Log útil para confirmar base en consola (solo login)
  if (typeof window !== 'undefined' && path.startsWith('/auth/login')) {
    console.log('[login] API_BASE =', API_BASE, '| transport =', LOGIN_TRANSPORT)
  }

  return withTimeout(async (signal) => {
    const hasBody = body != null

    // IMPORTANTÍSIMO: solo fijamos Content-Type cuando realmente enviamos body
    const computedHeaders = {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    }

    const res = await fetch(API_BASE + path, {
      method,
      headers: computedHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      credentials: 'omit',
      signal,
      ...options,
    })

    const parsed = await tryParseBody(res)

    if (!res.ok) {
      const msg = typeof parsed === 'string'
          ? parsed
          : parsed?.error?.message || parsed?.message || `HTTP ${res.status}`
      const eobj = typeof parsed === 'object' ? (parsed?.error || parsed) : {}
      const err = new Error(msg)
      err.extra = eobj
      err.status = res.status
      throw err
    }

    return parsed?.data !== undefined ? parsed.data : parsed
  }, timeoutMs).catch((err) => {
    if (err?.name === 'AbortError') {
      const to = typeof timeoutMs === 'number' ? `${timeoutMs} ms` : 'el tiempo configurado'
      const e = new Error(`Tiempo de espera agotado al contactar la API (${to}).`)
      e.code = 'TIMEOUT'
      throw e
    }
    throw err
  })
}

// Helpers
function qs(params) {
  const u = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) u.set(k, String(v))
  })
  return u.toString()
}

// Normaliza imágenes desde string "a,b,c" o array → array limpio
function normalizeImages(imgs) {
  if (!imgs) return []
  if (Array.isArray(imgs)) return imgs.map(s => String(s).trim()).filter(Boolean)
  return String(imgs)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
}

export const Api = {
  auth: {
    // LOGIN por query-string SIN body (GET simple request)
    login: (email, password) => {
      if (LOGIN_TRANSPORT === 'qs') {
        const q = qs({ email, password })
        return http(`/auth/login?${q}`, { method: 'GET', timeoutMs: 12000 })
      }
      return http('/auth/login', {
        method: 'POST',
        body: { email, password },
        timeoutMs: 12000,
      })
    },

    me: () => http('/auth/me', { timeoutMs: 12000 }),

    // ===== REGISTER por POST **sin body** con query-string =====
    register: ({ name, email, password, role = 'buyer' }) => {
      const q = qs({ name, email, password, role })
      // No body, sin Content-Type → evita el problema del body
      return http(`/auth/register?${q}`, { method: 'POST', timeoutMs: 15000 })
    },

    changePassword: ({ old_password, new_password }) =>
        http('/auth/change-password', {
          method: 'POST',
          body: { old_password, new_password },
          timeoutMs: 15000,
        }),
  },

  vehicles: {
    list: (q) => http('/vehicles' + (q ? `?q=${encodeURIComponent(q)}` : ''), { timeoutMs: 12000 }),

    // POST /vehicles SIN body (query-string)
    create: (payload = {}) => {
      const {
        make, model, year, base_price, lot_code, description,
        status, min_increment, images, images_csv,
      } = payload

      const params = new URLSearchParams()
      if (make) params.set('make', String(make).trim())
      if (model) params.set('model', String(model).trim())
      if (lot_code) params.set('lot_code', String(lot_code).trim())
      if (year != null) params.set('year', String(year))
      if (base_price != null) params.set('base_price', String(base_price))
      if (min_increment != null) params.set('min_increment', String(min_increment))
      if (status) params.set('status', String(status).trim())
      if (description) params.set('description', String(description))
      const imgs = images_csv ? normalizeImages(images_csv) : normalizeImages(images)
      imgs.forEach(u => params.append('images', u))

      return http(`/vehicles?${params.toString()}`, { method: 'POST', timeoutMs: 15000 })
    },

    get: (id) => http(`/vehicles/${id}`, { timeoutMs: 12000 }),

    upcoming: (limit = 10) =>
        http(`/vehicles/upcoming?limit=${encodeURIComponent(limit)}`, { timeoutMs: 12000 }),

    bids: {
      list: (vehicleId) => http(`/vehicles/${vehicleId}/bids`, { timeoutMs: 12000 }),
      // POST sin body, con amount en QS
      place: (vehicleId, amount) =>
          http(`/vehicles/${vehicleId}/bids?amount=${encodeURIComponent(amount)}`, {
            method: 'POST',
            timeoutMs: 15000,
          }),
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
