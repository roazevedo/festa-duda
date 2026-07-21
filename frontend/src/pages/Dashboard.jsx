import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { eventTypeLabel } from '../eventTypes'
import { deleteEvent, getRsvps, createPlanCheckout } from '../services/api'
import { isEventFinished } from '../eventStatus'
import { planOf, planAllows } from '../plans'
import { useConfirm } from '../components/useConfirm'
import PlanPickerModal from '../components/PlanPickerModal'
import './Dashboard.css'

const API = import.meta.env.VITE_API_URL

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
  const [showPlans, setShowPlans] = useState(false)
  const [confirm, confirmModal] = useConfirm()

  const choosePlan = (planId) => {
    setShowPlans(false)
    navigate(`/dashboard/novo?plano=${planId}`)
  }

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

  const handleDelete = async (event) => {
    const ok = await confirm(
      `Excluir o evento "${event.name}"? O site, as confirmações, as mensagens e a lista de presentes serão apagados de vez.`,
      'Excluir evento'
    )
    if (!ok) return
    try {
      await deleteEvent(event.slug, event.token)
      setEvents((prev) => prev.filter((e) => e.id !== event.id))
    } catch (err) {
      alert(err.message || 'Erro ao excluir o evento.')
    }
  }

  const totalGifts = events.reduce((s, e) => s + (e.stats?.gifts_received || 0), 0)

  // Upgrade para o plano Completo — Checkout Pro do Mercado Pago;
  // o plano é aplicado pelo webhook quando o pagamento for aprovado
  const [upgradingId, setUpgradingId] = useState(null)
  const handleUpgrade = async (event) => {
    setUpgradingId(event.id)
    try {
      const { init_point } =
        await createPlanCheckout(event.slug, event.token, 'completo')
      window.location.assign(init_point)
    } catch (err) {
      alert(err.message || 'Erro ao iniciar o pagamento. Tente novamente.')
      setUpgradingId(null)
    }
  }

  // Ativo = dentro da vigência (até 6 meses após a festa)
  // (instante capturado na montagem — estável entre re-renders)
  const [now] = useState(() => Date.now())
  const activeCount = events.filter((e) => !isEventFinished(e, now)).length
  const pastCount   = events.length - activeCount

  // ── Exportação da lista de confirmados (PDF para o salão) ──
  // Disponível nos planos pagos; jsPDF entra por import dinâmico
  const exportGuests = async (event) => {
    if (!planAllows(event, 'export')) return
    try {
      const rsvps = await getRsvps(event.slug, event.token)
      const confirmed = rsvps
        .filter((r) => r.attending === 'yes')
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

      if (confirmed.length === 0) {
        alert('Nenhum convidado confirmado ainda.')
        return
      }

      // Uma linha numerada por adulto; acompanhantes logo abaixo do titular.
      // Crianças abaixo de 8 anos vão na linha do titular, sem número
      // próprio e fora do total.
      const rows = []
      let childrenTotal = 0
      confirmed.forEach((r) => {
        const names    = r.companion_names || []
        const children = names.filter((_, i) => r.companion_children?.[i])
        const adults   = names.filter((_, i) => !r.companion_children?.[i])
        childrenTotal += children.length

        const childNote = children.length
          ? `com criança${children.length > 1 ? 's' : ''} abaixo de 8 anos: ${children.join(', ')}`
          : ''
        rows.push([r.name, childNote])
        adults.forEach((c) => rows.push([c, `acompanhante de ${r.name}`]))
      })

      const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new JsPDF()
      const dateStr = event.event_date
        ? new Date(event.event_date).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })
        : null

      // Cabeçalho
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(30, 20, 60)
      doc.text('Lista de convidados confirmados', 14, 18)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(
        `${event.name}${dateStr ? ` — ${dateStr}` : ''}`,
        14, 25
      )

      autoTable(doc, {
        startY: 32,
        head: [['Nº', 'Nome', 'Observação']],
        body: rows.map((cols, i) => [i + 1, cols[0], cols[1]]),
        foot: [[
          '',
          `Total: ${rows.length} pessoa${rows.length !== 1 ? 's' : ''}`,
          childrenTotal > 0
            ? `+ ${childrenTotal} criança${childrenTotal !== 1 ? 's' : ''} abaixo de 8 anos`
            : '',
        ]],
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 2.6 },
        headStyles: {
          fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold',
        },
        footStyles: {
          fillColor: [240, 236, 255], textColor: [40, 30, 90],
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [246, 243, 255] },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center' },
          1: { cellWidth: 90 },
        },
        didDrawPage: (data) => {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(
            `Gerado pelo Convida.me em ${new Date().toLocaleDateString('pt-BR')} · página ${data.pageNumber}`,
            14,
            doc.internal.pageSize.getHeight() - 8
          )
        },
      })

      doc.save(`confirmados-${event.slug}.pdf`)
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      alert(err.message || 'Erro ao exportar a lista de confirmados.')
    }
  }

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
            <p className="dash-stat-value">{activeCount}</p>
            <p className="dash-stat-label">
              Evento{activeCount !== 1 ? 's' : ''} ativo{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="dash-stat-card">
            <p className="dash-stat-value">{pastCount}</p>
            <p className="dash-stat-label">
              Evento{pastCount !== 1 ? 's' : ''} finalizado{pastCount !== 1 ? 's' : ''}
            </p>
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
              onClick={() => setShowPlans(true)}
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
              <button
                className="dash-new-btn"
                onClick={() => setShowPlans(true)}
              >
                + Criar meu primeiro evento
              </button>
            </div>
          )}

          <div className="dash-events-grid">
            {events.map((event) => {
              const finished = isEventFinished(event, now)
              return (
              <div key={event.id} className="dash-event-card">

                {/* Cabeçalho do card */}
                <div className="dash-event-header">
                  <div className="dash-event-header-top">
                    <p className="dash-event-type">
                      {eventTypeLabel(event.event_type)}
                    </p>
                    <p className="dash-event-date-text">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                  <div className="dash-event-header-main">
                    <h3 className="dash-event-name">{event.name}</h3>
                    <span
                      className={
                        'dash-event-badge'
                        + (finished ? ' dash-badge-finished' : ' dash-badge-active')
                      }
                    >
                      {finished ? 'Evento finalizado' : 'Ativo'}
                    </span>
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

                {/* Link do evento — some quando a página foi encerrada */}
                {!finished && (
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
                )}

                {/* Ações */}
                <div className="dash-event-actions">
                  <button
                    className="dash-open-btn"
                    onClick={() =>
                      navigate(`/${event.slug}/${event.token}?editar=1`)
                    }
                  >
                    Personalizar
                  </button>
                  {finished ? (
                    <button
                      className="dash-open-btn"
                      disabled
                      title="Evento finalizado — a página foi encerrada"
                    >
                      Abrir site
                    </button>
                  ) : (
                    <a
                      href={eventUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dash-open-btn"
                    >
                      Abrir site
                    </a>
                  )}
                  {planOf(event).id === 'gratis' && !finished && (
                    <button
                      className="dash-upgrade-btn"
                      onClick={() => handleUpgrade(event)}
                      disabled={upgradingId !== null}
                      title="Liberar tudo com o plano Completo — R$ 149,90"
                    >
                      {upgradingId === event.id
                        ? 'Abrindo pagamento...'
                        : '★ Fazer upgrade — R$ 149,90'}
                    </button>
                  )}
                  <button
                    className="dash-export-btn"
                    onClick={() => exportGuests(event)}
                    disabled={!planAllows(event, 'export')}
                    title={planAllows(event, 'export')
                      ? 'Baixar PDF com os confirmados e acompanhantes'
                      : 'Disponível no plano Completo'}
                  >
                    ⇓ Exportar confirmados
                  </button>
                  <button
                    className="dash-delete-btn"
                    onClick={() => handleDelete(event)}
                    title="Excluir evento"
                  >
                    Excluir
                  </button>
                </div>

              </div>
              )
            })}
          </div>
        </div>

      </main>

      {showPlans && (
        <PlanPickerModal
          onClose={() => setShowPlans(false)}
          onChoose={choosePlan}
        />
      )}

      {confirmModal}
    </div>
  )
}
