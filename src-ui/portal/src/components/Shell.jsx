import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'

export default function Shell(){
    const { pathname } = useLocation()
    const esLanding = pathname === '/'
    return (
        <div className="min-h-screen">
            <Header/>
            <main className={`${esLanding ? '' : 'pt-[var(--header-height)]'}`}>
                <Outlet/>
            </main>
        </div>
    )
}
