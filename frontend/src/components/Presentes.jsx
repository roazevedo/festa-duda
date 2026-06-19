import { useState } from 'react'
import AtoHeader from './AtoHeader'
import './Presentes.css'

const GIFTS = [
  { id: 1,  name: 'Maquiagem profissional', desc: 'Make completa para a noite de gala',       value: 250, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 2,  name: 'Manicure & pedicure',    desc: 'Cuidados finais antes do grande dia',      value: 150, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 3,  name: 'Coroa de princesa',      desc: 'A peça central do ritual dos quinze',      value: 400, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 4,  name: 'Bouquet de rosas',       desc: 'Arranjo do cerimonial das quinze velas',   value: 180, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 5,  name: 'Sapato de salto',        desc: 'O par perfeito para o primeiro baile',     value: 350, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 6,  name: 'Decoração da mesa',      desc: 'Velas, flores e detalhes dourados',        value: 300, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 7,  name: 'Hospedagem dos avós',    desc: 'Para que toda a família esteja por perto', value: 500, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 8,  name: 'Hora extra fotógrafo',   desc: 'Cada momento eternizado',                  value: 280, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 9,  name: 'Joia personalizada',     desc: 'Pingente com as iniciais ME',              value: 600, pix: 'pix@mariaeduarda15.com', mp: '#' },
  { id: 10, name: 'Diária na viagem',       desc: 'Contribuição para a viagem de presente',   value: 220, pix: 'pix@mariaeduarda15.com', mp: '#' },
]

function PixModal({ gift, onClose }) {
  return (
    <div className="pix-overlay" onClick={onClose}>
      <div className="pix-modal" onClick={e => e.stopPropagation()}>
        <p className="pix-modal-label">Chave Pix</p>
        <div className="pix-key">{gift.pix}</div>
        <p className="pix-modal-info">
          Valor sugerido: <strong>R$ {gift.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          <br />Informe seu nome na mensagem.
        </p>
        <button className="pix-close" onClick={onClose}>fechar</button>
      </div>
    </div>
  )
}

export default function Presentes() {
  const [pixGift, setPixGift] = useState(null)
  const comingSoon = true // ← muda para false quando o pagamento estiver pronto

  return (
    <section className="section">
      <AtoHeader
        number="IV"
        title="Os Presentes"
        subtitle="contribuições em dinheiro · pix ou cartão · escolha o que tocar seu coração"
      />

      <div className={'gifts-wrapper' + (comingSoon ? ' gifts-wrapper-disabled' : '')}>
        {comingSoon && (
          <div className="coming-soon-banner">
            <span>Em breve</span>
          </div>
        )}

        <div className="gifts-table">
          {GIFTS.map((gift, i) => (
            <div key={gift.id} className={'gift-row' + (i % 2 === 0 ? '' : ' gift-row-right')}>
              <div className="gift-info">
                <div className="gift-top">
                  <span className="gift-num">{String(gift.id).padStart(2, '0')}</span>
                  <span className="gift-name">{gift.name.toUpperCase()}</span>
                </div>
                <p className="gift-desc">{gift.desc}</p>
                <p className="gift-value">
                  R$ {gift.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="gift-btns">
                <button className="gift-btn" onClick={() => setPixGift(gift)}>
                  PIX
                </button>
                <a href={gift.mp} target="_blank" rel="noopener noreferrer" className="gift-btn">
                  CARTÃO
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pixGift && (
        <PixModal gift={pixGift} onClose={() => setPixGift(null)} />
      )}
    </section>
  )
}
