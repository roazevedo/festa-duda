import { useState, useRef, useEffect } from 'react'
import './PhotoOrganizer.css'

// ════════════════════════════════════════════════════════════
// ORGANIZADOR DE FOTOS — modal com as fotos em miniatura onde
// o admin arrasta e solta para definir a ordem do álbum.
// Segurando uma foto perto da borda de cima/baixo, a lista rola
// sozinha — dá para levar a última foto até o início.
// Nada é salvo até clicar em "Salvar ordem".
// ════════════════════════════════════════════════════════════
export default function PhotoOrganizer({ photos, saving, onSave, onClose }) {
  const [order, setOrder]   = useState(photos)
  const [dragId, setDragId] = useState(null)
  const listRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleDragStart = (id) => () => setDragId(id)

  const handleDragOverItem = (overId) => (e) => {
    e.preventDefault()
    if (dragId == null || dragId === overId) return
    setOrder((prev) => {
      const from = prev.findIndex((p) => p.id === dragId)
      const to   = prev.findIndex((p) => p.id === overId)
      if (from < 0 || to < 0 || from === to) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  // Rolagem automática: com uma foto "na mão" perto da borda
  // superior/inferior da lista, rola na direção correspondente
  const handleListDragOver = (e) => {
    e.preventDefault()
    const el = listRef.current
    if (!el) return
    const rect   = el.getBoundingClientRect()
    const margin = 80
    if (e.clientY < rect.top + margin) {
      el.scrollTop -= 16
    } else if (e.clientY > rect.bottom - margin) {
      el.scrollTop += 16
    }
  }

  const dirty = order.some((p, i) => photos[i]?.id !== p.id)

  return (
    <div className="organizer-overlay" onClick={onClose}>
      <div className="organizer-box" onClick={(e) => e.stopPropagation()}>

        <header className="organizer-header">
          <div>
            <p className="organizer-title">Organização das fotos</p>
            <p className="organizer-hint">
              arraste as fotos para a posição desejada · para rolar a
              lista, segure a foto perto da borda de cima ou de baixo
            </p>
          </div>
          <button className="organizer-close" onClick={onClose} title="Fechar">
            ✕
          </button>
        </header>

        <div
          className="organizer-grid"
          ref={listRef}
          onDragOver={handleListDragOver}
        >
          {order.map((photo, i) => (
            <div
              key={photo.id}
              className={
                'organizer-item'
                + (dragId === photo.id ? ' organizer-item-dragging' : '')
              }
              draggable
              onDragStart={handleDragStart(photo.id)}
              onDragOver={handleDragOverItem(photo.id)}
              onDragEnd={() => setDragId(null)}
              onDrop={(e) => e.preventDefault()}
            >
              <span className="organizer-num">{i + 1}</span>
              <img
                src={photo.thumb_url}
                alt={photo.caption || `Foto ${i + 1}`}
                draggable={false}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <footer className="organizer-actions">
          <button className="organizer-cancel" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="organizer-save"
            onClick={() => onSave(order)}
            disabled={saving || !dirty}
          >
            {saving ? 'Salvando...' : 'Salvar ordem'}
          </button>
        </footer>

      </div>
    </div>
  )
}
