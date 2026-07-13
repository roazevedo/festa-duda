import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import './Dashboard.css'

const API = import.meta.env.VITE_API_URL

const EVENT_TYPE_LABEL = {
  quinze_anos:  'XV Anos',
  casamento:    'Casamento',
  aniversario:  'Aniversário',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatBRL(value) {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  })
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => alert('Link copiado!'))
    .catch(() => alert('Não foi possível copiar o link.'))
}

export default function Dashboard() {
  const { user, logout }    = useAuth()
  const navigate            = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token')
        const res   = await fetch(`${API}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const eventUrl = (event) =>
    `${window.location.origin}/${event.slug}/${event.token}`

  const totalMessages = events.reduce((s, e) => s + (e.stats?.messages || 0), 0)
  const totalGifts    = events.reduce((s, e) => s + (e.stats?.gifts_received || 0), 0)

  return (
    <div className="dash">

      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <button className="dash-logo" onClick={() => navigate('/')}>
            Convida<span>.me</span>
          </button>
          <div className="dash-header-right">
            <p className="dash-user-email">{user?.email}</p>
            <button className="dash-logout-btn" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dash-main">

        {/* ── BOAS VINDAS ── */}
        <div className="dash-welcome">
          <h1 className="dash-welcome-title">Painel de controle</h1>
          <p className="dash-welcome-sub">
            Gerencie seus eventos, acesse os sites e acompanhe as confirmações.
          </p>
        </div>

        {/* ── STATS GLOBAIS ── */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <p className="dash-stat-value">{events.length}</p>
            <p className="dash-stat-label">Evento{events.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-value">{totalMessages}</p>
            <p className="dash-stat-label">Mensagens</p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-value dash-stat-money">{formatBRL(totalGifts)}</p>
            <p className="dash-stat-label">Recebido em presentes</p>
          </div>
        </div>

        {/* ── EVENTOS ── */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h2 className="dash-section-title">Meus eventos</h2>
            <button
              className="dash-new-btn"
              onClick={() => navigate('/dashboard/novo')}
            >
              + Novo evento
            </button>
          </div>

          {loading && (
            <p className="dash-loading">Carregando eventos...</p>
          )}

          {!loading && events.length === 0 && (
            <div className="dash-empty">
              <p className="dash-empty-text">Nenhum evento criado ainda.</p>
            </div>
          )}

          <div className="dash-events-grid">
            {events.map((event) => (
              <div key={event.id} className="dash-event-card">

                {/* Cabeçalho do card */}
                <div className="dash-event-header">
                  <div>
                    <p className="dash-event-type">
                      {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
                    </p>
                    <h3 className="dash-event-name">{event.name}</h3>
                  </div>
                  <div className="dash-event-date">
                    <p className="dash-event-date-text">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>

                {/* Stats do evento */}
                <div className="dash-event-stats">
                  <div className="dash-event-stat">
                    <p className="dash-event-stat-value">
                      {event.stats?.rsvps || 0}
                    </p>
                    <p className="dash-event-stat-label">confirmados</p>
                  </div>
                  <div className="dash-event-stat">
                    <p className="dash-event-stat-value">
                      {event.stats?.messages || 0}
                    </p>
                    <p className="dash-event-stat-label">mensagens</p>
                  </div>
                  <div className="dash-event-stat dash-event-stat-gift">
                    <p className="dash-event-stat-value dash-event-stat-money">
                      {formatBRL(event.stats?.gifts_received)}
                    </p>
                    <p className="dash-event-stat-label">recebido</p>
                  </div>
                </div>

                {/* Link do evento */}
                <div className="dash-event-link-box">
                  <p className="dash-event-link-label">Link do site</p>
                  <div className="dash-event-link-row">
                    <p className="dash-event-link-url">
                      /{event.slug}/{event.token?.slice(0, 12)}...
                    </p>
                    <button
                      className="dash-copy-btn"
                      onClick={() => copyToClipboard(eventUrl(event))}
                      title="Copiar link"
                    >
                      ⎘ copiar
                    </button>
                  </div>
                </div>

                {/* Ações */}
                <div className="dash-event-actions">
                  <button
                    className="dash-open-btn"
                    onClick={() =>
                      navigate(`/dashboard/evento/${event.slug}/${event.token}`)
                    }
                  >
                    Personalizar
                  </button>
                  <a
                    href={eventUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-open-btn"
                  >
                    Abrir site
                  </a>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
