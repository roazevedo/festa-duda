import { useEffect } from 'react'
import './Lightbox.css'

// Modal que expande uma foto em tamanho grande — usado pela
// Galeria (Trajetória) e pelo Traje. Fecha com Esc ou clique
// fora; navega com as setas do teclado.
export default function Lightbox({
  photo,
  caption,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={caption || 'Foto ampliada'}
          className="lightbox-img"
        />
        {caption && <p className="lightbox-caption">{caption}</p>}
        <div className="lightbox-nav">
          <button
            className="lightbox-btn"
            onClick={onPrev}
            disabled={!hasPrev}
          >
            ← anterior
          </button>
          <button className="lightbox-close" onClick={onClose}>
            fechar
          </button>
          <button
            className="lightbox-btn"
            onClick={onNext}
            disabled={!hasNext}
          >
            próxima →
          </button>
        </div>
      </div>
    </div>
  )
}
