import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Convite.css'

export default function Convite() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true
  const fileRef         = useRef(null)

  const [photo, setPhoto]         = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'convite')
        setPhoto(data[0] || null)
      } catch (err) {
        console.error('Erro ao carregar foto do convite:', err)
      }
    }
    load()
  }, [slug, token])

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const cloudData = await uploadToCloudinary(file, 'festa-duda/convite')
      const created = await createPhoto(slug, token, {
        ...cloudData,
        caption:  'retrato_principal',
        category: 'convite',
      })
      setPhoto(created)
    } catch (err) {
      console.error('Erro no upload:', err)
      alert(err.message || 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!photo) return
    if (!window.confirm('Remover o retrato principal?')) return
    try {
      await deletePhoto(slug, token, photo.id)
      setPhoto(null)
    } catch (err) {
      console.error('Erro ao remover foto:', err)
    }
  }

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

          {/* Retrato principal — com upload para admin */}
          <div
            className={'ticket-top' + (isAdmin ? ' ticket-top-admin' : '')}
            onClick={() => isAdmin && !photo && !uploading && fileRef.current?.click()}
          >
            {photo ? (
              /* Foto enviada */
              <img
                src={photo.thumb_url}
                alt="Retrato principal"
                className="ticket-portrait-photo"
              />
            ) : uploading ? (
              /* Estado de upload */
              <div className="ticket-uploading">
                <div className="ticket-spinner" />
                <p className="ticket-uploading-text">Enviando...</p>
              </div>
            ) : (
              /* Placeholder */
              <>
                <div className="ticket-lines">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="ticket-line" />
                  ))}
                </div>
                <p className="ticket-portrait">retrato principal · em vestido vermelho</p>
              </>
            )}

            {/* Overlay de hover — admin sem foto */}
            {isAdmin && !photo && !uploading && (
              <div className="ticket-overlay">
                <span className="ticket-overlay-plus">+</span>
              </div>
            )}

            {/* Botão remover — admin com foto */}
            {isAdmin && photo && (
              <button
                className="ticket-remove-btn"
                onClick={(e) => { e.stopPropagation(); handleDelete() }}
                title="Remover foto"
              >
                ✕
              </button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              e.target.value = ''
            }}
          />

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
