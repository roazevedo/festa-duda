import { useEffect } from 'react'
import { PLAN_CARDS, ATELIE_CONTACT } from '../plans'
import './PlanPickerModal.css'

// Modal de escolha de plano — aberto ao criar um novo evento no painel.
// Cada evento é cobrado por plano, então a escolha vem antes da criação.
// grátis/completo → seguem para a criação (onChoose); ateliê → contato.
export default function PlanPickerModal({ onClose, onChoose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="planpick-overlay" onClick={onClose}>
      <div
        className="planpick"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="planpick-close" onClick={onClose} aria-label="Fechar">✕</button>

        <div className="planpick-head">
          <p className="planpick-eyebrow">Novo evento</p>
          <h2 className="planpick-title">Escolha o plano do seu evento</h2>
          <p className="planpick-sub">cada página de evento tem o seu próprio plano</p>
        </div>

        <div className="planpick-cards">
          {PLAN_CARDS.map((p) => (
            <div
              key={p.id}
              className={'planpick-card' + (p.highlight ? ' planpick-card-pop' : '')}
            >
              {p.highlight && <span className="planpick-badge">Mais popular</span>}

              <p className="planpick-name">{p.name}</p>
              <p className="planpick-price">
                {p.price} <span>{p.period}</span>
              </p>
              <p className="planpick-tagline">{p.tagline}</p>

              <ul className="planpick-bullets">
                {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>

              {p.id === 'atelie' ? (
                <a className="planpick-cta" href={ATELIE_CONTACT}>
                  {p.cta}
                </a>
              ) : (
                <button
                  className={'planpick-cta' + (p.highlight ? ' planpick-cta-pop' : '')}
                  onClick={() => onChoose(p.id)}
                >
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
