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

  async login(email, password) {
    const res = await Api.auth.login(email, password) // {token, user}
    setSessToken(res.token)
    localStorage.setItem('cb_user', JSON.stringify(res.user))
    set({ autenticado: true, token: res.token, usuario: res.user })

    // SOCKET: conecta y refresca auth
    connectSocket()
    refreshAuth()

    return res
  },

  async me() {
    const u = await Api.auth.me()
    localStorage.setItem('cb_user', JSON.stringify(u))
    set({ usuario: u, autenticado: true })

    // Si el usuario tiene token y no está conectado, conecta socket
    if (getSessToken()) {
      connectSocket()
      refreshAuth()
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
    // SOCKET: desconecta
    disconnectSocket()
  },

  isSeller() {
    const r = get().usuario?.role
    return r === 'seller' || r === 'admin'
  },
}))
