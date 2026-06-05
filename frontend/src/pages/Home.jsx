import AdminBar from '../components/AdminBar'
import { useAuth } from '../contexts/useAuth'
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
  const { user } = useAuth()

  return (
    <>
      <AdminBar />

      <main style={{ paddingTop: user ? '40px' : '0' }}>

        <Hero />

        <div className="section-divider" />
        <Convite />

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
            <svg className="footer-fan" viewBox="0 0 80 52" fill="none">
              {[...Array(11)].map((_, i) => {
                const a = (i / 10) * Math.PI
                return (
                  <line key={i}
                    x1="40" y1="52"
                    x2={40 + 38 * Math.cos(a)}
                    y2={52 - 38 * Math.sin(a)}
                    stroke="#c9a84c"
                    strokeWidth={i === 5 ? 1.5 : 0.9}
                    opacity="0.8"
                  />
                )
              })}
              <path d="M 2 52 A 38 38 0 0 1 78 52" stroke="#c9a84c" strokeWidth="1.2" />
              <path d="M 10 52 A 30 30 0 0 1 70 52" stroke="#c9a84c" strokeWidth="0.7" opacity="0.5" />
            </svg>

            <p className="footer-act">FIM DO ATO — VIII</p>
            <p className="footer-bis">Bis · 29 · 08 · 2026</p>
            <p className="footer-sub">até as cortinas se abrirem.</p>
          </div>
        </footer>

      </main>
    </>
  )
}
