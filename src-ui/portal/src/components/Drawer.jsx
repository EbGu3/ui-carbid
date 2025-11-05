import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from './Icon.jsx'
import { useAuth } from '../store/auth'

export default function Drawer() {
    const [open, setOpen] = useState(false)
    const { autenticado, isSeller } = useAuth()
    const Item = ({ to, label, onClick }) => (
        <Link
            to={to}
            onClick={() => { setOpen(false); onClick?.() }}
            className="block px-4 py-3 rounded-md hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
            {label}
        </Link>
    )

    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    return (
        <div className="relative">
            <button
                aria-label="Abrir menú"
                type="button"
                onClick={() => setOpen(true)}
                className="p-2 rounded-md text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50"
            >
                <Menu />
            </button>

            {open && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <aside
                        className="absolute top-0 left-0 h-full w-[280px] bg-brand-800 text-white shadow-xl p-6 flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menú lateral"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="font-bold tracking-[0.5em]">CARBIRD</div>
                            <button
                                aria-label="Cerrar menú"
                                type="button"
                                onClick={() => setOpen(false)}
                                className="p-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                                <X />
                            </button>
                        </div>

                        <nav className="flex-1 space-y-2">
                            <Item to="/explorar" label="Explorar" />
                            <Item to="/inicio" label="Inicio" />
                            {autenticado && <Item to="/cuenta" label="Mi cuenta" />}
                            {autenticado && <Item to="/ajustes" label="Ajustes" />}
                            {isSeller() && <Item to="/vender" label="Vender" />}
                            {!autenticado && <Item to="/login" label="Iniciar sesión" />}
                        </nav>

                        <div className="text-xs text-white/60 mt-auto">Guatemala</div>
                    </aside>
                </div>
            )}
        </div>
    )
}
