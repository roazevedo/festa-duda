import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createEvent, createPlanCheckout } from '../services/api'
import { EVENT_TYPES } from '../eventTypes'
import { PLANS } from '../plans'
import './NewEvent.css'

export default function NewEvent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Plano escolhido na home (?plano=completo) — o evento nasce
  // grátis e o upgrade é cobrado logo após o cadastro
  const chosenPlan = PLANS.find((p) => p.id === searchParams.get('plano')) || null
  const paidPlan   = chosenPlan && chosenPlan.id === 'completo'

  const [eventType, setEventType] = useState(null)
  const [name, setName]           = useState('')
  const [date, setDate]           = useState('')
  const [time, setTime]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    // Validação com mensagem — melhor que botão mudo/desabilitado
    if (!eventType)    return setError('Escolha o tipo do evento.')
    if (!name.trim())  return setError('Informe o nome do evento ou aniversariante.')
    if (!date)         return setError('Informe a data da festa.')
    if (!time)         return setError('Informe o horário da festa.')

    setSaving(true)
    setError(null)
    try {
      // Local e endereço são definidos depois, no editor do site,
      // ao ligar a seção "Local da festa"
      const event = await createEvent({
        event_type: eventType,
        name:       name.trim(),
        // ISO completo com fuso — evita o servidor interpretar como UTC
        event_date: new Date(`${date}T${time}`).toISOString(),
      })

      // Plano pago: segue direto para o Checkout Pro; o plano é
      // aplicado pelo webhook quando o MP aprovar o pagamento
      if (paidPlan) {
        try {
          const { init_point } =
            await createPlanCheckout(event.slug, event.token, chosenPlan.id)
          window.location.assign(init_point)
          return
        } catch (err) {
          alert(
            (err.message || 'Erro ao iniciar o pagamento.') +
            ' Seu evento foi criado no plano Grátis — você pode fazer o ' +
            'upgrade a qualquer momento pelo painel.'
          )
        }
      }

      // Direto para o site do evento com o editor lateral aberto
      navigate(`/${event.slug}/${event.token}?editar=1`)
    } catch (err) {
      setError(err.message || 'Não foi possível criar o evento.')
      setSaving(false)
    }
  }

  return (
    <div className="ne">
      <header className="ne-header">
        <button className="ne-logo" onClick={() => navigate('/dashboard')}>
          Convida<span>.me</span>
        </button>
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

        {chosenPlan && (
          <div className="ne-plan-banner">
            <span className="ne-plan-name">Plano {chosenPlan.name}</span>
            <span className="ne-plan-price">{chosenPlan.priceLabel}</span>
            <span className="ne-plan-note">
              {paidPlan
                ? 'após criar o evento, você segue para o pagamento seguro via Mercado Pago'
                : 'sem custo — faça upgrade quando quiser'}
            </span>
          </div>
        )}

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

          {/* ── Data e horário — campos separados ── */}
          <div className="ne-field-row">
            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-date">
                Data da festa
              </label>
              <input
                id="ne-date"
                className="ne-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="ne-field">
              <label className="ne-label" htmlFor="ne-time">
                Horário
              </label>
              <input
                id="ne-time"
                className="ne-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="ne-error">{error}</p>}

          <button className="ne-submit" type="submit" disabled={saving}>
            {saving
              ? 'Criando...'
              : paidPlan ? 'Criar evento e ir para o pagamento' : 'Criar meu evento'}
          </button>

        </form>
      </main>
    </div>
  )
}
