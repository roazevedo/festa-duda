import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* Cortinas */}
      <div className="curtain curtain-left" />
      <div className="curtain curtain-right" />

      {/* Luzes de palco no topo */}
      <div className="stage-lights">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="light-bulb" />
        ))}
      </div>

      {/* Conteúdo central */}
      <div className="hero-content">
        <p className="hero-eyebrow">DE QUEM AMA TE</p>

        <h1 className="hero-name">
          Maria<br />Eduarda
        </h1>

        <div className="hero-xv-wrapper">
          <div className="hero-line" />
          <span className="hero-xv">XV</span>
          <div className="hero-line" />
        </div>

        <div className="hero-details">
          <p className="hero-date-text">29 de agosto de 2026</p>
          <p className="hero-location">sábado · 20h00</p>
        </div>

        <p className="hero-roman">XXIX · VIII · MMXXVI</p>
      </div>
    </section>
  )
}
