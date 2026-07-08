import { useState, useEffect } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import {
  getGifts, createGift, updateGift, deleteGift, createGiftCheckout,
} from '../services/api'
import './Presentes.css'

const EMPTY_FORM = { name: '', description: '', price: '' }

const FEEDBACK = {
  sucesso:  { tone: 'ok',    text: 'Presente recebido com carinho — muito obrigada!' },
  pendente: { tone: 'warn',  text: 'Pagamento em processamento. Assim que confirmar, o presente chega até nós.' },
  erro:     { tone: 'error', text: 'O pagamento não foi concluído. Se quiser, tente novamente.' },
}

const formatPrice = (value) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

export default function Presentes() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true

  const [gifts, setGifts]         = useState([])
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [payingId, setPayingId]   = useState(null)
  const [feedback, setFeedback]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getGifts(slug, token)
        setGifts(data)
      } catch (err) {
        console.error('Erro ao carregar presentes:', err)
      }
    }
    load()
  }, [slug, token])

  // Retorno do Checkout Pro (back_urls: ?presente=sucesso|pendente|erro)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('presente')
    if (!status || !FEEDBACK[status]) return

    setFeedback(FEEDBACK[status])
    params.delete('presente')
    const query = params.toString()
    window.history.replaceState(
      null, '', window.location.pathname + (query ? `?${query}` : '')
    )
  }, [])

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value })

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const startEdit = (gift) => {
    setEditingId(gift.id)
    setForm({
      name:        gift.name,
      description: gift.description || '',
      price:       String(gift.price),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
      }
      if (editingId) {
        const updated = await updateGift(slug, token, editingId, data)
        setGifts(gifts.map((g) => (g.id === editingId ? updated : g)))
      } else {
        const created = await createGift(slug, token, data)
        setGifts([...gifts, created])
      }
      cancelEdit()
    } catch (err) {
      console.error('Erro ao salvar presente:', err)
      alert(err.message || 'Erro ao salvar presente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (gift) => {
    if (!window.confirm(`Remover "${gift.name}" da lista?`)) return
    try {
      await deleteGift(slug, token, gift.id)
      setGifts(gifts.filter((g) => g.id !== gift.id))
      if (editingId === gift.id) cancelEdit()
    } catch (err) {
      console.error('Erro ao remover presente:', err)
      alert(err.message || 'Erro ao remover presente.')
    }
  }

  const handlePay = async (gift) => {
    setPayingId(gift.id)
    try {
      const { init_point } = await createGiftCheckout(slug, token, gift.id)
      window.location.href = init_point
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err)
      alert(err.message || 'Erro ao iniciar o pagamento. Tente novamente.')
      setPayingId(null)
    }
  }

  return (
    <section className="section">
      <AtoHeader
        number="IV"
        title="Os Presentes"
        subtitle="contribuições em dinheiro · pix ou cartão · escolha o que tocar seu coração"
      />

      {feedback && (
        <div className={`gifts-feedback gifts-feedback-${feedback.tone}`}>
          <span>{feedback.text}</span>
          <button
            className="gifts-feedback-close"
            onClick={() => setFeedback(null)}
            title="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {isAdmin && (
        <form className="gifts-admin-form" onSubmit={handleSubmit}>
          <p className="gifts-admin-title">
            {editingId ? 'editar presente' : 'cadastrar presente'}
          </p>
          <div className="gifts-admin-fields">
            <div className="form-group">
              <label className="form-label">nome</label>
              <input
                className="form-input"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Ex.: Coroa de princesa"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">descrição</label>
              <input
                className="form-input"
                type="text"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Ex.: A peça central do ritual dos quinze"
              />
            </div>
            <div className="form-group">
              <label className="form-label">valor (R$)</label>
              <input
                className="form-input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange('price')}
                placeholder="Ex.: 400.00"
                required
              />
            </div>
          </div>
          <div className="gifts-admin-actions">
            <button className="gifts-admin-submit" type="submit" disabled={saving}>
              {saving ? 'salvando...' : editingId ? 'salvar alterações' : 'adicionar'}
            </button>
            {editingId && (
              <button className="gifts-admin-cancel" type="button" onClick={cancelEdit}>
                cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="gifts-wrapper">
        {gifts.length > 0 ? (
          <div className="gifts-table">
            {gifts.map((gift, i) => (
              <div key={gift.id} className={'gift-row' + (i % 2 === 0 ? '' : ' gift-row-right')}>
                <div className="gift-info">
                  <div className="gift-top">
                    <span className="gift-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="gift-name">{gift.name.toUpperCase()}</span>
                  </div>
                  {gift.description && <p className="gift-desc">{gift.description}</p>}
                  <p className="gift-value">R$ {formatPrice(gift.price)}</p>
                </div>
                {isAdmin ? (
                  <div className="gift-admin-btns">
                    <button
                      className="gift-admin-btn"
                      onClick={() => startEdit(gift)}
                      title="Editar presente"
                    >
                      editar
                    </button>
                    <button
                      className="gift-admin-btn gift-admin-btn-remove"
                      onClick={() => handleDelete(gift)}
                      title="Remover presente"
                    >
                      remover
                    </button>
                  </div>
                ) : (
                  <button
                    className="gift-btn"
                    onClick={() => handlePay(gift)}
                    disabled={payingId !== null}
                  >
                    {payingId === gift.id ? 'aguarde...' : 'Presentear'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="gifts-empty">
            {isAdmin
              ? 'nenhum presente cadastrado — use o formulário acima.'
              : 'lista de presentes · em breve'}
          </p>
        )}
      </div>
    </section>
  )
}
