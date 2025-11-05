import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Inicio from './pages/Home.jsx'
import APujar from './pages/ToBid.jsx'
import Explorar from './pages/Explore.jsx'
import Cuenta from './pages/Account.jsx'
import Ajustes from './pages/Settings.jsx'
import Vender from './pages/Sell.jsx'
import NotFound from './pages/NotFound.jsx'
import Shell from './components/Shell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
    return (
        <Routes>
            <Route element={<Shell />}>
                <Route index element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/a-pujar/:id" element={<APujar />} />
                <Route path="/explorar" element={<Explorar />} />
                <Route
                    path="/cuenta"
                    element={<ProtectedRoute><Cuenta /></ProtectedRoute>}
                />
                <Route
                    path="/ajustes"
                    element={<ProtectedRoute><Ajustes /></ProtectedRoute>}
                />
                <Route
                    path="/vender"
                    element={<ProtectedRoute roles={['seller','admin']}><Vender /></ProtectedRoute>}
                />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}
