// src/lib/socket.js
import { io } from "socket.io-client";
import { API_BASE } from "./api";
import { getToken } from "./session";

/**
 * Deriva la URL HTTP(S) base para Socket.IO a partir de API_BASE.
 * - Elimina sufijo "/api" (con o sin slash final).
 * - Normaliza múltiples slashes.
 * - Mantiene el protocolo http/https (Socket.IO negociará ws/wss).
 */
function deriveSocketHttpUrl(apiBase) {
    try {
        const u = new URL(apiBase);
        // Normaliza pathname y quita sufijo /api o /api/
        let path = (u.pathname || "").replace(/\/+$/, "");
        if (/\/api$/i.test(path)) {
            path = path.replace(/\/api$/i, "");
        }
        // Evita doble slash si path queda vacío o "/"
        const basePath = path && path !== "/" ? path : "";
        return `${u.protocol}//${u.host}${basePath}`;
    } catch (e) {
        // Fallback robusto por si API_BASE no es URL absoluta
        return String(apiBase).replace(/\/api\/?$/i, "");
    }
}

// Construye URL del socket SOLO a partir de API_BASE (sin nueva env var)
const WS_HTTP_URL = deriveSocketHttpUrl(API_BASE);

// Singleton del cliente
let socket = null;

export function getSocket() {
    if (!socket) {
        socket = io(WS_HTTP_URL, {
            path: "/socket.io",
            transports: ["websocket"], // fuerza WS en prod, evita long-polling
            autoConnect: false,
            withCredentials: true,
            /**
             * Auth “siempre fresco”: se envía en el handshake y puede
             * refrescarse luego con un emit (ver refreshAuth()).
             */
            auth: () => ({ token: getToken() }),
        });

        // (Opcional) logs mínimos útiles en desarrollo
        socket.on("connect_error", (err) => {
            // console.warn("[socket] connect_error:", err?.message || err);
        });
        socket.on("disconnect", (reason) => {
            // console.info("[socket] disconnected:", reason);
        });
    }
    return socket;
}

export function connectSocket() {
    const s = getSocket();
    if (!s.connected) s.connect();
    return s;
}

export function refreshAuth() {
    const s = getSocket();
    // Reenvía el token actual tras login/refresh
    s.emit("auth_refresh", { token: getToken() });
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
    }
}

// Helpers de salas por vehículo
export function subscribeVehicle(vehicleId) {
    const s = connectSocket();
    s.emit("subscribe_vehicle", { vehicleId });
}

export function unsubscribeVehicle(vehicleId) {
    const s = getSocket();
    if (!s.connected) return;
    s.emit("unsubscribe_vehicle", { vehicleId });
}

// Exporta la URL resuelta (útil para diagnosticar)
export const __WS_HTTP_URL = WS_HTTP_URL;
