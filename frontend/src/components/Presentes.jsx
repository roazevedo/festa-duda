import { useState } from 'react'
import AtoHeader from './AtoHeader'
import './Presentes.css'

const GIFTS = [
  { id: 1, name: 'Jantar Especial',   desc: 'Uma noite inesquecível',       value: 250, mpLink: '#' },
  { id: 2, name: 'Spa & Beleza',      desc: 'Dia de cuidado e relaxamento', value: 160, mpLink: '#' },
  { id: 3, name: 'Curso / Workshop',  desc: 'Investindo no futuro',         value: 180, mpLink: '#' },
  { id: 4, name: 'Viagem dos Sonhos', desc: 'Contribua para a aventura',    value: 500, mpLink: '#' },
  { id: 5, name: 'Joia Especial',     desc: 'Uma lembrança eterna',         value: 350, mpLink: '#' },
  { id: 6, name: 'Experiência Única', desc: 'Surpresa a combinar',          value: 200, mpLink: '#' },
  { id: 7, name: 'Acessório de Moda', desc: 'Para compor o look perfeito',  value: 180, mpLink: '#' },
  { id: 8, name: 'Presente Livre',    desc: 'Qualquer valor é bem-vindo',   value: 100, mpLink: '#' },
]

const PIX_KEY = 'pix@mariaeduarda15.com'

function GiftModal({ gift, onClose }) {
  const [tab, setTab] = useState('mp')

  const formattedValue = gift.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
  })

  return (
    <div className="gift-modal-overlay" onClick={onClose}>
      <div className="gift-modal" onClick={(e) => e.stopPropagation()}>

        <h3 className="modal-title">{gift.name}</h3>
        <p className="modal-value">R$ {formattedValue}</p>

        <div className="modal-tabs">
          <button
            className={'modal-tab' + (tab === 'mp' ? ' active' : '')}
            onClick={() => setTab('mp')}
          >
            Cartao / Pix
          </button>
          <button
            className={'modal-tab' + (tab === 'pix' ? ' active' : '')}
            onClick={() => setTab('pix')}
          >
            Pix direto
          </button>
        </div>

        {tab === 'mp' && (
          <div className="modal-content">
            <p className="modal-text">
              Pague com cartao de credito, debito ou Pix com seguranca pelo Mercado Pago.
            </p>
            <a
              href={gift.mpLink}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-btn-primary"
            >
              Pagar R$ {formattedValue}
            </a>
            <p className="modal-secure">pagamento seguro via mercado pago</p>
          </div>
        )}

        {tab === 'pix' && (
          <div className="modal-content">
            <p className="modal-text">Chave Pix:</p>
            <div className="pix-key">{PIX_KEY}</div>
            <p className="modal-text">
              Valor sugerido: R$ {formattedValue}.
              Informe seu nome na mensagem do Pix.
            </p>
          </div>
        )}

        <button className="modal-close" onClick={onClose}>
          fechar
        </button>

      </div>
    </div>
  )
}

export default function Presentes() {
  const [selected, setSelected] = useState(null)

  return (
    <section className="section">
      <AtoHeader
        number="IV"
        title="Os Presentes"
        subtitle="cada gesto de carinho transforma esta noite"
      />

      <div className="gifts-grid">
        {GIFTS.map((gift) => (
          <div
            key={gift.id}
            className="gift-card"
            onClick={() => setSelected(gift)}
          >
            <div className="gift-card-inner">
              <p className="gift-name">{gift.name}</p>
              <p className="gift-desc">{gift.desc}</p>
              <p className="gift-value">
                R$ {gift.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="gift-action">
              <span>presentear</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <GiftModal
          gift={selected}
          onClose={() => setSelected(null)}
        />
      )}

    </section>
  )
}
