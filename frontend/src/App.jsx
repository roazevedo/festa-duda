import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/useAuth'
import EventSite from './pages/EventSite'
import Login from './pages/Login'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0e0a08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '11px',
          letterSpacing: '0.4em',
          color: '#7a6030',
          textTransform: 'uppercase',
        }}>
          carregando...
        </p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login"          element={<Login />} />
      <Route path="/:slug/:token"   element={<EventSite />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
