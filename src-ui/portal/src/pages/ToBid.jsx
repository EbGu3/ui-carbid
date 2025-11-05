import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BidPanel from '../components/BidPanel.jsx'
import Img from '../components/Img.jsx'
import { Api } from '../lib/api'
import { useAuth } from '../store/auth'
import Button from '../components/Button'

export default function ToBid() {
    const { id } = useParams()
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [monto, setMonto] = useState(0)
    const [status, setStatus] = useState('active')
    const { autenticado } = useAuth()
    const esRef = useRef(null)
    const nav = useNavigate()

    useEffect(() => {
        let active = true
        setLoading(true)
        Api.vehicles.get(id)
            .then((v) => {
                if (!active) return
                setVehicle(v)
                setStatus(v.status)
                setMonto(v.currentPrice ?? v.basePrice)
            })
            .catch((err) => setError(err.message || 'Error al cargar el vehículo'))
            .finally(() => setLoading(false))
        return () => { active = false }
    }, [id])

    useEffect(() => {
        if (!vehicle) return
        const url = Api.vehicles.sseUrl(vehicle.id)
        const es = new EventSource(url)
        esRef.current = es
        es.addEventListener('top-updated', (ev) => {
            try {
                const data = JSON.parse(ev.data)
                if (data.vehicleId === vehicle.id) setMonto(data.top)
            } catch {}
        })
        es.addEventListener('closed', () => setStatus('closed'))
        es.onerror = () => {}
        return () => { es.close() }
    }, [vehicle])

    const confirmarOferta = async (m) => {
        if (!autenticado) { nav(`/login?next=${encodeURIComponent(location.pathname)}`); return }
        try {
            const r = await Api.vehicles.bids.place(id, m)
            setMonto(r.amount)
        } catch (err) {
            const min = err?.extra?.min_required
            if (min) alert(`La oferta mínima requerida es $${min.toLocaleString()}`)
            else alert(err.message || 'Error al ofertar')
        }
    }

    if (loading) return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">Cargando…</div>
    if (error) return <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-red-600">{error}</div>
    if (!vehicle) return null

    const fuentes = Array.isArray(vehicle.images) ? vehicle.images : []
    const cerrado = status === 'closed'

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 grid lg:grid-cols-[1fr,360px] gap-8">
            <div className="card p-4">
                <div className="aspect-video rounded-2xl overflow-hidden">
                    <Img src={fuentes} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover" />
                </div>
                <div className="text-sm text-black/70 mt-3">
                    <div className="font-semibold">{vehicle.make} {vehicle.model} • {vehicle.year}</div>
                    <div>Lote {vehicle.lotCode} • Base ${vehicle.basePrice.toLocaleString()}</div>
                    <div className="mt-2 text-black/50">{vehicle.description || '—'}</div>
                </div>
                <div className="text-xs text-black/50 mt-2">{cerrado ? 'subasta cerrada' : 'en vivo'}</div>
            </div>

            <div className="space-y-4">
                <BidPanel montoActual={monto} onBid={setMonto} onConfirm={confirmarOferta} disabled={cerrado}/>
                {!autenticado && (
                    <div className="card p-4 flex items-center justify-between">
                        <span>Debes iniciar sesión para ofertar.</span>
                        <Button onClick={()=>nav(`/login?next=${encodeURIComponent(location.pathname)}`)}>Iniciar sesión</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
