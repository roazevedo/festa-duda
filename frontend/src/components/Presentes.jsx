import { useState, useEffect, useRef } from 'react'
import SectionHeading from './SectionHeading'
import GiftCatalogModal from './GiftCatalogModal'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { useEvent } from '../contexts/useEvent'
import { useConfirm } from './useConfirm'
import {
  getGifts, createGift, updateGift, deleteGift, createGiftCheckout,
  getGiftPayments, updateEvent,
} from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { planLimit } from '../plans'
import './Presentes.css'

const EMPTY_FORM = { name: '', description: '', price: '', image_url: '' }

const STATUS_LABELS = {
  approved:     'aprovado',
  pending:      'pendente',
  authorized:   'autorizado',
  in_process:   'em análise',
  in_mediation: 'em mediação',
  rejected:     'recusado',
  cancelled:    'cancelado',
  refunded:     'estornado',
  charged_back: 'contestado',
}

const FEEDBACK = {
  sucesso:  { tone: 'ok',    text: 'Presente recebido com carinho — muito obrigada!' },
  pendente: { tone: 'warn',  text: 'Pagamento em processamento. Assim que confirmar, o presente chega até nós.' },
  erro:     { tone: 'error', text: 'O pagamento não foi concluído. Se quiser, tente novamente.' },
}

const formatPrice = (value) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const EMPTY_EXT = { label: '', url: '' }

