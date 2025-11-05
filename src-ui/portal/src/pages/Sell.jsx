// src/pages/Sell.jsx
import { useState } from 'react'
import Button from '../components/Button'
import { Api } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Sell(){
    const [form, setForm] = useState({ make:'', model:'', year:'', base_price:'', lot_code:'', description:'', images:'' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [okMsg, setOkMsg] = useState('')
    const nav = useNavigate()
    const { isSeller } = useAuth()

    const onChange = (k,v)=> setForm(f=>({...f,[k]:v}))
    const onSubmit = async (e) => {
        e.preventDefault()
        setError(''); setOkMsg(''); setLoading(true)
        try {
            const payload = {
                make: form.make, model: form.model, year: Number(form.year),
                base_price: Number(form.base_price), lot_code: form.lot_code,
                description: form.description,
                images: form.images ? form.images.split(',').map(s=>s.trim()).filter(Boolean) : [],
            }
            const v = await Api.vehicles.create(payload)
            setOkMsg('¡Publicado! Redirigiendo al detalle…')
            setTimeout(()=> nav(`/a-pujar/${v.id}`), 700)
        } catch (err) {
            setError(err.message || 'No se pudo publicar')
        } finally { setLoading(false) }
    }

    return (
        <div className="pt-[var(--header-height)]">
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10">
                <div className="card p-8">
                    <h1 className="text-2xl font-semibold mb-6">Publicar vehículo</h1>
                    {!isSeller() && <div className="mb-4 text-sm text-red-600">Tu cuenta no es de vendedor. Cambia de rol o usa una cuenta seller.</div>}
                    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm mb-1">Marca</label><input className="w-full rounded-xl border px-3 py-2" value={form.make} onChange={e=>onChange('make',e.target.value)} required/></div>
                        <div><label className="block text-sm mb-1">Modelo</label><input className="w-full rounded-xl border px-3 py-2" value={form.model} onChange={e=>onChange('model',e.target.value)} required/></div>
                        <div><label className="block text-sm mb-1">Año</label><input type="number" className="w-full rounded-xl border px-3 py-2" value={form.year} onChange={e=>onChange('year',e.target.value)} required/></div>
                        <div><label className="block text-sm mb-1">Precio base</label><input type="number" className="w-full rounded-xl border px-3 py-2" value={form.base_price} onChange={e=>onChange('base_price',e.target.value)} required/></div>
                        <div><label className="block text-sm mb-1">Lote</label><input className="w-full rounded-xl border px-3 py-2" value={form.lot_code} onChange={e=>onChange('lot_code',e.target.value)} required/></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">Imágenes (URLs separadas por coma)</label>
                            <textarea className="w-full rounded-xl border px-3 py-2" rows={3} value={form.images} onChange={e=>onChange('images',e.target.value)} placeholder="https://..., https://..."/>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm mb-1">Descripción</label>
                            <textarea className="w-full rounded-xl border px-3 py-2" rows={4} value={form.description} onChange={e=>onChange('description',e.target.value)}/>
                        </div>
                        {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
                        {okMsg && <div className="md:col-span-2 text-sm text-green-700">{okMsg}</div>}
                        <div className="md:col-span-2 flex justify-end">
                            <Button type="submit" disabled={loading}>{loading?'Publicando…':'Publicar'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
