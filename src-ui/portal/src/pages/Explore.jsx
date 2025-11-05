// src/pages/Explore.jsx
import { useEffect, useState } from 'react'
import VehicleCard from '../components/VehicleCard.jsx'
import Tabs from '../components/Tabs.jsx'
import { Api } from '../lib/api'
import { useAuth } from '../store/auth'

export default function Explore() {
    const [tab, setTab] = useState('todos')
    const [vehiculos, setVehiculos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [q, setQ] = useState('')

    const { autenticado } = useAuth()
    const [hist, setHist] = useState([])
    const [notifs, setNotifs] = useState([])
    const [loadingAux, setLoadingAux] = useState(false)

    // Listado general
    useEffect(() => {
        let active = true
        setLoading(true)
        Api.vehicles.list(q)
            .then((data) => { if (active) setVehiculos(data) })
            .catch((err) => { if (active) setError(err.message || 'Error cargando vehículos') })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [q])

    // Carga Historial / Notificaciones al cambiar de tab
    useEffect(() => {
        let active = true
        if (tab === 'hist') {
            if (!autenticado) { setHist([]); return }
            setLoadingAux(true)
            Api.users.myHistory()
                .then(d => { if (active) setHist(d) })
                .catch(() => { if (active) setHist([]) })
                .finally(() => { if (active) setLoadingAux(false) })
        } else if (tab === 'notif') {
            if (!autenticado) { setNotifs([]); return }
            setLoadingAux(true)
            Api.users.notifications.list()
                .then(d => { if (active) setNotifs(d) })
                .catch(() => { if (active) setNotifs([]) })
                .finally(() => { if (active) setLoadingAux(false) })
        }
        return () => { active = false }
    }, [tab, autenticado])

    const marcarLeidas = async () => {
        try {
            await Api.users.notifications.markAllRead()
            const d = await Api.users.notifications.list()
            setNotifs(d)
        } catch {}
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <Tabs
                    items={[
                        { label: 'Explorar', value: 'todos' },
                        { label: 'Historial', value: 'hist' },
                        { label: 'Notificaciones', value: 'notif' },
                    ]}
                    value={tab}
                    onChange={setTab}
                />
                <input
                    placeholder="Buscar (marca, modelo, lote)"
                    className="px-4 py-2 rounded-full bg-white shadow-soft w-64"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>

            {tab === 'todos' && (
                <>
                    {loading && <div className="text-brand-700">Cargando…</div>}
                    {error && <div className="text-red-600">{error}</div>}
                    {!loading && !error && (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehiculos.map((v) => (<VehicleCard key={v.id} v={v}/>))}
                        </div>
                    )}
                </>
            )}

            {tab === 'hist' && (
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4">Mi historial de pujas</h3>
                    {!autenticado && (
                        <div className="text-brand-700">Inicia sesión para ver tu historial.</div>
                    )}
                    {autenticado && (
                        <>
                            {loadingAux && <div className="text-brand-700">Cargando…</div>}
                            {!loadingAux && hist.length === 0 && (
                                <div className="text-brand-700">Aún no has pujado. Explora subastas y participa.</div>
                            )}
                            {!loadingAux && hist.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="text-left text-black/60">
                                            <th className="py-2 pr-4">Vehículo</th>
                                            <th className="py-2 pr-4">Tu oferta</th>
                                            <th className="py-2 pr-4">Estado</th>
                                            <th className="py-2 pr-4">Fecha</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {hist.map(i => (
                                            <tr key={i.bidId} className="border-t">
                                                <td className="py-2 pr-4">{i.make} {i.model}</td>
                                                <td className="py-2 pr-4">${i.amount.toLocaleString()}</td>
                                                <td className="py-2 pr-4">
                                                    {i.won ? 'Ganada' : i.vehicleStatus === 'closed' ? 'Perdida' : 'En curso'}
                                                </td>
                                                <td className="py-2 pr-4">{new Date(i.bidAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {tab === 'notif' && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Notificaciones</h3>
                        {autenticado && notifs.some(n => !n.readAt) && (
                            <button onClick={marcarLeidas} className="btn-ghost">Marcar todas como leídas</button>
                        )}
                    </div>
                    {!autenticado && <div className="text-brand-700">Inicia sesión para ver tus notificaciones.</div>}
                    {autenticado && (
                        <>
                            {loadingAux && <div className="text-brand-700">Cargando…</div>}
                            {!loadingAux && notifs.length === 0 && (
                                <div className="text-brand-700">Sin notificaciones por ahora.</div>
                            )}
                            {!loadingAux && notifs.length > 0 && (
                                <ul className="divide-y">
                                    {notifs.map(n => (
                                        <li key={n.id} className="py-3 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{n.typeLabel}</div>
                                                <div className="text-sm text-black/60">
                                                    {n.description}
                                                </div>
                                            </div>
                                            <div className="text-xs text-black/50">
                                                {new Date(n.createdAt).toLocaleString()}
                                                {!n.readAt && <span className="ml-2 px-2 py-0.5 rounded-full bg-black/10">nuevo</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
