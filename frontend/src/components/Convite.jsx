import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Convite.css'

const CAPTION_ARTE = 'arte_convite'

export default function Convite() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true
  const arteRef         = useRef(null)

  const [arte, setArte]           = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'convite')
        setArte(data.find((p) => p.caption === CAPTION_ARTE) || null)
      } catch (err) {
        console.error('Erro ao carregar arte do convite:', err)
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
        caption:  CAPTION_ARTE,
        category: 'convite',
      })
      setArte(created)
    } catch (err) {
      console.error('Erro no upload:', err)
      alert(err.message || 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!arte) return
    if (!window.confirm('Remover a arte do convite?')) return
    try {
      await deletePhoto(slug, token, arte.id)
      setArte(null)
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
        <div
          className={'convite-arte' + (isAdmin ? ' convite-arte-admin' : '')}
          onClick={() => isAdmin && !arte && !uploading && arteRef.current?.click()}
        >
          {arte ? (
            <img
              src={arte.url}
              alt="Convite"
              className="convite-arte-img"
            />
          ) : uploading ? (
            <div className="ticket-uploading">
              <div className="ticket-spinner" />
              <p className="ticket-uploading-text">Enviando...</p>
            </div>
          ) : (
            <p className="convite-arte-placeholder">convite · em breve</p>
          )}

          {/* Overlay de hover — admin sem arte */}
          {isAdmin && !arte && !uploading && (
            <div className="ticket-overlay">
              <span className="ticket-overlay-plus">+</span>
            </div>
          )}

          {/* Botão remover — admin com arte */}
          {isAdmin && arte && (
            <button
              className="ticket-remove-btn"
              onClick={(e) => { e.stopPropagation(); handleDelete() }}
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
              if (file) handleUpload(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>
    </section>
  )
}
