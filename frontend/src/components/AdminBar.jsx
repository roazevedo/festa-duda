import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import './AdminBar.css'

export default function AdminBar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="admin-bar">
      <div className="admin-bar-inner">
        <div className="admin-bar-left">
          <span className="admin-bar-icon">⚙</span>
          <span className="admin-bar-label">admin</span>
          <span className="admin-bar-sep">·</span>
          <span className="admin-bar-email">{user.email}</span>
        </div>
        <div className="admin-bar-right">
          <button
            className="admin-bar-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            Painel
          </button>
          <button className="admin-bar-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
