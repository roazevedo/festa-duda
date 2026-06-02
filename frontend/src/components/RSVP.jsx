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
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
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

  const confirmed = list.filter(r => r.attending === 'yes')

  return (
    <section className="section">
      <AtoHeader
        number="III"
        title="Sua Confirmação"
        subtitle="confirme sua presença e faça parte desta noite"
      />

      <div className="rsvp-wrapper">
        {/* Formulário */}
        <div className="rsvp-form-side">
          {!submitted ? (
            <form className="rsvp-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Como prefere ser chamado(a)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Acompanhantes</label>
                  <select
                    className="form-input"
                    name="guests"
                    value={form.guests}
                    onChange={handleChange}
                  >
                    {[0,1,2,3,4].map(n => (
                      <option key={n} value={n}>
                        {n} pessoa{n !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmação</label>
                  <select
                    className="form-input"
                    name="attending"
                    value={form.attending}
                    onChange={handleChange}
                  >
                    <option value="yes">✓ Estarei lá</option>
                    <option value="no">✗ Não poderei ir</option>
                    <option value="maybe">? Talvez</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Restrição alimentar</label>
                <input
                  className="form-input"
                  type="text"
                  name="restriction"
                  value={form.restriction}
                  onChange={handleChange}
                  placeholder="Vegetariano, alergia, etc. (opcional)"
                />
              </div>

              <button className="rsvp-btn" type="submit">
                Confirmar Presença
              </button>
            </form>
          ) : (
            <div className="rsvp-success">
              <p className="success-icon">🥂</p>
              <h3 className="success-title">Até lá!</h3>
              <p className="success-text">
                Sua presença foi confirmada com sucesso.
              </p>
              <button
                className="rsvp-btn-outline"
                onClick={() => setSubmitted(false)}
              >
                Adicionar outra confirmação
              </button>
            </div>
          )}
        </div>

        {/* Lado direito — quote + confirmados */}
        <div className="rsvp-info-side">
          <blockquote className="rsvp-quote">
            "Cada momento celebrado com quem se ama se torna
            um lugar eterno. E você está convidado a fazer
            parte desta história."
          </blockquote>

          {confirmed.length > 0 && (
            <div className="rsvp-confirmed">
              <p className="confirmed-title">
                {confirmed.length} confirmado{confirmed.length !== 1 ? 's' : ''}
              </p>
              <div className="confirmed-list">
                {confirmed.slice(0, 8).map(r => (
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
