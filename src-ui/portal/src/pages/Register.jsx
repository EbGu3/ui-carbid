// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { useAuth } from '../store/auth.js'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('buyer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const nav = useNavigate()
    const { register } = useAuth()
    const [sp] = useSearchParams()
    const next = sp.get('next') || '/inicio'

    const enviar = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await register({ name, email, password, role })
            nav(next, { replace: true })
        } catch (err) {
            setError(err.message || 'No se pudo registrar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="pt-[var(--header-height)]">
            <div className="max-w-lg mx-auto px-4 sm:px-8 py-10">
                <div className="card p-8">
                    <h1 className="text-2xl font-semibold mb-6">Crear cuenta</h1>
                    <form onSubmit={enviar} className="space-y-5">
                        <div>
                            <label className="block text-sm mb-1">Nombre</label>
                            <input
                                className="w-full px-4 py-2 rounded-xl border"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Correo</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 rounded-xl border"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Contraseña</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 rounded-xl border"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Tipo de cuenta</label>
                            <select
                                className="w-full px-4 py-2 rounded-xl border"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option value="buyer">Comprador</option>
                                <option value="seller">Vendedor</option>
                            </select>
                        </div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creando…' : 'Crear cuenta'}
                        </Button>
                        <div className="text-sm text-black/70 text-center">
                            ¿Ya tienes cuenta? <Link to="/login" className="underline">Iniciar sesión</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
