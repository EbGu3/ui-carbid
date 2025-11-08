import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Img from '../components/Img.jsx'
import { LOGIN_BG } from '../data/images.js'
import { useAuth } from '../store/auth.js'

/** Overlay de carga accesible (centrado, blur y fondo semitransparente) */
function LoaderOverlay({ show, label = 'Iniciando sesión…' }) {
  if (!show) return null
  return (
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 backdrop-blur-sm">
        <div
            className="flex items-center gap-3 rounded-2xl bg-brand-800/90 px-5 py-3 text-white shadow-xl"
            role="status"
            aria-live="polite"
            aria-label={label}
        >
        <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
        />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
  )
}

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
    if (loading) return // evita doble submit
    setError('')
    setLoading(true)
    try {
      await login(correo.trim(), password)
      nav(next || '/inicio', { replace: true })
    } catch (err) {
      setError(err?.message || 'Error de autenticación')
    } finally {
      // asegúrate de apagar el overlay tanto en éxito como en error
      setLoading(false)
    }
  }

  return (
      <>
        {/* Overlay global mientras se inicia sesión */}
        <LoaderOverlay show={loading} label="Iniciando sesión…" />

        <section
            className="min-h-[calc(100vh-var(--header-height))] grid md:grid-cols-2"
            aria-busy={loading ? 'true' : 'false'}
        >
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
                    autoComplete="username"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border-b border-white/60 text-white placeholder-white/60 focus:outline-none focus:border-white disabled:opacity-60"
                    required
                    disabled={loading}
                />

                <input
                    placeholder="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-transparent border-b border-white/60 text-white placeholder-white/60 focus:outline-none focus:border-white disabled:opacity-60"
                    required
                    disabled={loading}
                />

                {error && (
                    <div className="text-xs text-red-300" role="alert" aria-live="assertive">
                      {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    aria-busy={loading ? 'true' : 'false'}
                    className="w-full px-5 py-2.5 rounded-full bg-white text-black hover:opacity-90 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                    <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
                        aria-hidden="true"
                    />
                    Ingresando…
                  </span>
                  ) : (
                      'Ingresar'
                  )}
                </button>

                <div className="text-sm text-white/80 text-center">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro" className="underline">
                    Crear cuenta
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </section>
      </>
  )
}
