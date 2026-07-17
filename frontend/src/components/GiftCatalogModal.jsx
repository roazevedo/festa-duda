import { useState, useEffect, useMemo } from 'react'
import { getGiftCatalog } from '../services/api'
import './GiftCatalogModal.css'

// ════════════════════════════════════════════════════════════
// CATÁLOGO DE PRESENTES — modal com sugestões prontas
// (GET /api/v1/gift_catalog). O catálogo é único para toda a
// plataforma: a mesma lista aparece para qualquer evento e o
// organizador decide o que combina com a festa dele. Ao
// adicionar, o pai cria o Gift do evento copiando os campos
// (snapshot) — a lista não muda se o catálogo for atualizado.
// ════════════════════════════════════════════════════════════

const formatPrice = (value) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const categoryLabel = (cat) => cat.replaceAll('_', ' ')

export default function GiftCatalogModal({ eventType, existingNames, onPick, onClose }) {
  const [items, setItems]       = useState(null)
  const [error, setError]       = useState(null)
  const [category, setCategory] = useState(null)
  const [addingKey, setAddingKey] = useState(null)
  const [addedKeys, setAddedKeys] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        setItems(await getGiftCatalog(eventType))
      } catch (err) {
        console.error('Erro ao carregar o catálogo:', err)
        setError('Não foi possível carregar as sugestões. Tente novamente.')
      }
    }
    load()
  }, [eventType])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const categories = useMemo(() => {
    if (!items) return []
    return [...new Set(items.map((i) => i.category).filter(Boolean))]
  }, [items])

  const visible = useMemo(() => {
    if (!items) return []
    return category ? items.filter((i) => i.category === category) : items
  }, [items, category])

  const isAdded = (item) =>
    addedKeys.has(item.id) || existingNames.has(item.name.toLowerCase())

  const handleAdd = (item) => async () => {
    setAddingKey(item.id)
    try {
      await onPick(item)
      setAddedKeys((prev) => new Set(prev).add(item.id))
    } catch (err) {
      console.error('Erro ao adicionar presente do catálogo:', err)
      alert(err.message || 'Erro ao adicionar o presente.')
    } finally {
      setAddingKey(null)
    }
  }

  const renderCard = (item) => {
    const added = isAdded(item)
    return (
      <div key={`${item.event_type}-${item.id}`} className="catalog-card">
        <div className="catalog-card-media">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} loading="lazy" />
          ) : (
            <span className="catalog-card-fallback">🎁</span>
          )}
        </div>
        <div className="catalog-card-body">
          <p className="catalog-card-name">{item.name}</p>
          {item.description && (
            <p className="catalog-card-desc">{item.description}</p>
          )}
          <p className="catalog-card-price">R$ {formatPrice(item.price)}</p>
        </div>
        <button
          className={'catalog-card-add' + (added ? ' catalog-card-added' : '')}
          onClick={handleAdd(item)}
          disabled={added || addingKey !== null}
        >
          {added
            ? 'na lista ✓'
            : addingKey === item.id
              ? 'adicionando...'
              : 'adicionar'}
        </button>
      </div>
    )
  }

  return (
    <div className="catalog-overlay" onClick={onClose}>
      <div className="catalog-box" onClick={(e) => e.stopPropagation()}>

        <header className="catalog-header">
          <div>
            <p className="catalog-title">Sugestões de presente</p>
            <p className="catalog-hint">
              escolha itens prontos para a sua lista — depois dá para
              editar nome, descrição e valor como quiser
            </p>
          </div>
          <button className="catalog-close" onClick={onClose} title="Fechar">
            ✕
          </button>
        </header>

        {categories.length > 1 && (
          <div className="catalog-filters">
            <button
              className={'catalog-filter' + (category === null ? ' catalog-filter-active' : '')}
              onClick={() => setCategory(null)}
            >
              todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={'catalog-filter' + (category === cat ? ' catalog-filter-active' : '')}
                onClick={() => setCategory(cat)}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        )}

        <div className="catalog-body">
          {error && <p className="catalog-status">{error}</p>}
          {!error && items === null && (
            <p className="catalog-status">carregando sugestões...</p>
          )}
          {!error && items !== null && visible.length === 0 && (
            <p className="catalog-status">
              nenhuma sugestão por aqui — cadastre presentes pelo formulário.
            </p>
          )}

          <div className="catalog-grid">{visible.map(renderCard)}</div>
        </div>

      </div>
    </div>
  )
}
