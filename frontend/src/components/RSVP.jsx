import { useState, useEffect } from 'react'
import AtoHeader from './AtoHeader'
import { useEvent } from '../contexts/useEvent'
import { getRsvps, createRsvp } from '../services/api'
import './RSVP.css'

export default function RSVP() {
  const { slug, token } = useEvent()

  const [form, setForm] = useState({
    name: '', guests: '0', restriction: '', attending: 'yes'
  })
  const [submitted, setSubmitted] = useState(false)
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)

  // Carrega confirmações do banco
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRsvps(slug, token)
        setList(data)
      } catch (err) {
        console.error('Erro ao carregar RSVPs:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, token])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSending(true)
    try {
      const newRsvp = await createRsvp(slug, token, {
        name:        form.name,
        guests:      parseInt(form.guests),
        attending:   form.attending,
        restriction: form.restriction,
      })
      setList((prev) => [newRsvp, ...prev])
      setSubmitted(true)
    } catch (err) {
      console.error('Erro ao enviar RSVP:', err)
    } finally {
      setSending(false)
    }
  }

  const confirmed = list.filter((r) => r.attending === 'yes')

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
              <button
                className="rsvp-btn-outline"
                onClick={() => { setSubmitted(false); setForm({ name: '', guests: '0', restriction: '', attending: 'yes' }) }}
              >
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

          {!loading && confirmed.length > 0 && (
            <div className="rsvp-confirmed">
              <p className="confirmed-title">
                {confirmed.length} na plateia
              </p>
              <div className="confirmed-list">
                {confirmed.slice(0, 8).map((r) => (
                  <span key={r.id} className="confirmed-name">
                    {r.name}
                  </span>
                ))}
                {confirmed.length > 8 && (
                  <span className="confirmed-more">
                    +{confirmed.length - 8} mais
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
