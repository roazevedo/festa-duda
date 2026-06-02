import AtoHeader from './AtoHeader'
import './Traje.css'

const COLORS = [
  { name: 'Preto',   hex: '#0e0a08', textDark: false },
  { name: 'Dourado', hex: '#c9a84c', textDark: true  },
  { name: 'Vermelho',hex: '#8b1a1a', textDark: false },
  { name: 'Marfim',  hex: '#faf6ee', textDark: true  },
]

export default function Traje() {
  return (
    <section className="section">
      <AtoHeader
        number="VI"
        title="O Traje"
        subtitle="vista-se para uma noite inesquecivel"
      />

      <div className="traje-wrapper">

        <div className="traje-paleta">
          {COLORS.map((color) => (
            <div key={color.name} className="traje-color-item">
              <div
                className="traje-swatch"
                style={{ background: color.hex }}
              >
                <span
                  className="traje-swatch-label"
                  style={{ color: color.textDark ? '#1a1200' : '#f0e6cc' }}
                >
                  {color.name.toUpperCase()}
                </span>
              </div>
              <p className="traje-color-name">{color.name}</p>
            </div>
          ))}
        </div>

        <div className="traje-info">
          <p className="traje-text">
            Para esta noite especial, pedimos que os convidados
            usem trajes nas cores da celebracao:
          </p>
          <ul className="traje-list">
            <li><span className="traje-dot" style={{ background: '#0e0a08', border: '1px solid #444' }} /> Preto — elegancia atemporal</li>
            <li><span className="traje-dot" style={{ background: '#c9a84c' }} /> Dourado — brilho e glamour</li>
            <li><span className="traje-dot" style={{ background: '#8b1a1a' }} /> Vermelho — paixao e sofisticacao</li>
            <li><span className="traje-dot" style={{ background: '#faf6ee', border: '1px solid #ccc' }} /> Marfim — leveza e delicadeza</li>
          </ul>
          <p className="traje-note">
            Traje: Esporte Fino / Festa
          </p>
        </div>

      </div>
    </section>
  )
}
