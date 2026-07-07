import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Convite.css'

const CAPTION_RETRATO = 'retrato_principal'
const CAPTION_ARTE    = 'arte_convite'

export default function Convite() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true
  const fileRef         = useRef(null)
  const arteRef         = useRef(null)

  const [photo, setPhoto]                 = useState(null)
  const [arte, setArte]                   = useState(null)
  const [uploading, setUploading]         = useState(false)
  const [uploadingArte, setUploadingArte] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'convite')
        setPhoto(data.find((p) => p.caption === CAPTION_RETRATO) || null)
        setArte(data.find((p) => p.caption === CAPTION_ARTE) || null)
      } catch (err) {
        console.error('Erro ao carregar fotos do convite:', err)
      }
    }
    load()
  }, [slug, token])

  const handleUpload = async (file, caption, setState, setBusy) => {
    setBusy(true)
    try {
      const cloudData = await uploadToCloudinary(file, 'festa-duda/convite')
      const created = await createPhoto(slug, token, {
        ...cloudData,
        caption,
        category: 'convite',
      })
      setState(created)
    } catch (err) {
      console.error('Erro no upload:', err)
      alert(err.message || 'Erro ao enviar foto.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (target, setState, confirmText) => {
    if (!target) return
    if (!window.confirm(confirmText)) return
    try {
      await deletePhoto(slug, token, target.id)
      setState(null)
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
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(photo, setPhoto, 'Remover o retrato principal?')
                }}
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
              if (file) handleUpload(file, CAPTION_RETRATO, setPhoto, setUploading)
              e.target.value = ''
            }}
          />

        </div>

        {/* Lado direito — arte do convite */}
        <div
          className={'convite-arte' + (isAdmin ? ' convite-arte-admin' : '')}
          onClick={() => isAdmin && !arte && !uploadingArte && arteRef.current?.click()}
        >
          {arte ? (
            <img
              src={arte.url}
              alt="Convite"
              className="convite-arte-img"
            />
          ) : uploadingArte ? (
            <div className="ticket-uploading">
              <div className="ticket-spinner" />
              <p className="ticket-uploading-text">Enviando...</p>
            </div>
          ) : (
            <p className="convite-arte-placeholder">convite · em breve</p>
          )}

          {/* Overlay de hover — admin sem arte */}
          {isAdmin && !arte && !uploadingArte && (
            <div className="ticket-overlay">
              <span className="ticket-overlay-plus">+</span>
            </div>
          )}

          {/* Botão remover — admin com arte */}
          {isAdmin && arte && (
            <button
              className="ticket-remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(arte, setArte, 'Remover a arte do convite?')
              }}
              title="Remover convite"
            >
              ✕
            </button>
          )}

          <input
            ref={arteRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file, CAPTION_ARTE, setArte, setUploadingArte)
              e.target.value = ''
            }}
          />
        </div>

      </div>
    </section>
  )
}
