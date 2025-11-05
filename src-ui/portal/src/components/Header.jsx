import { Link, NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'
import Drawer from './Drawer.jsx'
import { LogIn, LogOut, User, Plus } from './Icon.jsx'
import { useAuth } from '../store/auth'

const Item = ({to, label}) => (
    <NavLink
        to={to}
        className={({isActive}) => `px-3 py-2 rounded-md text-sm ${isActive?'text-black font-semibold':'text-black/70 hover:text-black'}`}
    >
        {label}
    </NavLink>
)

export default function Header(){
    const nav = useNavigate()
    const { autenticado, usuario, logout, isSeller } = useAuth()
    return (
        <header className="fixed top-0 left-0 right-0 z-40 h-[var(--header-height)] bg-transparent">
            <div className="relative flex items-center justify-between h-full px-4 sm:px-8">
                <div className="sm:hidden"><Drawer/></div>

                <Link to="/" className="absolute left-16 sm:left-0 sm:static">
                    <BrandLogo/>
                </Link>

                <nav className="ml-auto hidden sm:flex items-center gap-1">
                    <Item to="/explorar" label="Explorar"/>
                    <Item to="/inicio" label="Inicio"/>
                    {autenticado && <Item to="/cuenta" label="Mi cuenta"/>}
                    {autenticado && <Item to="/ajustes" label="Ajustes"/>}
                    {isSeller() && <Item to="/vender" label="Vender"/>}
                </nav>

                <div className="ml-4 flex items-center gap-3">
                    {!autenticado ? (
                        <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                            <LogIn size={16}/> Iniciar sesión
                        </Link>
                    ) : (
                        <>
                            {isSeller() && (
                                <Link to="/vender" className="btn-ghost inline-flex items-center gap-2">
                                    <Plus size={16}/> Publicar
                                </Link>
                            )}
                            <div className="hidden sm:flex items-center gap-2 text-sm text-black/80">
                                <User size={18}/> {usuario?.name || usuario?.email}
                            </div>
                            <button
                                className="btn-ghost inline-flex items-center gap-2"
                                onClick={() => { logout(); nav('/'); }}
                            >
                                <LogOut size={16}/> Salir
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
