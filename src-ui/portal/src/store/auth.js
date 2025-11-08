import { create } from 'zustand'
import { Api } from '../lib/api'
import { setToken as setSessToken, clearToken as clearSessToken, getToken as getSessToken } from '../lib/session'
import { connectSocket, refreshAuth, disconnectSocket } from '../lib/socket'

const loadUser = () => {
  try { return JSON.parse(localStorage.getItem('cb_user') || 'null') } catch { return null }
}

export const useAuth = create((set, get) => ({
  autenticado: !!getSessToken(),
  token: getSessToken(),
  usuario: loadUser(),
  _inFlightLogin: false,

  async login(email, password) {
    if (get()._inFlightLogin) return // evita doble submit en ráfaga
    set({ _inFlightLogin: true })
    try {
      const res = await Api.auth.login(email, password) // { token, user }
      // Persistencia
      setSessToken(res.token)
      localStorage.setItem('cb_user', JSON.stringify(res.user))
      set({ autenticado: true, token: res.token, usuario: res.user })

      // No bloquees la promesa del login por la conexión del socket
      queueMicrotask(() => {
        connectSocket()
        refreshAuth()
      })

      return res
    } finally {
      set({ _inFlightLogin: false })
    }
  },

  async me() {
    const u = await Api.auth.me()
    localStorage.setItem('cb_user', JSON.stringify(u))
    set({ usuario: u, autenticado: true })

    // Si hay token, asegura socket (no bloquea)
    if (getSessToken()) {
      queueMicrotask(() => {
        connectSocket()
        refreshAuth()
      })
    }
    return u
  },

  async register(payload) {
    await Api.auth.register(payload)
    return await get().login(payload.email, payload.password)
  },

  logout() {
    clearSessToken()
    localStorage.removeItem('cb_user')
    set({ autenticado: false, token: null, usuario: null })
    disconnectSocket()
  },

  isSeller() {
    const r = get().usuario?.role
    return r === 'seller' || r === 'admin'
  },
}))
