import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Context
import { AuthProvider } from './context/AuthContext'

// Layout
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Páginas públicas
import Home from './pages/Home'
import OfertaDetallePage from './pages/OfertaDetallePage'
import NoAutorizadoPage from './pages/NoAutorizadoPage'

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage'
import RegistroPage from './pages/auth/RegistroPage'
import RecuperarContrasenaPage from './pages/auth/RecuperarContrasenaPage'

// Páginas de cliente
import MisCuponesPage from './pages/cliente/MisCuponesPage'
import PerfilPage from './pages/cliente/PerfilPage'

// Páginas de administrador ofertante
import DashboardEmpresaPage from './pages/empresa/DashboardEmpresaPage'
import NuevaOfertaPage from './pages/empresa/NuevaOfertaPage'
import GestionEmpleadosPage from './pages/empresa/GestionEmpleadosPage'

// Páginas de empleado
import CanjeCuponesPage from './pages/empleado/CanjeCuponesPage'

// Constantes
import { ROLES } from './config/constants'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Rutas de autenticación (sin layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasenaPage />} />
          <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

          {/* Rutas con layout */}
          <Route element={<Layout />}>

            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/ofertas/:id" element={<OfertaDetallePage />} />

            {/* ── CLIENTE ── */}
            <Route
              path="/mis-cupones"
              element={
                <ProtectedRoute roles={[ROLES.CLIENTE]}>
                  <MisCuponesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute roles={[ROLES.CLIENTE]}>
                  <PerfilPage />
                </ProtectedRoute>
              }
            />

            {/* ── ADMINISTRADOR OFERTANTE ── */}
            <Route
              path="/dashboard-empresa"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN_EMPRESA]}>
                  <DashboardEmpresaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-empresa/nueva-oferta"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN_EMPRESA]}>
                  <NuevaOfertaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-empresa/empleados"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN_EMPRESA]}>
                  <GestionEmpleadosPage />
                </ProtectedRoute>
              }
            />

            {/* ── EMPLEADO ── */}
            <Route
              path="/canje-cupones"
              element={
                <ProtectedRoute roles={[ROLES.EMPLEADO]}>
                  <CanjeCuponesPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300">404</h1>
                    <p className="text-gray-600 mt-2 mb-4">Página no encontrada</p>
                    <a
                      href="/"
                      className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                    >
                      Volver al inicio
                    </a>
                  </div>
                </div>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App