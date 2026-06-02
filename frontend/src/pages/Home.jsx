import Hero from '../components/Hero'
import Convite from '../components/Convite'
import Countdown from '../components/Countdown'
import RSVP from '../components/RSVP'
import Presentes from '../components/Presentes'
import Palavras from '../components/Palavras'
import Traje from '../components/Traje'
import Galeria from '../components/Galeria'
import Salao from '../components/Salao'
import './Home.css'

export default function Home() {
  return (
    <main>

      <Hero />

      <div className="section-divider" />
      <Convite />

      <div className="section-divider" />
      <Countdown />

      <div className="section-divider" />
      <RSVP />

      <div className="section-divider" />
      <Presentes />

      <div className="section-divider" />
      <Palavras />

      <div className="section-divider" />
      <Traje />

      <div className="section-divider" />
      <Galeria />

      <div className="section-divider" />
      <Salao />

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-name">Maria Eduarda</p>
          <p className="footer-roman">Diz · 29 · VIII · MMXXVI</p>
        </div>
      </footer>

    </main>
  )
}
