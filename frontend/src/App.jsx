import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewEvent from './pages/NewEvent'
import EventSite from './pages/EventSite'
import Privacy from './pages/Privacy'
import PaymentReturn from './pages/PaymentReturn'
import ProtectedRoute from './components/ProtectedRoute'
import SiteFooter from './components/SiteFooter'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ece3d0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.4em',
          color: '#7a6a4d',
          textTransform: 'uppercase',
        }}>
          carregando...
        </p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Pública */}
      <Route path="/"            element={<Home />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/privacidade" element={<Privacy />} />

      {/* Protegida */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/novo"
        element={
          <ProtectedRoute>
            <NewEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagamento/retorno"
        element={
          <ProtectedRoute>
            <PaymentReturn />
          </ProtectedRoute>
        }
      />
      {/* Site do evento */}
      <Route path="/:slug/:token" element={<EventSite />} />
    </Routes>
  )
}

function AppLayout() {
  const { loading } = useAuth()

  return (
    <>
      <AppRoutes />
      {!loading && <SiteFooter />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}
