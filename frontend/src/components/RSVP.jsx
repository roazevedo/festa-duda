import { useState, useEffect } from 'react'
import SectionHeading from './SectionHeading'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { useEvent } from '../contexts/useEvent'
import { getRsvps, createRsvp } from '../services/api'
import { isTeatro } from '../sections'
import { saveDraft, loadDraft, clearDraft } from '../utils/draftStorage'
import './RSVP.css'

export default function RSVP() {
  const { slug, token, event } = useEvent()
  const isAdmin         = useEventAdmin()
  const teatro          = isTeatro(event)

  // Rascunho por evento — o convidado não perde o que preencheu
  // se sair e voltar (some após 24h)
  const draftKey = `rsvp:${slug}`
  const [draft] = useState(() => loadDraft(draftKey))

  // Sem campo de presença: enviar o formulário já significa confirmar
  const [form, setForm] = useState(draft?.form || { name: '', guests: '0' })
  const [companionNames, setCompanionNames]       = useState(draft?.companionNames || [])
  const [companionChildren, setCompanionChildren] = useState(draft?.companionChildren || [])
  const [restored, setRestored]             = useState(Boolean(draft))
  const [submitted, setSubmitted]           = useState(false)
  const [list, setList]                     = useState([])
  const [loading, setLoading]               = useState(true)
  const [sending, setSending]               = useState(false)

  // Guarda o que está sendo preenchido enquanto não foi enviado
  useEffect(() => {
    if (submitted) return
    const filling =
      form.name.trim() || form.guests !== '0' || companionNames.some(Boolean)
    if (filling) {
      saveDraft(draftKey, { form, companionNames, companionChildren })
    }
  }, [form, companionNames, companionChildren, submitted, draftKey])

  // Carrega confirmações — a API retorna 403 para não-admins (lista privada)
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRsvps(slug, token)
        setList(data)
      } catch (err) {
        // 403 = lista privada, ignora silenciosamente
        if (!err.message?.includes('403')) {
          console.error('Erro ao carregar RSVPs:', err)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))

    // Quando o número de acompanhantes muda, ajusta os arrays
    if (name === 'guests') {
      const count = parseInt(value) || 0
      setCompanionNames((prev) => {
        const next = [...prev]
        while (next.length < count) next.push('')
        return next.slice(0, count)
      })
      setCompanionChildren((prev) => {
        const next = [...prev]
        while (next.length < count) next.push(false)
        return next.slice(0, count)
      })
    }
  }

  const handleCompanionName = (index, value) => {
    setCompanionNames((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleCompanionChild = (index, checked) => {
    setCompanionChildren((prev) => {
      const next = [...prev]
      next[index] = checked
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSending(true)
    try {
      // Filtra os dois arrays juntos para manter o alinhamento por índice
      const companions = companionNames
        .map((n, i) => ({ name: n.trim(), child: !!companionChildren[i] }))
        .filter((c) => c.name)
      const newRsvp = await createRsvp(slug, token, {
        name:               form.name,
        guests:             parseInt(form.guests),
        attending:          'yes',
        companion_names:    companions.map((c) => c.name),
        companion_children: companions.map((c) => c.child),
      })
      setList((prev) => [newRsvp, ...prev])
      setSubmitted(true)
      setRestored(false)
      clearDraft(draftKey)
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err)
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({ name: '', guests: '0' })
    setCompanionNames([])
    setCompanionChildren([])
  }

  const clearRestored = () => {
    clearDraft(draftKey)
    setForm({ name: '', guests: '0' })
    setCompanionNames([])
    setCompanionChildren([])
    setRestored(false)
  }

  const confirmed      = list.filter((r) => r.attending === 'yes')
  const guestCount     = parseInt(form.guests) || 0

  return (
    <section className="section">
      <SectionHeading
        id="rsvp"
        atoNumber="VII"
        atoTitle="Sua Confirmação"
        atoSubtitle="reservaremos sua poltrona até quinze de agosto"
      />

      <div className="rsvp-wrapper">
        <div className="rsvp-form-side">
          {!submitted ? (
            <form className="rsvp-form" onSubmit={handleSubmit}>

              {restored && (
                <div className="rsvp-restored">
                  <span>Recuperamos o que você tinha começado a preencher.</span>
                  <button type="button" onClick={clearRestored}>Limpar</button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">seu nome</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="como consta no convite"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">acompanhantes</label>
                <select
                  className="form-input"
                  name="guests"
                  value={form.guests}
                  onChange={handleChange}
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Campos de nome para cada acompanhante */}
              {guestCount > 0 && (
                <div className="form-companions">
                  <p className="form-companions-label">
                    nome dos acompanhantes
                  </p>
                  {Array.from({ length: guestCount }).map((_, i) => (
                    <div key={i} className="form-group">
                      <label className="form-label">
                        acompanhante {i + 1}
                      </label>
                      <input
                        className="form-input"
                        type="text"
                        value={companionNames[i] || ''}
                        onChange={(e) => handleCompanionName(i, e.target.value)}
                        placeholder="nome completo"
                      />
                      <label className="form-checkbox">
                        <input
                          type="checkbox"
                          checked={!!companionChildren[i]}
                          onChange={(e) => handleCompanionChild(i, e.target.checked)}
                        />
                        criança abaixo de 8 anos
                      </label>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="rsvp-btn"
                type="submit"
                disabled={sending}
              >
                {sending
                  ? 'Enviando...'
                  : (teatro ? 'Confirmar minha poltrona' : 'Confirmar presença')}
              </button>
            </form>
          ) : (
            <div className="rsvp-success">
              <p className="success-icon">🥂</p>
              <h3 className="success-title">Até lá!</h3>
              <p className="success-text">
                {teatro ? 'Sua poltrona está reservada.' : 'Sua presença está confirmada.'}
              </p>
              <button className="rsvp-btn-outline" onClick={resetForm}>
                Adicionar outra confirmação
              </button>
            </div>
          )}
        </div>

        <div className="rsvp-info-side">
          <blockquote className={`rsvp-quote${teatro ? ' rsvp-quote--aviso' : ''}`}>
            {teatro ? (
              <>
                <strong>Não haverá bebidas alcoólicas no evento.</strong>{' '}
                Não será permitida a entrada ou o consumo de bebidas
                alcoólicas trazidas externamente. Agradecemos a compreensão.
              </>
            ) : (
              <>
                "Cada confirmação nos ajuda a preparar tudo com carinho.
                Responda com antecedência para garantirmos o seu lugar."
                <cite>— os anfitriões</cite>
              </>
            )}
          </blockquote>

          {/* Lista de confirmados — visível apenas para admin */}
          {isAdmin && !loading && confirmed.length > 0 && (
            <div className="rsvp-confirmed">
              <p className="confirmed-title">
                {confirmed.length} {teatro ? 'na plateia' : 'confirmados'}
              </p>
              <div className="confirmed-list">
                {confirmed.map((r) => (
                  <div key={r.id} className="confirmed-item">
                    <span className="confirmed-name">{r.name}</span>
                    {r.companion_names?.length > 0 && (
                      <div className="confirmed-companions">
                        {r.companion_names.map((cn, i) => (
                          <span key={i} className="confirmed-companion">
                            + {cn}
                            {r.companion_children?.[i] && (
                              <em className="confirmed-child"> · criança -8</em>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </section>
  )
}
