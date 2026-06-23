import AtoHeader from './AtoHeader'
import './Convite.css'

export default function Convite() {
  return (
    <section className="section">
      <AtoHeader
        number="I"
        title="O Convite"
        subtitle="a casa abre suas portas para a senhorita e quem lhe acompanha"
      />

      <div className="convite-wrapper">

        {/* Lado esquerdo — ticket */}
        <div className="convite-ticket">
          <div className="ticket-top">
            <div className="ticket-lines">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="ticket-line" />
              ))}
            </div>
            <p className="ticket-portrait">retrato principal · em vestido vermelho</p>
          </div>
          <div className="ticket-center">
            <p className="ticket-label">MARIA EDUARDA</p>
            <p className="ticket-xv">XV</p>
            <p className="ticket-date">29 · 08 · 2026</p>
          </div>
          <div className="ticket-bottom">
            <p className="ticket-detail">SALÃO ELITE · 21 HORAS</p>
          </div>
        </div>

        {/* Lado direito — info */}
        <div className="convite-info">
          <p className="convite-grace">com a graça da família,</p>
          <p className="convite-parents">Lohraine &amp; Rodrigo</p>
          <p className="convite-honor">
            têm a honra de convidar v.sa. para a celebração do baile
            dos quinze anos de sua filha
          </p>

          <h2 className="convite-name">
            Maria<br />Eduarda
          </h2>

          <div className="convite-details">
            <div className="convite-row">
              <span className="convite-label">DATA</span>
              <span className="convite-value">sábado, 29 de agosto de 2026</span>
            </div>
            <div className="convite-row">
              <span className="convite-label">HORA</span>
              <span className="convite-value">21 horas</span>
            </div>
            <div className="convite-row">
              <span className="convite-label">SALÃO</span>
              <span className="convite-value">Elite</span>
            </div>
            <div className="convite-row">
              <span className="convite-label">ENDEREÇO</span>
              <span className="convite-value">
                Rua Vítor Meireles, 485<br />
                Riachuelo · Rio de Janeiro
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
