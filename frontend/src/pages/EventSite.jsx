import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { EventProvider } from '../contexts/EventProvider'
import { useEvent } from '../contexts/useEvent'
import { useEventAdmin } from '../contexts/useEventAdmin'
import AdminBar from '../components/AdminBar'
import EditorPanel from '../components/EditorPanel'
import { useAuth } from '../contexts/useAuth'
import Hero from '../components/Hero'
import HeroBanner from '../components/HeroBanner'
import Convite from '../components/Convite'
import Countdown from '../components/Countdown'
import RSVP from '../components/RSVP'
import Presentes from '../components/Presentes'
import Palavras from '../components/Palavras'
import Traje from '../components/Traje'
import Galeria from '../components/Galeria'
import Salao from '../components/Salao'
import Local from '../components/Local'
import SaveTheDate from '../components/SaveTheDate'
import PageOrnaments from '../components/PageOrnaments'
import { getTheme, applyTheme, clearTheme } from '../themes'
import { isTeatro, sectionEnabled, sectionOrder } from '../sections'
import { isEventFinished, EVENT_LIFETIME_MONTHS } from '../eventStatus'
import './EventSite.css'

// ── Template teatro — o site original da Maria Eduarda ──
function TeatroLayout() {
  return (
    <>
      <Hero />
      <div className="section-divider" />
      <SaveTheDate />
      <div className="section-divider" />
      <Convite />
      <Countdown />
      <div className="section-divider" />
      <Galeria />
      <div className="section-divider" />
      <Palavras />
      <div className="section-divider" />
      <Presentes />
      <div className="section-divider" />
      <Traje />
      <div className="section-divider" />
      <RSVP />
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
                  stroke="#a8842e"
                  strokeWidth={i === 5 ? 1.5 : 0.9}
                  opacity="0.8"
                />
              )
            })}
            <path d="M 2 52 A 38 38 0 0 1 78 52" stroke="#a8842e" strokeWidth="1.2" />
            <path d="M 10 52 A 30 30 0 0 1 70 52" stroke="#a8842e" strokeWidth="0.7" opacity="0.5" />
          </svg>
          <p className="footer-act">FIM DO ATO — VIII</p>
          <p className="footer-bis">Bis · 29 · 08 · 2026</p>
          <p className="footer-sub">até as cortinas se abrirem.</p>
        </div>
      </footer>
    </>
  )
}

// ── Template moderno — modular, seções configuráveis no painel ──
const SECTION_COMPONENTS = {
  save_the_date: SaveTheDate,
  convite:       Convite,
  countdown:     Countdown,
  rsvp:          RSVP,
  presentes:     Presentes,
  palavras:      Palavras,
  galeria:       Galeria,
  local:         Local,
}

function ModernoLayout({ event }) {
  const sections = sectionOrder(event)
    .filter((id) => sectionEnabled(event, id) && SECTION_COMPONENTS[id])
    .map((id) => {
      const Section = SECTION_COMPONENTS[id]
      return <Section key={id} />
    })

  const footerDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : null

  return (
    <>
      <PageOrnaments />
      <HeroBanner />
      {sections.map((section, i) => (
        <div key={section.key}>
          {i > 0 && <div className="section-divider" />}
          {section}
        </div>
      ))}

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-act">{event?.name}</p>
          {footerDate && <p className="footer-bis">{footerDate}</p>}
          <p className="footer-sub">esperamos por você.</p>
        </div>
      </footer>
    </>
  )
}

function EventContent() {
  const { event, loading, error } = useEvent()
  const { user } = useAuth()
  const isAdmin = useEventAdmin()

  const [searchParams, setSearchParams] = useSearchParams()

  // null = segue a URL: ?editar=1 abre o editor para o admin
  // (link vindo do painel); abrir/fechar manual sobrepõe.
  const [editing, setEditing] = useState(null)
  const editorOpen = editing ?? (isAdmin && Boolean(searchParams.get('editar')))

  // Instante capturado na montagem (regra de pureza do render)
  const [now] = useState(() => Date.now())

  // Aplica o tema salvo no evento; ao sair da página, restaura o padrão
  useEffect(() => {
    if (!event) return
    applyTheme(getTheme(event.settings?.theme))
    return clearTheme
  }, [event])

  const closeEditor = () => {
    setEditing(false)
    if (searchParams.get('editar')) setSearchParams({}, { replace: true })
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ece3d0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.4em',
          color: '#7a6a4d',
          textTransform: 'uppercase',
        }}>
          carregando...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ece3d0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          letterSpacing: '0.4em',
          color: '#8b1a1a',
          textTransform: 'uppercase',
        }}>
          Evento não encontrado
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          color: '#7a6a4d',
          fontStyle: 'italic',
        }}>
          Verifique o link e tente novamente.
        </p>
      </div>
    )
  }

  // Evento finalizado (6 meses após a festa): página encerrada
  // para convidados; o dono ainda acessa para rever o conteúdo
  if (isEventFinished(event, now) && !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ece3d0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.4em',
          color: '#a8842e',
          textTransform: 'uppercase',
        }}>
          Evento encerrado
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '17px',
          color: '#7a6a4d',
          fontStyle: 'italic',
          maxWidth: '460px',
          lineHeight: 1.7,
        }}>
          O site de <strong>{event.name}</strong> ficou no ar por{' '}
          {EVENT_LIFETIME_MONTHS} meses após a festa e foi encerrado.
          Obrigado a todos que celebraram com a gente!
        </p>
      </div>
    )
  }

  return (
    <>
      <AdminBar />

      {/* Editor ao vivo — só para o dono/admin */}
      {isAdmin && !editorOpen && (
        <button className="editor-open-btn" onClick={() => setEditing(true)}>
          ✎ Personalizar site
        </button>
      )}
      {editorOpen && <EditorPanel onClose={closeEditor} />}

      <main
        className={editorOpen ? 'site-editing' : ''}
        style={{ paddingTop: user ? '40px' : '0' }}
      >
        {isTeatro(event) ? <TeatroLayout /> : <ModernoLayout event={event} />}
      </main>
    </>
  )
}

export default function EventSite() {
  const { slug, token } = useParams()

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => document.head.removeChild(meta)
  }, [])

  return (
    <EventProvider slug={slug} token={token}>
      <EventContent />
    </EventProvider>
  )
}
