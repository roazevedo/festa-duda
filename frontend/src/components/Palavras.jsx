import { useState, useEffect } from 'react'
import AtoHeader from './AtoHeader'
import { useEvent } from '../contexts/useEvent'
import { getMessages, createMessage } from '../services/api'
import './Palavras.css'

export default function Palavras() {
  const { slug, token } = useEvent()

  const [form, setForm]     = useState({ name: '', message: '' })
  const [msgs, setMsgs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Carrega mensagens do banco
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMessages(slug, token)
        setMsgs(data)
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err)
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
    if (!form.name.trim() || !form.message.trim()) return
    setSending(true)
    try {
      const newMsg = await createMessage(slug, token, {
        name: form.name,
        body: form.message,
      })
      setMsgs((prev) => [newMsg, ...prev])
      setForm({ name: '', message: '' })
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
    } finally {
      setSending(false)
    }
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
            <label className="form-label">seu nome</label>
            <input
              className="form-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="como quer ser lembrado(a)"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">sua mensagem</label>
            <textarea
              className="form-input form-textarea"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="escreva suas palavras com carinho..."
              rows={4}
              required
            />
          </div>
          <button
            className="palavras-btn"
            type="submit"
            disabled={sending}
          >
            {sending ? 'Enviando...' : 'Enviar Recado'}
          </button>
        </form>

        <div className="palavras-feed">
          {loading && (
            <p className="palavras-empty">Carregando mensagens...</p>
          )}
          {!loading && msgs.length === 0 && (
            <p className="palavras-empty">
              Seja o primeiro a deixar uma mensagem.
            </p>
          )}
          {msgs.map((msg) => (
            <div key={msg.id} className="palavras-card">
              <p className="palavras-author">{msg.name}</p>
              <p className="palavras-text">"{msg.body}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
