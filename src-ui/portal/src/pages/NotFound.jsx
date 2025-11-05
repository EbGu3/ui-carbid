import { Link } from 'react-router-dom'
export default function NotFound(){
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold">404</h1>
                <p>Página no encontrada</p>
                <Link to="/" className="underline">Volver al inicio</Link>
            </div>
        </div>
    )
}
