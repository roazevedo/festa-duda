import { useEffect, useState } from 'react'
import './IdleWarningModal.css'

export default function IdleWarningModal({ secondsLeft, onContinue, onLogout }) {
  const [remaining, setRemaining] = useState(secondsLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="idle-modal-overlay">
      <div className="idle-modal">
        <p className="idle-modal-eyebrow">sessão inativa</p>
        <h2 className="idle-modal-title">Você ainda está aí?</h2>
        <p className="idle-modal-text">
          Por segurança, sua sessão será encerrada em <strong>{remaining}s</strong> por inatividade.
        </p>
        <div className="idle-modal-actions">
          <button className="idle-modal-btn-primary" onClick={onContinue}>
            Continuar conectado
          </button>
          <button className="idle-modal-btn-secondary" onClick={onLogout}>
            Sair agora
          </button>
        </div>
      </div>
    </div>
  )
}
