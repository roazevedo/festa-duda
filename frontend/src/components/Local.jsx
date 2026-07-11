import SectionHeading from './SectionHeading'
import { useEvent } from '../contexts/useEvent'
import { useEventAdmin } from '../contexts/useEventAdmin'
import './Local.css'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })
}

function formatTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
}

// Local da festa nos templates modulares — usa venue_name e
// venue_address do evento (editáveis no painel).
export default function Local() {
  const { event } = useEvent()
  const isAdmin = useEventAdmin()

  const hasVenue = event?.venue_name || event?.venue_address

  // Sem local definido: visitantes não veem a seção;
  // o dono vê um lembrete para preencher no painel
  if (!hasVenue && !isAdmin) return null

  const mapsUrl = event?.venue_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.venue_name || ''} ${event.venue_address}`.trim()
      )}`
    : null

  return (
    <section className="section">
      <SectionHeading
        id="local"
        atoNumber="VIII"
        atoTitle="O Salao"
        atoSubtitle=""
      />

      {!hasVenue ? (
        <p className="local-empty">
          Defina o local e o endereço da festa no painel do evento —
          esta seção só aparece para os convidados depois disso.
        </p>
      ) : (
        <div className="local-card">
          <div className="local-details">
            {event.venue_name && (
              <div className="local-detail">
                <span className="local-detail-label">local</span>
                <span className="local-detail-value">{event.venue_name}</span>
              </div>
            )}
            {event.venue_address && (
              <div className="local-detail">
                <span className="local-detail-label">endereço</span>
                <span className="local-detail-value">{event.venue_address}</span>
              </div>
            )}
            {event.event_date && (
              <>
                <div className="local-detail">
                  <span className="local-detail-label">data</span>
                  <span className="local-detail-value">
                    {formatDate(event.event_date)}
                  </span>
                </div>
                <div className="local-detail">
                  <span className="local-detail-label">hora</span>
                  <span className="local-detail-value">
                    {formatTime(event.event_date)}
                  </span>
                </div>
              </>
            )}
          </div>

          {mapsUrl && (
            <a
              className="local-btn"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver no Google Maps ↗
            </a>
          )}
        </div>
      )}
    </section>
  )
}
