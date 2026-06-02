import AtoHeader from './AtoHeader'
import './Convite.css'

export default function Convite() {
  return (
    <section className="section">
      <AtoHeader
        number="I"
        title="O Convite"
        subtitle="guarde esta data com carinho"
      />

      <div className="convite-wrapper">
        {/* Lado esquerdo — card escuro estilo ingresso */}
        <div className="convite-ticket">
          <div className="ticket-top">
            <div className="ticket-lines">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="ticket-line" />
              ))}
            </div>
          </div>
          <div className="ticket-center">
            <p className="ticket-label">MARIA EDUARDA</p>
            <p className="ticket-xv">XV</p>
            <p className="ticket-date">29 · VIII · MMXXVI</p>
          </div>
          <div className="ticket-bottom">
            <p className="ticket-detail">SÁBADO · 20H00</p>
          </div>
        </div>

        {/* Lado direito — informações */}
        <div className="convite-info">
          <p className="convite-from">
            Renata & Carlos Mendonça<br />
            <span>têm a imensa alegria de convidar</span>
          </p>

          <h2 className="convite-name">Maria<br />Eduarda</h2>

          <div className="convite-details">
            <div className="convite-detail-row">
              <span className="detail-label">data</span>
              <span className="detail-value">sábado, 29 de agosto de 2026</span>
            </div>
            <div className="convite-detail-row">
              <span className="detail-label">hora</span>
              <span className="detail-value">20h00</span>
            </div>
            <div className="convite-detail-row">
              <span className="detail-label">traje</span>
              <span className="detail-value">Preto, Dourado ou Branco</span>
            </div>
            <div className="convite-detail-row">
              <span className="detail-label">rsvp</span>
              <span className="detail-value">mariaeduarda15anos.com.br</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
