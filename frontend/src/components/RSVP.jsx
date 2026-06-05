import { useState } from 'react'
import AtoHeader from './AtoHeader'
import './RSVP.css'

export default function RSVP() {
  const [form, setForm] = useState({
    name: '', guests: '0', restriction: '', attending: 'yes'
  })
  const [submitted, setSubmitted] = useState(false)
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rsvp') || '[]') }
    catch { return [] }
  })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const entry = { ...form, id: Date.now() }
    const updated = [entry, ...list]
    setList(updated)
    localStorage.setItem('rsvp', JSON.stringify(updated))
    setSubmitted(true)
  }

  const confirmed = list.filter((r) => r.attending === 'yes')

  return (
    <section className="section">
      <AtoHeader
        number="III"
        title="Sua Confirmacao"
        subtitle="reservaremos sua poltrona ate quinze de agosto"
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">presenca</label>
                <select
                  className="form-input"
                  name="attending"
                  value={form.attending}
                  onChange={handleChange}
                >
                  <option value="yes">Estarei na plateia</option>
                  <option value="no">Nao poderei comparecer</option>
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
                  {[0,1,2].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">restricao alimentar</label>
                <input
                  className="form-input"
                  type="text"
                  name="restriction"
                  value={form.restriction}
                  onChange={handleChange}
                  placeholder="opcional"
                />
              </div>

              <button className="rsvp-btn" type="submit">
                Confirmar minha poltrona
              </button>
            </form>
          ) : (
            <div className="rsvp-success">
              <p className="success-icon">🥂</p>
              <h3 className="success-title">Ate la!</h3>
              <p className="success-text">
                Sua poltrona esta reservada.
              </p>
              <button
                className="rsvp-btn-outline"
                onClick={() => setSubmitted(false)}
              >
                Adicionar outra confirmacao
              </button>
            </div>
          )}
        </div>

        <div className="rsvp-info-side">
          <blockquote className="rsvp-quote">
            "Cada nome confirmado e uma cadeira no salao e um lugar a mesa.
            A casa pede gentileza na resposta para que tudo esteja em seu
            lugar quando as luzes se acenderem."
            <cite>— a familia</cite>
          </blockquote>

          {confirmed.length > 0 && (
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
