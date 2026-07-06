import { useState, useEffect } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getRsvps, createRsvp } from '../services/api'
import './RSVP.css'

export default function RSVP() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true

  const [form, setForm] = useState({
    name: '', guests: '0', restriction: '', attending: 'yes'
  })
  const [companionNames, setCompanionNames] = useState([])
  const [submitted, setSubmitted]           = useState(false)
  const [list, setList]                     = useState([])
  const [loading, setLoading]               = useState(true)
  const [sending, setSending]               = useState(false)

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

    // Quando o número de acompanhantes muda, ajusta o array de nomes
    if (name === 'guests') {
      const count = parseInt(value) || 0
      setCompanionNames((prev) => {
        const next = [...prev]
        while (next.length < count) next.push('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSending(true)
    try {
      const newRsvp = await createRsvp(slug, token, {
        name:            form.name,
        guests:          parseInt(form.guests),
        attending:       form.attending,
        restriction:     form.restriction,
        companion_names: companionNames.filter(n => n.trim()),
      })
      setList((prev) => [newRsvp, ...prev])
      setSubmitted(true)
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err)
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({ name: '', guests: '0', restriction: '', attending: 'yes' })
    setCompanionNames([])
  }

  const confirmed      = list.filter((r) => r.attending === 'yes')
  const guestCount     = parseInt(form.guests) || 0

  return (
    <section className="section">
      <AtoHeader
        number="III"
        title="Sua Confirmação"
        subtitle="reservaremos sua poltrona até quinze de agosto"
      />

      <div className="rsvp-wrapper">
        <div className="rsvp-form-side">
          {!submitted ? (
            <form className="rsvp-form" onSubmit={handleSubmit}>

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
                <label className="form-label">presença</label>
                <select
                  className="form-input"
                  name="attending"
                  value={form.attending}
                  onChange={handleChange}
                >
                  <option value="yes">Estarei na plateia</option>
                  <option value="no">Não poderei comparecer</option>
                </select>
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
                    </div>
                  ))}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">restrição alimentar</label>
                <input
                  className="form-input"
                  type="text"
                  name="restriction"
                  value={form.restriction}
                  onChange={handleChange}
                  placeholder="opcional"
                />
              </div>

              <button
                className="rsvp-btn"
                type="submit"
                disabled={sending}
              >
                {sending ? 'Enviando...' : 'Confirmar minha poltrona'}
              </button>
            </form>
          ) : (
            <div className="rsvp-success">
              <p className="success-icon">🥂</p>
              <h3 className="success-title">Até lá!</h3>
              <p className="success-text">Sua poltrona está reservada.</p>
              <button className="rsvp-btn-outline" onClick={resetForm}>
                Adicionar outra confirmação
              </button>
            </div>
          )}
        </div>

        <div className="rsvp-info-side">
          <blockquote className="rsvp-quote">
            "Cada nome confirmado é uma cadeira no salão e um lugar
            à mesa. A casa pede gentileza na resposta para que tudo
            esteja em seu lugar quando as luzes se acenderem."
            <cite>— a família</cite>
          </blockquote>

          {/* Lista de confirmados — visível apenas para admin */}
          {isAdmin && !loading && confirmed.length > 0 && (
            <div className="rsvp-confirmed">
              <p className="confirmed-title">
                {confirmed.length} na plateia
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
