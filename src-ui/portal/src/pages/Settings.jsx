// src/pages/Settings.jsx
import { useState } from 'react'
import { useAuth } from '../store/auth'
import { Api } from '../lib/api'
import Button from '../components/Button'

export default function Settings(){
    const { usuario } = useAuth()
    const [oldPwd, setOldPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [loading, setLoading] = useState(false)

    const change = async (e) => {
        e.preventDefault()
        setMsg(''); setErr(''); setLoading(true)
        try {
            await Api.auth.changePassword({ old_password: oldPwd, new_password: newPwd })
            setMsg('Contraseña actualizada correctamente.')
            setOldPwd(''); setNewPwd('')
        } catch (e2) {
            setErr(e2.message || 'No se pudo actualizar la contraseña')
        } finally { setLoading(false) }
    }

    return (
        <div className='pt-[var(--header-height)]'>
            <div className='max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-8'>

                <div className='card p-8'>
                    <h2 className='text-2xl font-semibold'>Ajustes</h2>
                    <div className="mt-6 grid sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-black/5">
                            <div className="text-sm text-black/60">Nombre</div>
                            <div className="font-semibold">{usuario?.name || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/5">
                            <div className="text-sm text-black/60">Correo</div>
                            <div className="font-semibold">{usuario?.email || '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-black/5">
                            <div className="text-sm text-black/60">Rol</div>
                            <div className="font-semibold capitalize">{usuario?.role || '—'}</div>
                        </div>
                    </div>
                </div>

                <div className='card p-8'>
                    <h3 className='text-xl font-semibold'>Cambiar contraseña</h3>
                    <form onSubmit={change} className="mt-4 grid sm:grid-cols-2 gap-4 max-w-xl">
                        <div>
                            <label className="block text-sm mb-1">Contraseña actual</label>
                            <input type="password" className="w-full rounded-xl border px-3 py-2"
                                   value={oldPwd} onChange={e=>setOldPwd(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Nueva contraseña</label>
                            <input type="password" className="w-full rounded-xl border px-3 py-2"
                                   value={newPwd} onChange={e=>setNewPwd(e.target.value)} required />
                        </div>
                        <div className="sm:col-span-2 flex gap-3 items-center">
                            <Button type="submit" disabled={loading}>{loading ? 'Guardando…' : 'Actualizar'}</Button>
                            {msg && <span className="text-green-700 text-sm">{msg}</span>}
                            {err && <span className="text-red-600 text-sm">{err}</span>}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}
