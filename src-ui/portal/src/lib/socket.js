// src/lib/socket.js
import { io } from "socket.io-client";
import { getToken } from "./session";
import { API_BASE } from "./api";

// API_BASE = https://api.cbid.click/api  → WS_BASE = https://api.cbid.click
const WS_BASE = API_BASE.replace(/\/api$/, "");
const NAMESPACE = "/rt";

let socket = null;
// Vehículos suscritos (se re-suscriben tras reconnect)
const subscribedVehicles = new Set();
let wiredReconnectHook = false;

/** Crea (o retorna) un socket singleton hacia /rt con auth por token. */
export function connectSocket() {
    if (socket && socket.connected) return socket;

    if (!socket) {
        socket = io(WS_BASE + NAMESPACE, {
            transports: ["websocket"],         // evita polling y preflights
            withCredentials: true,
            autoConnect: true,
            path: "/socket.io",
            // auth dinámico: cada connect usa el token más fresco
            auth: () => {
                const t = getToken();
                return t ? { token: t } : {};
            },
        });

        socket.on("connect", () => {
            // Re-suscripción de todas las salas en reconexión
            for (const vid of subscribedVehicles) {
                socket.emit("subscribe_vehicle", { vehicleId: vid });
            }
        });

        socket.on("connect_error", (err) => {
            // Útil para diagnóstico en consola
            console.warn("[socket] connect_error:", err?.message || err);
        });

        socket.on("error", (err) => {
            console.warn("[socket] error:", err);
        });
    } else if (!socket.connected) {
        // Actualiza auth para el próximo intento
        const t = getToken();
        socket.auth = t ? { token: t } : {};
        socket.connect();
    }

    // Hook único para re-suscribir tras 'reconnect'
    if (!wiredReconnectHook) {
        wiredReconnectHook = true;
        socket.on("reconnect", () => {
            for (const vid of subscribedVehicles) {
                socket.emit("subscribe_vehicle", { vehicleId: vid });
            }
        });
    }

    return socket;
}

/** Emite al servidor el nuevo token sin reconectar. */
export function refreshAuth() {
    const s = connectSocket();
    const t = getToken();
    // para futuras conexiones
    s.auth = t ? { token: t } : {};
    // refresh en vivo (lo soporta tu servidor)
    s.emit("auth_refresh", { token: t || null });
}

/** Cierra la conexión limpia. */
export function disconnectSocket() {
    if (socket) {
        try {
            socket.removeAllListeners();
            socket.disconnect();
        } finally {
            socket = null;
            subscribedVehicles.clear();
            wiredReconnectHook = false;
        }
    }
}

/** Suscribe la sala vehicle:{id} y la recuerda para re-suscribir en reconnect. */
export function subscribeVehicle(vehicleId) {
    if (!vehicleId) return;
    const s = connectSocket();
    subscribedVehicles.add(Number(vehicleId));
    s.emit("subscribe_vehicle", { vehicleId: Number(vehicleId) });
}

/** Anula la suscripción de la sala vehicle:{id}. */
export function unsubscribeVehicle(vehicleId) {
    if (!vehicleId || !socket) return;
    subscribedVehicles.delete(Number(vehicleId));
    socket.emit("unsubscribe_vehicle", { vehicleId: Number(vehicleId) });
}

/** Exponer el socket (útil en consola: window.__s = getSocket()) */
export function getSocket() {
    return connectSocket();
}
