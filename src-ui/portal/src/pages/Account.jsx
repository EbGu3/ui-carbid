import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { Api } from '../lib/api'

export default function Account() {
    const { usuario, me } = useAuth()
    const [cargando, setCargando] = useState(true)
    const [historial, setHistorial] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        const cargar = async () => {
            setCargando(true)
            setError('')
            try {
                // Asegura datos del usuario (por si solo había token guardado)
                await me().catch(() => {})
                const h = await Api.users.myHistory().catch(() => [])
                if (!active) return
                setHistorial(h)
            } catch (e) {
                if (!active) return
                setError(e?.message || 'No se pudo cargar tu información')
            } finally {
                if (active) setCargando(false)
            }
        }
        cargar()
        return () => { active = false }
    }, [me])

    return (
        <div className="pt-[var(--header-height)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
                <div className="card p-8">
                    <h2 className="text-2xl font-semibold">Mi cuenta</h2>

                    {cargando && <div className="mt-4 text-brand-700">Cargando…</div>}
                    {error && <div className="mt-4 text-red-600">{error}</div>}

                    {!cargando && !error && (
                        <>
                            <div className="mt-4 grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-black/5">
                                    <div className="text-sm text-black/60">Nombre</div>
                                    <div className="font-semibold">{usuario?.name || '—'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/5">
                                    <div className="text-sm text-black/60">Correo</div>
                                    <div className="font-semibold">{usuario?.email}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-black/5">
                                    <div className="text-sm text-black/60">Rol</div>
                                    <div className="font-semibold capitalize">{usuario?.role}</div>
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold mt-8">Mi historial de pujas</h3>
                            {historial.length === 0 ? (
                                <div className="mt-3 text-black/60">Aún no has pujado.</div>
                            ) : (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                        <tr className="text-left text-black/60">
                                            <th className="py-2 pr-4">Vehículo</th>
                                            <th className="py-2 pr-4">Oferta</th>
                                            <th className="py-2 pr-4">Top al cerrar</th>
                                            <th className="py-2 pr-4">Estado</th>
                                            <th className="py-2 pr-4">Fecha</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {historial.map((i) => (
                                            <tr key={i.bidId} className="border-t">
                                                <td className="py-2 pr-4">
                                                    {i.make} {i.model}
                                                </td>
                                                <td className="py-2 pr-4">${i.amount.toLocaleString()}</td>
                                                <td className="py-2 pr-4">
                                                    {i.topAtClose ? `$${i.topAtClose.toLocaleString()}` : '—'}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {i.won ? 'Ganada' : i.vehicleStatus === 'closed' ? 'Perdida' : 'En curso'}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {new Date(i.bidAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