// Aceita a URL como o usuário digitou; garante o esquema https://
// para virar um link externo válido (sem ele o navegador trata como
// caminho relativo dentro do próprio site).
const normalizeUrl = (raw) => {
  const v = raw.trim()
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

export default function Presentes() {
  const { event, slug, token, setEvent } = useEvent()
  const isAdmin                = useEventAdmin()

  const [gifts, setGifts]         = useState([])
  const [confirm, confirmModal]   = useConfirm()
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [payingId, setPayingId]   = useState(null)
  const [feedback, setFeedback]   = useState(null)
  const [payments, setPayments]   = useState(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const imgInputRef = useRef(null)
  const [extForm, setExtForm]     = useState(EMPTY_EXT)
  const [savingExt, setSavingExt] = useState(false)

  const externalLists = event?.settings?.external_gift_lists || []

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

  useEffect(() => {
    if (!isAdmin) return
    const load = async () => {
      try {
        const data = await getGiftPayments(slug, token)
        setPayments(data)
      } catch (err) {
        console.error('Erro ao carregar pagamentos:', err)
      }
    }
    load()
  }, [isAdmin, slug, token])

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

  // Limite de presentes no plano grátis (null = ilimitado)
  const giftLimit = planLimit(event, 'gifts')
  const atLimit   = giftLimit != null && gifts.length >= giftLimit

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
      image_url:   gift.image_url || '',
    })
  }

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const { url } = await uploadToCloudinary(file, 'festa-duda/presentes')
      setForm((f) => ({ ...f, image_url: url }))
    } catch (err) {
      console.error('Erro ao enviar imagem do presente:', err)
      alert(err.message || 'Erro ao enviar a imagem. Tente novamente.')
    } finally {
      setUploadingImg(false)
      // Limpa o input para permitir reenviar o mesmo arquivo
      if (imgInputRef.current) imgInputRef.current.value = ''
    }
  }

  const removeImage = () => setForm((f) => ({ ...f, image_url: '' }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editingId && atLimit) return
    setSaving(true)
    try {
      const data = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        image_url:   form.image_url,
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
    if (!(await confirm(`Remover "${gift.name}" da lista?`))) return
    try {
      await deleteGift(slug, token, gift.id)
      setGifts(gifts.filter((g) => g.id !== gift.id))
      if (editingId === gift.id) cancelEdit()
    } catch (err) {
      console.error('Erro ao remover presente:', err)
      alert(err.message || 'Erro ao remover presente.')
    }
  }

  // Snapshot do item do catálogo: o Gift do evento nasce com uma
  // cópia dos campos — mudanças futuras no catálogo não o afetam
  const handlePickFromCatalog = async (item) => {
    const created = await createGift(slug, token, {
      name:        item.name,
      description: item.description || '',
      price:       item.price,
      image_url:   item.image_url || '',
    })
    setGifts((prev) => [...prev, created])
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

  // Persiste a lista de links externos dentro de settings — o PATCH
  // substitui o jsonb inteiro, então mandamos as settings mescladas.
  const persistExternalLists = async (nextLists) => {
    const nextSettings = { ...(event.settings || {}), external_gift_lists: nextLists }
    setSavingExt(true)
    try {
      const updated = await updateEvent(slug, token, { settings: nextSettings })
      setEvent(updated)
    } catch (err) {
      console.error('Erro ao salvar lista externa:', err)
      alert(err.message || 'Erro ao salvar a lista. Tente novamente.')
    } finally {
      setSavingExt(false)
    }
  }

  const handleAddExternal = async (e) => {
    e.preventDefault()
    const url   = normalizeUrl(extForm.url)
    const label = extForm.label.trim()
    if (!url) return
    await persistExternalLists([...externalLists, { label, url }])
    setExtForm(EMPTY_EXT)
  }

  const handleRemoveExternal = async (index) => {
    if (!(await confirm('Remover este link de lista externa?'))) return
    await persistExternalLists(externalLists.filter((_, i) => i !== index))
  }

  // Formulário de presente — reaproveitado no topo (cadastrar) e dentro do
  // card em edição (o mesmo estado `form`/`editingId` alterna o modo)
  const giftForm = (
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
        <div className="form-group gifts-admin-image">
          <label className="form-label">imagem (opcional)</label>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            style={{ display: 'none' }}
          />
          {form.image_url ? (
            <div className="gift-image-preview">
              <img src={form.image_url} alt="Prévia do presente" />
              <div className="gift-image-preview-actions">
                <button
                  type="button"
                  className="gift-image-btn"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={uploadingImg}
                >
                  trocar
                </button>
                <button
                  type="button"
                  className="gift-image-btn gift-image-btn-remove"
                  onClick={removeImage}
                  disabled={uploadingImg}
                >
                  remover
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="gift-image-upload"
              onClick={() => imgInputRef.current?.click()}
              disabled={uploadingImg}
            >
              {uploadingImg ? 'enviando...' : '+ enviar imagem'}
            </button>
          )}
        </div>
      </div>
      <div className="gifts-admin-actions">
        <button
          className="gifts-admin-submit"
          type="submit"
          disabled={saving || (!editingId && atLimit)}
          title={!editingId && atLimit
            ? 'Limite de presentes do plano Grátis atingido'
            : undefined}
        >
          {saving ? 'salvando...' : editingId ? 'salvar alterações' : 'adicionar'}
        </button>
        {editingId && (
          <button className="gifts-admin-cancel" type="button" onClick={cancelEdit}>
            cancelar
          </button>
        )}
        {!editingId && (
          <button
            className="gifts-admin-cancel"
            type="button"
            onClick={() => setCatalogOpen(true)}
            disabled={atLimit}
            title={atLimit
              ? 'Limite de presentes do plano Grátis atingido'
              : undefined}
          >
            escolher do catálogo
          </button>
        )}
      </div>
      {giftLimit != null && !editingId && (
        <p className="gifts-plan-hint">
          {gifts.length} de {giftLimit} presentes do plano Grátis
          {atLimit &&
            ' · limite atingido — o plano Completo libera a lista ilimitada'}
        </p>
      )}
    </form>
  )

  return (
    <section className="section">
      <SectionHeading
        id="presentes"
        atoNumber="V"
        atoTitle="Os Presentes"
        atoSubtitle="contribuições em dinheiro · pix ou cartão · escolha o que tocar seu coração"
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

      {isAdmin && !editingId && giftForm}

      {isAdmin && (
        <form className="gifts-admin-form gifts-ext-admin" onSubmit={handleAddExternal}>
          <p className="gifts-admin-title">lista em outra loja</p>
          <p className="gifts-ext-help">
            Tem uma lista pronta na Amazon, Mercado Livre ou outra loja?
            Adicione o link e os convidados poderão abri-la direto do convite.
          </p>
          {externalLists.length > 0 && (
            <ul className="gifts-ext-list">
              {externalLists.map((item, i) => (
                <li key={i} className="gifts-ext-item">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.label || item.url}
                  </a>
                  <button
                    type="button"
                    className="gift-admin-btn gift-admin-btn-remove"
                    onClick={() => handleRemoveExternal(i)}
                    disabled={savingExt}
                  >
                    remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="gifts-admin-fields">
            <div className="form-group">
              <label className="form-label">loja</label>
              <input
                className="form-input"
                type="text"
                value={extForm.label}
                onChange={(e) => setExtForm({ ...extForm, label: e.target.value })}
                placeholder="Ex.: Amazon"
              />
            </div>
            <div className="form-group">
              <label className="form-label">link da lista</label>
              <input
                className="form-input"
                type="text"
                value={extForm.url}
                onChange={(e) => setExtForm({ ...extForm, url: e.target.value })}
                placeholder="Ex.: amazon.com.br/hz/wishlist/..."
              />
            </div>
          </div>
          <div className="gifts-admin-actions">
            <button
              className="gifts-admin-submit"
              type="submit"
              disabled={savingExt || !extForm.url.trim()}
            >
              {savingExt ? 'salvando...' : 'adicionar link'}
            </button>
          </div>
        </form>
      )}

      <div className="gifts-wrapper">
        {gifts.length > 0 ? (
          <div className="gifts-table">
            {gifts.map((gift, i) => (
              <div key={gift.id} className="gift-row">
                <div className="gift-media">
                  {gift.image_url ? (
                    <img src={gift.image_url} alt={gift.name} loading="lazy" />
                  ) : (
                    <span className="gift-media-fallback">🎁</span>
                  )}
                </div>
                <div className="gift-info">
                  <div className="gift-top">
                    <span className="gift-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="gift-name">{gift.name.toUpperCase()}</span>
                  </div>
                  {gift.description && <p className="gift-desc">{gift.description}</p>}
                  <p className="gift-value">R$ {formatPrice(gift.price)}</p>
                </div>
                {isAdmin ? (
                  <div className="gift-card-actions">
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
                    className="gift-card-btn"
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

      {!isAdmin && externalLists.length > 0 && (
        <div className="gifts-ext-public">
          <p className="gifts-ext-public-title">Listas em outras lojas</p>
          <div className="gifts-ext-public-links">
            {externalLists.map((item, i) => (
              <a
                key={i}
                className="gift-btn gifts-ext-link"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label ? `Ver lista · ${item.label}` : 'Ver lista'}
              </a>
            ))}
          </div>
        </div>
      )}

      {isAdmin && payments && payments.payments.length > 0 && (
        <div className="gifts-payments">
          <div className="gifts-payments-header">
            <p className="gifts-admin-title">pagamentos recebidos</p>
            <p className="gifts-payments-total">
              total aprovado: <strong>R$ {formatPrice(payments.total_approved)}</strong>
            </p>
          </div>
          <div className="gifts-payments-list">
            {payments.payments.map((p) => (
              <div key={p.id} className="gifts-payment-row">
                <span className="gp-gift">{p.gift_name}</span>
                <span className="gp-amount">R$ {formatPrice(p.amount)}</span>
                <span className={`gp-status gp-status-${p.status}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </span>
                <span className="gp-payer">{p.payer_email || '—'}</span>
                <span className="gp-date">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingId && (
        <div className="gift-form-overlay" onClick={cancelEdit}>
          <div className="gift-form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gift-form-close" onClick={cancelEdit} title="Fechar">
              ✕
            </button>
            {giftForm}
          </div>
        </div>
      )}

      {catalogOpen && (
        <GiftCatalogModal
          eventType={event?.event_type}
          existingNames={new Set(gifts.map((g) => g.name.toLowerCase()))}
          onPick={handlePickFromCatalog}
          onClose={() => setCatalogOpen(false)}
        />
      )}

      {confirmModal}
    </section>
  )
}
