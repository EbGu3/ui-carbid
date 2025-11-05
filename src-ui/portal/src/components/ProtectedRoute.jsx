import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function ProtectedRoute({ children, roles }) {
    const { autenticado, usuario } = useAuth()
    const loc = useLocation()
    if (!autenticado) {
        const next = encodeURIComponent(loc.pathname + loc.search)
        return <Navigate to={`/login?next=${next}`} replace />
    }
    if (roles && !roles.includes(usuario?.role)) {
        return <Navigate to="/inicio" replace />
    }
    return children
}
