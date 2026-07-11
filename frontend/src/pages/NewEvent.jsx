import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../services/api'
import './NewEvent.css'

const EVENT_TYPES = [
  { id: 'quinze_anos', label: 'XV Anos',     desc: 'festa de debutante' },
  { id: 'casamento',   label: 'Casamento',   desc: 'cerimônia e recepção' },
  { id: 'aniversario', label: 'Aniversário', desc: 'qualquer idade' },
]

export default function NewEvent() {
  const navigate = useNavigate()

  const [eventType, setEventType] = useState(null)
  const [name, setName]           = useState('')
  const [date, setDate]           = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueAddr, setVenueAddr] = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    // Validação com mensagem — melhor que botão mudo/desabilitado
    if (!eventType)    return setError('Escolha o tipo do evento.')
    if (!name.trim())  return setError('Informe o nome do evento ou aniversariante.')
    if (!date)         return setError('Informe a data e o horário da festa.')

    setSaving(true)
    setError(null)
    try {
      const event = await createEvent({
        event_type:    eventType,
        name:          name.trim(),
        event_date:    date,
        venue_name:    venueName.trim() || null,
        venue_address: venueAddr.trim() || null,
      })
      navigate(`/dashboard/evento/${event.slug}/${event.token}`)
    } catch (err) {
      setError(err.message || 'Não foi possível criar o evento.')
      setSaving(false)
    }
  }

  return (
    <div className="ne">
      <header className="ne-header">
        <button className="ne-back" onClick={() => navigate('/dashboard')}>
          ← Painel
        </button>
      </header>

      <main className="ne-main">
        <h1 className="ne-title">Criar novo evento</h1>
        <p className="ne-sub">
          Conte o básico — o site do seu evento nasce pronto e você
          personaliza tudo depois.
        </p>

        <form className="ne-form" onSubmit={handleSubmit}>

          {/* ── Tipo de evento ── */}
          <div className="ne-field">
            <label className="ne-label">Qual é o tipo do evento?</label>
            <div className="ne-types">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={
                    'ne-type-card'
                    + (eventType === t.id ? ' ne-type-selected' : '')
                  }
                  onClick={() => setEventType(t.id)}
                >
                  <span className="ne-type-label">{t.label}</span>
                  <span className="ne-type-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Nome ── */}
          <div className="ne-field">
            <label className="ne-label" htmlFor="ne-name">
              Nome do evento ou aniversariante
            </label>
            <input
              id="ne-name"
              className="ne-input"
              type="text"
              placeholder="Ex: Maria Eduarda"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
            />
            <p className="ne-hint">
              esse nome aparece no topo do site e define o endereço da página
            </p>
          </div>

          {/* ── Data ── */}
          <div className="ne-field">
            <label className="ne-label" htmlFor="ne-date">
              Data e horário
            </label>
            <input
              id="ne-date"
              className="ne-input"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* ── Local (opcional) ── */}
          <div className="ne-field-row">
            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-venue">
                Local <span className="ne-optional">(opcional)</span>
              </label>
              <input
                id="ne-venue"
                className="ne-input"
                type="text"
                placeholder="Ex: Casa de Festas Elite"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-addr">
                Endereço <span className="ne-optional">(opcional)</span>
              </label>
              <input
                id="ne-addr"
                className="ne-input"
                type="text"
                placeholder="Ex: Rua Vítor Meireles, 485 · Rio de Janeiro"
                value={venueAddr}
                onChange={(e) => setVenueAddr(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          {error && <p className="ne-error">{error}</p>}

          <button className="ne-submit" type="submit" disabled={saving}>
            {saving ? 'Criando...' : 'Criar meu evento'}
          </button>

        </form>
      </main>
    </div>
  )
}
