// src/lib/session.js

// Normaliza valores leídos de localStorage para que null/undefined en texto NO cuenten como token
function normalize(t) {
    if (!t) return null;
    if (t === 'null' || t === 'undefined' || t === '"null"' || t === '"undefined"') return null;
    return t;
}

let _token = normalize(localStorage.getItem('cb_token'));

export function getToken() {
    return _token;
}

export function setToken(t) {
    const norm = normalize(t);
    _token = norm;
    if (norm) localStorage.setItem('cb_token', norm);
    else localStorage.removeItem('cb_token');
}

export function clearToken() {
    _token = null;
    localStorage.removeItem('cb_token');
}
