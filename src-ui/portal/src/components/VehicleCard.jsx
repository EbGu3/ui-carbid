import { Link } from 'react-router-dom'
import Img from './Img.jsx'

export default function VehicleCard({ v }) {
    const fuentes = Array.isArray(v.images) ? v.images : []
    return (
        <Link to={`/a-pujar/${v.id}`} className="group w-full text-left card p-4 hover-lift">
            <div className="aspect-video rounded-xl overflow-hidden mb-3">
                <Img src={fuentes} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-semibold">{v.make} {v.model}</div>
                    <div className="text-sm text-brand-600">{v.year} · Base ${v.basePrice.toLocaleString()}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-brand-900 text-white">Lote {v.lotCode}</div>
            </div>
        </Link>
    )
}
