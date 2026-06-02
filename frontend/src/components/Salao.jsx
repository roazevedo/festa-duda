import AtoHeader from './AtoHeader'
import './Salao.css'

export default function Salao() {
  const address = 'Nome do Salao, Rua do Salao, 123 - Bairro, Rio de Janeiro'
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address)

  return (
    <section className="section">
      <AtoHeader
        number="VIII"
        title="O Salao"
        subtitle="onde a magia acontecera"
      />

      <div className="salao-wrapper">

        <div className="salao-map-placeholder">
          <div className="salao-map-inner">
            <div className="salao-pin">
              <div className="salao-pin-dot" />
            </div>
            <p className="salao-map-label">Mapa do local</p>
            <p className="salao-map-sub">Clique em "Como chegar" para abrir o Google Maps</p>
          </div>
        </div>

        <div className="salao-info">
          <div className="salao-detail">
            <span className="salao-detail-label">Local</span>
            <span className="salao-detail-value">Nome do Salao</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">Endereco</span>
            <span className="salao-detail-value">
              Rua do Salao, 123<br />
              Bairro — Rio de Janeiro, RJ
            </span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">Data</span>
            <span className="salao-detail-value">Sabado, 29 de agosto de 2026</span>
          </div>
          <div className="salao-detail">
            <span className="salao-detail-label">Hora</span>
            <span className="salao-detail-value">20h00</span>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="salao-btn"
          >
            Como chegar
          </a>
        </div>

      </div>
    </section>
  )
}
