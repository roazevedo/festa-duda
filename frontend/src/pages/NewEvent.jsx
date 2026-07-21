import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createEvent, createNewEventCheckout } from '../services/api'
import { EVENT_TYPES } from '../eventTypes'
import { PLANS } from '../plans'
import { saveDraft, loadDraft, clearDraft } from '../utils/draftStorage'
import { useConfirm } from '../components/useConfirm'
import './NewEvent.css'

const DRAFT_KEY = 'new-event'

export default function NewEvent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Plano escolhido na home (?plano=completo) — o evento nasce
  // grátis e o upgrade é cobrado logo após o cadastro
  const chosenPlan = PLANS.find((p) => p.id === searchParams.get('plano')) || null
  const paidPlan   = chosenPlan && chosenPlan.id === 'completo'

  // Rascunho salvo antes de o usuário sair (some após 24h)
  const [draft] = useState(() => loadDraft(DRAFT_KEY))
  const [eventType, setEventType] = useState(draft?.eventType ?? null)
  const [name, setName]           = useState(draft?.name ?? '')
  const [date, setDate]           = useState(draft?.date ?? '')
  const [time, setTime]           = useState(draft?.time ?? '')
  const [restored, setRestored]   = useState(Boolean(draft))
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [confirm, confirmModal]   = useConfirm()

  // Salva o que já foi preenchido para não perder ao sair e voltar
  useEffect(() => {
    if (eventType || name || date || time) {
      saveDraft(DRAFT_KEY, { eventType, name, date, time })
    }
  }, [eventType, name, date, time])

  const clearRestored = () => {
    clearDraft(DRAFT_KEY)
    setEventType(null)
    setName('')
    setDate('')
    setTime('')
    setRestored(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return

    // Validação com mensagem — melhor que botão mudo/desabilitado
    if (!eventType)    return setError('Escolha o tipo do evento.')
    if (!name.trim())  return setError('Informe o nome do evento ou aniversariante.')
    if (!date)         return setError('Informe a data da festa.')
    if (!time)         return setError('Informe o horário da festa.')

    // ISO completo com fuso — evita o servidor interpretar como UTC
    const eventDate = new Date(`${date}T${time}`).toISOString()

    // ── Plano pago: NÃO cria o evento agora ──
    // Vai ao pagamento; o evento nasce só quando o MP aprovar (o
    // rascunho fica salvo para o usuário retomar se voltar sem pagar).
    if (paidPlan) {
      const ok = await confirm(
        'Você vai para o pagamento seguro do Mercado Pago. Seu evento é ' +
        'criado assim que o pagamento for confirmado. Se voltar sem pagar, ' +
        'nada é cobrado e seus dados ficam salvos aqui.',
        'Ir para o pagamento'
      )
      if (!ok) return

      setSaving(true)
      setError(null)
      try {
        const { init_point } = await createNewEventCheckout({
          plan:       chosenPlan.id,
          event_type: eventType,
          name:       name.trim(),
          event_date: eventDate,
        })
        window.location.assign(init_point)
      } catch (err) {
        setError(err.message || 'Não foi possível iniciar o pagamento.')
        setSaving(false)
      }
      return
    }

    // ── Plano grátis: cria o evento no clique ──
    setSaving(true)
    setError(null)
    try {
      // Local e endereço são definidos depois, no editor do site
      const event = await createEvent({
        event_type: eventType,
        name:       name.trim(),
        event_date: eventDate,
      })
      clearDraft(DRAFT_KEY)
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

        {restored && (
          <div className="ne-restored">
            <span>Recuperamos o que você tinha começado a preencher.</span>
            <button type="button" onClick={clearRestored}>Começar do zero</button>
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
              ? (paidPlan ? 'Redirecionando...' : 'Criando...')
              : paidPlan ? 'Ir para o pagamento' : 'Criar meu evento'}
          </button>

        </form>
      </main>

      {confirmModal}
    </div>
  )
}
