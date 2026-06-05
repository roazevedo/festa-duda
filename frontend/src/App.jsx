import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './contexts/useAuth'
import Home from './pages/Home'
import Login from './pages/Login'

function AppRoutes() {
  const { loading } = useAuth()

  // Evita flash de conteúdo enquanto verifica o token
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
      <Route path="/"      element={<Home />} />
      <Route path="/login" element={<Login />} />
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
