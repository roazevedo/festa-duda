import AtoHeader from './AtoHeader'
import './Salao.css'

const ADDRESS = 'Salao Elite, Rua Vitor Meireles, 485, Riachuelo, Rio de Janeiro'
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(ADDRESS)

export default function Salao() {
  return (
    <section className="section">
      <AtoHeader
        number="VIII"
        title="O Salao"
        subtitle="Elite · Rua Vitor Meireles, 485 · Riachuelo"
      />

      <div className="salao-wrapper">

        <div className="salao-map-placeholder">
          <div className="salao-map-inner">
            <div className="salao-pin">
              <div className="salao-pin-dot" />
            </div>
            <p className="salao-map-label">Salao Elite</p>
            <p className="salao-map-sub">Rua Vitor Meireles, 485 · Riachuelo</p>
          </div>
        </div>

        <div className="salao-info">
          <div className="salao-detail">
            <span className="salao-detail-label">local</span>
            <span className="salao-detail-value">Salao Elite</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">endereco</span>
            <span className="salao-detail-value">
              Rua Vitor Meireles, 485<br />
              Riachuelo · Rio de Janeiro, RJ
            </span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">data</span>
            <span className="salao-detail-value">sabado, 29 de agosto de 2026</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">hora</span>
            <span className="salao-detail-value">21 horas</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">estrutura</span>
            <span className="salao-detail-value">estacionamento proprio · valet · acessibilidade total</span>
          </div>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="salao-btn"
          >
            abrir no maps
          </a>
        </div>

      </div>
    </section>
  )
}
