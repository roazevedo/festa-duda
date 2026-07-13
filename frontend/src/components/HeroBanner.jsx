import { useEvent } from '../contexts/useEvent'
import { eventTypeEyebrow } from '../eventTypes'
import './HeroBanner.css'

function formatEventDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

// Hero dos templates modulares: banner com foto de capa escolhida
// pelo dono do evento (event.settings.banner_url). Sem foto, usa
// um gradiente com as cores do tema. A foto e o que aparece por
// cima são configurados no editor lateral ("Personalizar site").
export default function HeroBanner() {
  const { event } = useEvent()

  const bannerUrl = event?.settings?.banner_url

  // O que aparece no banner — configurável no editor (padrão: tudo)
  const show = event?.settings?.banner_show || {}
  const showType = show.type ?? true
  const showName = show.name ?? true
  const showDate = show.date ?? true

  return (
    <section
      className={'hero-banner' + (bannerUrl ? ' hero-banner-has-photo' : '')}
    >
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt={`Capa do evento ${event?.name || ''}`}
          className="hero-banner-img"
        />
      )}
      <div className="hero-banner-overlay" />

      <div className="hero-banner-content">
        {showType && (
          <p className="hero-banner-eyebrow">
            {eventTypeEyebrow(event?.event_type)}
          </p>
        )}
        {showName && <h1 className="hero-banner-name">{event?.name}</h1>}
        {showDate && event?.event_date && (
          <p className="hero-banner-date">{formatEventDate(event.event_date)}</p>
        )}
      </div>
    </section>
  )
}
