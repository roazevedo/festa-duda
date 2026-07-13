import { useRef, useState } from 'react'
import { useEvent } from '../contexts/useEvent'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { updateEvent } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { useConfirm } from './useConfirm'
import './HeroBanner.css'

const EVENT_TYPE_EYEBROW = {
  quinze_anos: 'Festa de 15 anos',
  casamento:   'Casamento',
  aniversario: 'Aniversário',
}

function formatEventDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const date = d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
  return `${date} · ${time}`
}

// Hero dos templates modulares: banner com foto de capa escolhida
// pelo dono do evento (event.settings.banner_url). Sem foto, usa
// um gradiente com as cores do tema.
export default function HeroBanner() {
  const { event, setEvent, slug, token } = useEvent()
  const isAdmin = useEventAdmin()
  const fileRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  const [confirm, confirmModal]   = useConfirm()

  const bannerUrl = event?.settings?.banner_url

  const saveBanner = async (url) => {
    const settings = { ...event.settings }
    if (url) settings.banner_url = url
    else delete settings.banner_url

    const updated = await updateEvent(slug, token, { settings })
    setEvent(updated)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const data = await uploadToCloudinary(file, 'festa-duda/banner')
      await saveBanner(data.url)
    } catch (err) {
      setError(err.message || 'Erro ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const removeBanner = async () => {
    if (!(await confirm('Remover a foto de capa?'))) return
    try {
      await saveBanner(null)
    } catch {
      setError('Erro ao remover a foto.')
    }
  }

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
        <p className="hero-banner-eyebrow">
          {EVENT_TYPE_EYEBROW[event?.event_type] || 'Evento'}
        </p>
        <h1 className="hero-banner-name">{event?.name}</h1>
        {event?.event_date && (
          <p className="hero-banner-date">{formatEventDate(event.event_date)}</p>
        )}
        {event?.venue_name && (
          <p className="hero-banner-venue">{event.venue_name}</p>
        )}
      </div>

      {/* Controles de capa — apenas para o dono/admin */}
      {isAdmin && (
        <div className="hero-banner-admin">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <button
            className="hero-banner-admin-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? 'Enviando...'
              : (bannerUrl ? '✎ Trocar foto de capa' : '+ Adicionar foto de capa')}
          </button>
          {bannerUrl && !uploading && (
            <button
              className="hero-banner-admin-btn hero-banner-admin-remove"
              onClick={removeBanner}
            >
              Remover
            </button>
          )}
          {error && <p className="hero-banner-error">{error}</p>}
        </div>
      )}

      {confirmModal}
    </section>
  )
}
