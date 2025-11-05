import { useEffect, useState } from 'react'
import Carousel from '../components/Carousel.jsx'
import { Api } from '../lib/api'
import VehicleCard from '../components/VehicleCard.jsx'
import { Link } from 'react-router-dom'

export default function Landing(){
    const [featured, setFeatured] = useState([])
    useEffect(()=>{ Api.vehicles.list('').then(d => setFeatured(d.slice(0,6))).catch(()=>{}) },[])

    return (
        <section className="relative">
            <div className="pt-[var(--header-height)] relative max-w-6xl mx-auto px-4 sm:px-8">
                <div className="relative">
                    <div className="absolute inset-0 -top-10 -bottom-12 -left-8 -right-8 slanted bg-brand-300 opacity-60 rounded-[40px]" />
                    <div className="relative"><Carousel height={560}/></div>

                    <div className="absolute bottom-6 left-6 text-xs bg-white/90 rounded-full px-3 py-1">v1.4</div>
                </div>

                <div className="mt-10 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Subastas destacadas</h3>
                    <Link to="/explorar" className="btn-ghost">Ver todas</Link>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map(v => <VehicleCard key={v.id} v={v} />)}
                    {featured.length === 0 && (
                        <div className="col-span-full text-brand-700">No hay destacados por ahora.</div>
                    )}
                </div>

                <div className="my-16 grid md:grid-cols-2 gap-8">
                    <div className="card p-8">
                        <h4 className="text-xl font-semibold mb-2">Compra con confianza</h4>
                        <p className="text-brand-700">Participa en subastas verificadas y recibe alertas cuando tu oferta sea superada.</p>
                    </div>
                    <div className="card p-8">
                        <h4 className="text-xl font-semibold mb-2">¿Eres vendedor?</h4>
                        <p className="text-brand-700">Publica tu vehículo y llega a miles de compradores en minutos.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
