import { useState } from 'react'
import AtoHeader from './AtoHeader'
import './Palavras.css'

export default function Palavras() {
  const [form, setForm] = useState({ name: '', message: '' })
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('messages') || '[]') }
    catch { return [] }
  })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    const entry = { ...form, id: Date.now() }
    const updated = [entry, ...messages]
    setMessages(updated)
    localStorage.setItem('messages', JSON.stringify(updated))
    setForm({ name: '', message: '' })
  }

  return (
    <section className="section">
      <AtoHeader
        number="V"
        title="As Palavras"
        subtitle="deixe uma mensagem para Maria Eduarda"
      />

      <div className="palavras-wrapper">

        <form className="palavras-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Seu nome</label>
            <input
              className="form-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Como quer ser lembrado(a)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sua mensagem</label>
            <textarea
              className="form-input form-textarea"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Escreva suas palavras com carinho..."
              rows={4}
            />
          </div>
          <button className="palavras-btn" type="submit">
            Enviar Recado
          </button>
        </form>

        <div className="palavras-feed">
          {messages.length === 0 && (
            <p className="palavras-empty">
              Seja o primeiro a deixar uma mensagem.
            </p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="palavras-card">
              <p className="palavras-author">{msg.name}</p>
              <p className="palavras-text">"{msg.message}"</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
