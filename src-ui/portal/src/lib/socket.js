import { io } from "socket.io-client"
import { API_BASE } from "./api"
import { getToken } from "./session"

/** Deriva la URL HTTP(S) del socket a partir de API_BASE (quita /api). */
function deriveSocketHttpUrl(apiBase) {
    try {
        const u = new URL(apiBase)
        let path = (u.pathname || "").replace(/\/+$/, "")
        if (/\/api$/i.test(path)) path = path.replace(/\/api$/i, "")
        const basePath = path && path !== "/" ? path : ""
        return `${u.protocol}//${u.host}${basePath}`
    } catch {
        return String(apiBase).replace(/\/api\/?$/i, "")
    }
}

const WS_HTTP_URL = deriveSocketHttpUrl(API_BASE)

let socket = null

export function getSocket() {
    if (!socket) {
        socket = io(WS_HTTP_URL, {
            path: "/socket.io",
            transports: ["websocket"],   // en producción evita long-polling
            autoConnect: false,
            withCredentials: true,
            // auth dinámico: se setea justo antes de conectar (ver connectSocket/refreshAuth)
        })

        // Cuando conecta, asegura publicar el token vigente
        socket.on("connect", () => {
            const tk = getToken()
            if (tk) socket.emit("auth_refresh", { token: tk })
        })

        // Logs minimizados opcionales
        // socket.on("connect_error", (err) => console.warn("[socket] connect_error:", err?.message || err))
        // socket.on("disconnect", (r) => console.info("[socket] disconnected:", r))
    }
    return socket
}

export function connectSocket() {
    const s = getSocket()
    // token fresco en el handshake
    s.auth = { token: getToken() || undefined }
    if (!s.connected) s.connect()
    return s
}

export function refreshAuth() {
    const s = getSocket()
    // Actualiza el auth para próximos handshakes
    s.auth = { token: getToken() || undefined }
    // Si ya está conectado, notifícalo inmediatamente
    if (s.connected) s.emit("auth_refresh", { token: getToken() })
}

export function disconnectSocket() {
    if (socket) socket.disconnect()
}

export function subscribeVehicle(vehicleId) {
    const s = connectSocket()
    s.emit("subscribe_vehicle", { vehicleId })
}

export function unsubscribeVehicle(vehicleId) {
    const s = getSocket()
    if (!s.connected) return
    s.emit("unsubscribe_vehicle", { vehicleId })
}

// Solo por diagnóstico si lo necesitas
export const __WS_HTTP_URL = WS_HTTP_URL
