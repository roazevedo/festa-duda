import { useEffect } from 'react'
import './ConfirmModal.css'

// Modal de confirmação no estilo do site — substitui o window.confirm
// nativo do navegador. Uso direto:
//   <ConfirmModal message="..." onConfirm={...} onCancel={...} />
// ou via hook useConfirm() (./useConfirm.jsx).
export default function ConfirmModal({
  message,
  confirmLabel = 'Remover',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="confirm-btn-ok" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
