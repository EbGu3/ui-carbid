import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Img from '../components/Img.jsx'
import { LOGIN_BG } from '../data/images.js'
import { useAuth } from '../store/auth.js'

export default function Login() {
  const [correo, setCorreo] = useState('buyer@carbid.test')
  const [password, setPassword] = useState('buyer123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { login, autenticado } = useAuth()
  const [sp] = useSearchParams()
  const next = sp.get('next') || '/inicio'

  useEffect(() => {
    if (autenticado) nav('/inicio', { replace: true })
  }, [autenticado, nav])

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(correo, password)
      nav(next || '/inicio', { replace: true })
    } catch (err) {
      setError(err.message || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
      <section className="min-h-[calc(100vh-var(--header-height))] grid md:grid-cols-2">
        <div className="hidden md:block">
          <Img src={LOGIN_BG} alt="Fondo de acceso" className="w-full h-full object-cover" />
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <form
              onSubmit={enviar}
              className="bg-brand-800 text-white rounded-[48px] w-full max-w-md p-8 sm:p-10 shadow-soft"
          >
            <h1 className="text-2xl tracking-[.3em] uppercase">Iniciar sesión</h1>

            <div className="mt-8 space-y-6">
              <input
                  placeholder="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border-b border-white/60 text-white placeholder-white/60 focus:outline-none focus:border-white"
                  required
              />
              <input
                  placeholder="Contraseña"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-transparent border-b border-white/60 text-white placeholder-white/60 focus:outline-none focus:border-white"
                  required
              />

              {error && <div className="text-xs text-red-300">{error}</div>}

              {/* Botón claramente visible dentro del formulario */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-5 py-2.5 rounded-full bg-white text-black hover:opacity-90 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>

              <div className="text-sm text-white/80 text-center">
                ¿No tienes cuenta? <Link to="/registro" className="underline">Crear cuenta</Link>
              </div>
            </div>
          </form>
        </div>
      </section>
  )
}
