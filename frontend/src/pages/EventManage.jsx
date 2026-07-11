import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EventProvider } from '../contexts/EventProvider'
import { useEvent } from '../contexts/useEvent'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { updateEvent } from '../services/api'
import { getTheme, DEFAULT_THEME_ID } from '../themes'
import { SECTIONS, sectionEnabled, isTeatro } from '../sections'
import ThemePicker from '../components/ThemePicker'
import './EventManage.css'

const EVENT_TYPE_LABEL = {
  quinze_anos: 'XV Anos',
  casamento:   'Casamento',
  aniversario: 'Aniversário',
}

// Converte ISO → valor aceito pelo input datetime-local
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

function ManageContent() {
  const navigate = useNavigate()
  const { event, setEvent, slug, token, loading, error } = useEvent()
  const isAdmin = useEventAdmin()

  const [themeOpen, setThemeOpen] = useState(false)
  const [form, setForm]           = useState(null)
  const [savingData, setSavingData] = useState(false)
  const [feedback, setFeedback]   = useState(null)

  // Preenche o formulário de dados quando o evento chega
  useEffect(() => {
    if (!event) return
    setForm({
      name:          event.name || '',
      event_date:    toLocalInput(event.event_date),
      venue_name:    event.venue_name || '',
      venue_address: event.venue_address || '',
    })
  }, [event])

  if (loading) return <p className="em-status">carregando...</p>
  if (error)   return <p className="em-status">Evento não encontrado.</p>
  if (!isAdmin) {
    return (
      <p className="em-status">
        Você não tem permissão para gerenciar este evento.
      </p>
    )
  }

  const siteUrl = `${window.location.origin}/${slug}/${token}`
  const activeTheme = getTheme(event.settings?.theme || DEFAULT_THEME_ID)

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl)
      .then(() => setFeedback('Link copiado!'))
      .catch(() => setFeedback('Não foi possível copiar o link.'))
    setTimeout(() => setFeedback(null), 2500)
  }

  const setField = (key) => (e) =>
    setForm({ ...form, [key]: e.target.value })

  const saveData = async (e) => {
    e.preventDefault()
    setSavingData(true)
    try {
      const updated = await updateEvent(slug, token, {
        name:          form.name.trim(),
        event_date:    form.event_date,
        venue_name:    form.venue_name.trim() || null,
        venue_address: form.venue_address.trim() || null,
      })
      setEvent(updated)
      setFeedback('Dados salvos!')
    } catch {
      setFeedback('Erro ao salvar os dados.')
    } finally {
      setSavingData(false)
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  const toggleSetting = async (key) => {
    try {
      const updated = await updateEvent(slug, token, { [key]: !event[key] })
      setEvent(updated)
    } catch {
      setFeedback('Erro ao salvar a configuração.')
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  // Liga/desliga uma seção do site (event.settings.sections)
  const toggleSection = async (id) => {
    const sections = { ...(event.settings?.sections || {}) }
    sections[id] = {
      ...(sections[id] || {}),
      enabled: !sectionEnabled(event, id),
    }
    try {
      const updated = await updateEvent(slug, token, {
        settings: { ...event.settings, sections },
      })
      setEvent(updated)
    } catch {
      setFeedback('Erro ao salvar a seção.')
      setTimeout(() => setFeedback(null), 2500)
    }
  }

  return (
    <div className="em">
      <header className="em-header">
        <button className="em-back" onClick={() => navigate('/dashboard')}>
          ← Painel
        </button>
        <a
          className="em-view-site"
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver meu site ↗
        </a>
      </header>

      <main className="em-main">

        {/* ── Cabeçalho do evento ── */}
        <p className="em-type">
          {EVENT_TYPE_LABEL[event.event_type] || event.event_type}
        </p>
        <h1 className="em-title">{event.name}</h1>

        <div className="em-link-box">
          <p className="em-link-label">endereço do seu site</p>
          <div className="em-link-row">
            <p className="em-link-url">{siteUrl}</p>
            <button className="em-copy-btn" onClick={copyLink}>
              ⎘ copiar
            </button>
          </div>
        </div>

        {feedback && <p className="em-feedback">{feedback}</p>}

        <h2 className="em-section-title">Personalize o site do seu evento</h2>

        <div className="em-cards">

          {/* ── Tema ── */}
          <div className="em-card">
            <div className="em-card-info">
              <h3 className="em-card-title">Tema do site</h3>
              <p className="em-card-desc">
                tema atual: <strong>{activeTheme.name}</strong> — mude as
                cores de todo o site com um clique
              </p>
            </div>
            <button
              className="em-card-btn"
              onClick={() => setThemeOpen(true)}
            >
              Alterar
            </button>
          </div>

          {/* ── Dados do evento ── */}
          <div className="em-card em-card-form">
            <div className="em-card-info">
              <h3 className="em-card-title">Dados do evento</h3>
              <p className="em-card-desc">
                nome, data e local — usados no site e nas confirmações
              </p>
            </div>
            {form && (
              <form className="em-form" onSubmit={saveData}>
                <div className="em-form-row">
                  <div className="em-form-field">
                    <label className="em-form-label">Nome</label>
                    <input
                      className="em-form-input"
                      type="text"
                      value={form.name}
                      onChange={setField('name')}
                      maxLength={80}
                    />
                  </div>
                  <div className="em-form-field">
                    <label className="em-form-label">Data e horário</label>
                    <input
                      className="em-form-input"
                      type="datetime-local"
                      value={form.event_date}
                      onChange={setField('event_date')}
                    />
                  </div>
                </div>
                <div className="em-form-row">
                  <div className="em-form-field">
                    <label className="em-form-label">Local</label>
                    <input
                      className="em-form-input"
                      type="text"
                      value={form.venue_name}
                      onChange={setField('venue_name')}
                      maxLength={120}
                    />
                  </div>
                  <div className="em-form-field">
                    <label className="em-form-label">Endereço</label>
                    <input
                      className="em-form-input"
                      type="text"
                      value={form.venue_address}
                      onChange={setField('venue_address')}
                      maxLength={200}
                    />
                  </div>
                </div>
                <button
                  className="em-card-btn"
                  type="submit"
                  disabled={savingData}
                >
                  {savingData ? 'Salvando...' : 'Salvar dados'}
                </button>
              </form>
            )}
          </div>

          {/* ── Seções do site ── */}
          {!isTeatro(event) && (
            <div className="em-card em-card-form">
              <div className="em-card-info">
                <h3 className="em-card-title">Seções do site</h3>
                <p className="em-card-desc">
                  monte a página do seu jeito — ligue e desligue o que quiser
                </p>
              </div>
              <div className="em-toggles">
                {SECTIONS.map((s) => (
                  <label key={s.id} className="em-toggle">
                    <input
                      type="checkbox"
                      checked={sectionEnabled(event, s.id)}
                      onChange={() => toggleSection(s.id)}
                    />
                    <span>
                      {s.label}
                      <span className="em-toggle-desc"> · {s.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Privacidade ── */}
          <div className="em-card em-card-form">
            <div className="em-card-info">
              <h3 className="em-card-title">Privacidade</h3>
              <p className="em-card-desc">
                o que os convidados podem ver no site
              </p>
            </div>
            <div className="em-toggles">
              <label className="em-toggle">
                <input
                  type="checkbox"
                  checked={event.rsvp_list_public}
                  onChange={() => toggleSetting('rsvp_list_public')}
                />
                <span>Lista de confirmados visível para convidados</span>
              </label>
              <label className="em-toggle">
                <input
                  type="checkbox"
                  checked={event.messages_public}
                  onChange={() => toggleSetting('messages_public')}
                />
                <span>Mural de mensagens visível para convidados</span>
              </label>
            </div>
          </div>

          {/* ── Conteúdo do site ── */}
          <div className="em-card">
            <div className="em-card-info">
              <h3 className="em-card-title">Fotos, presentes e conteúdo</h3>
              <p className="em-card-desc">
                foto de capa (banner), arte do convite, galeria e lista de
                presentes são editados direto no site, logado como você
              </p>
            </div>
            <a
              className="em-card-btn"
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir site
            </a>
          </div>

          {/* ── Convite digital (fase 2) ── */}
          <div className="em-card em-card-soon">
            <div className="em-card-info">
              <h3 className="em-card-title">Convite digital</h3>
              <p className="em-card-desc">
                crie uma arte de convite com foto, textos e QR code do site
              </p>
            </div>
            <button className="em-card-btn" disabled title="Em breve">
              Em breve
            </button>
          </div>

        </div>
      </main>

      {themeOpen && <ThemePicker onClose={() => setThemeOpen(false)} />}
    </div>
  )
}

export default function EventManage() {
  const { slug, token } = useParams()

  return (
    <EventProvider slug={slug} token={token}>
      <ManageContent />
    </EventProvider>
  )
}
