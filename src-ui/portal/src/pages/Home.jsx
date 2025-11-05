// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import Carousel from '../components/Carousel.jsx'
import { Calendar } from '../components/Icon.jsx'
import { Api } from '../lib/api'
import { useAuth } from '../store/auth'

export default function Home() {
  const { autenticado } = useAuth()
  const [hist, setHist] = useState([])
  const [agenda, setAgenda] = useState([])

  useEffect(() => {
    let active = true
    if (!autenticado) { setHist([]); setAgenda([]); return }
    Api.users.myHistory().then((d) => { if (active) setHist(d.slice(0, 5)) }).catch(() => {})
    Api.users.agenda().then((d) => { if (active) setAgenda(d) }).catch(() => {})
    return () => { active = false }
  }, [autenticado])

  return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="mt-6"><Carousel height={320} /></div>

        <div className="grid md:grid-cols-2 gap-8 my-10">
          <div className="card p-6">
            <h3 className="mb-4 text-brand-800 font-semibold">Historial</h3>
            {!autenticado && (
                <div className="text-brand-700 text-sm">Inicia sesión para ver tu historial de pujas.</div>
            )}
            {autenticado && hist.length === 0 && (
                <div className="text-brand-700 text-sm">Aún no has participado. Explora subastas y realiza tu primera puja.</div>
            )}
            {autenticado && hist.length > 0 && (
                <ul className="divide-y">
                  {hist.map((h) => (
                      <li key={h.bidId} className="py-4 flex items-center justify-between">
                        <span>{h.make} {h.model} — ${h.amount.toLocaleString()}</span>
                        <span className={`text-xs px-3 py-1 rounded-full ${h.won ? 'bg-green-100 text-green-800' : (h.vehicleStatus === 'closed' ? 'bg-red-100 text-red-700' : 'bg-brand-200')}`}>
                    {h.won ? 'ganada' : h.vehicleStatus === 'closed' ? 'perdida' : 'en curso'}
                  </span>
                      </li>
                  ))}
                </ul>
            )}
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-brand-800 font-semibold">Agenda</h3>
            {!autenticado && (
                <div className="text-brand-700 text-sm">Inicia sesión para ver subastas próximas relacionadas contigo.</div>
            )}
            {autenticado && agenda.length === 0 && (
                <div className="aspect-video rounded-xl bg-brand-200 flex items-center justify-center">
                  <Calendar className="text-brand-600" size={32} />
                </div>
            )}
            {autenticado && agenda.length > 0 && (
                <ul className="divide-y">
                  {agenda.map(ev => (
                      <li key={ev.vehicleId} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{ev.make} {ev.model} — Lote {ev.lotCode}</div>
                          <div className="text-sm text-black/60">
                            Cierra: {new Date(ev.endsAt).toLocaleString()} · Mín. incremento ${ev.minIncrement.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-xs text-black/70">{ev.timeLeftLabel}</div>
                      </li>
                  ))}
                </ul>
            )}
          </div>
        </div>
      </div>
  )
}
