import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

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

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
