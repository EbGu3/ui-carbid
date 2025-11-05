import { useAuth } from '../store/auth.js'
import { Link } from 'react-router-dom'

export default function AuthSim() {
  const { autenticado, usuario, logout } = useAuth()
  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-soft p-10">
          <h2 className="text-2xl font-semibold mb-2">Sesión</h2>
          <p className="text-brand-700 mb-6">
            {autenticado ? `Sesión iniciada como ${usuario?.email}` : 'No has iniciado sesión'}
          </p>
          <div className="flex items-center gap-3">
            <Link to="/inicio" className="px-4 py-2 rounded-full bg-black text-white">Ir a Inicio</Link>
            {autenticado && <button onClick={logout} className="px-4 py-2 rounded-full bg-brand-200">Cerrar sesión</button>}
          </div>
        </div>
      </div>
  )
}
