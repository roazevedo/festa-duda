import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, updatePhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Galeria.css'

export default function Galeria() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true

  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [lightbox, setLightbox]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 })
  const fileInputRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'galeria')
        setPhotos(data)
      } catch (err) {
        console.error('Erro ao carregar galeria:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, token])

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    setUploading(true)
    setUploadCount({ done: 0, total: arr.length })
    setUploadPct(0)

    for (let i = 0; i < arr.length; i++) {
      try {
        const cloudData = await uploadToCloudinary(arr[i], 'festa-duda/galeria')
        const photo = await createPhoto(slug, token, {
          ...cloudData,
          caption:  '',
          category: 'galeria',
        })
        setPhotos((prev) => [...prev, photo])
      } catch (err) {
        console.error('Erro no upload:', err)
        alert(err.message || 'Erro ao enviar foto. Verifique as configurações do Cloudinary.')
      }
      const done = i + 1
      setUploadCount({ done, total: arr.length })
      setUploadPct(Math.round((done / arr.length) * 100))
    }

    setUploading(false)
    // Limpa o input para permitir reenvio do mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (photo) => {
    if (!window.confirm('Remover esta foto da galeria?')) return
    try {
      await deletePhoto(slug, token, photo.id)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      if (lightbox?.id === photo.id) setLightbox(null)
    } catch (err) {
      console.error('Erro ao deletar foto:', err)
    }
  }

  const handleCaption = async (photo, caption) => {
    try {
      const updated = await updatePhoto(slug, token, photo.id, { caption })
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)))
    } catch (err) {
      console.error('Erro ao atualizar legenda:', err)
    }
  }

  const lightboxNav = (dir) => {
    const idx  = photos.findIndex((p) => p.id === lightbox.id)
    const next = photos[idx + dir]
    if (next) setLightbox(next)
  }

  return (
    <section className="section">
      <AtoHeader
        number="VII"
        title="A Trajetória"
        subtitle="quinze anos de história em imagens"
      />

      {/* Botão de upload — só para admin */}
      {isAdmin && (
        <div className="galeria-upload-bar">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />

          {!uploading ? (
            <button
              className="galeria-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="galeria-upload-icon">+</span>
              Adicionar Fotos à Trajetória
            </button>
          ) : (
            <div className="galeria-upload-progress">
              <div className="galeria-progress-bar">
                <div
                  className="galeria-progress-fill"
                  style={{ width: `${uploadPct}%` }}
                />
              </div>
              <p className="galeria-progress-text">
                Enviando {uploadCount.done} de {uploadCount.total} foto{uploadCount.total !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          <p className="galeria-upload-hint">
            Selecione uma ou várias fotos · JPG, PNG, WEBP
          </p>
        </div>
      )}

      {loading && <p className="galeria-empty">Carregando fotos...</p>}

      {!loading && photos.length === 0 && (
        <div className="galeria-empty">
          {isAdmin
            ? 'Nenhuma foto ainda. Use o botão acima para adicionar.'
            : 'As fotos da trajetória serão adicionadas em breve.'}
        </div>
      )}

      {photos.length > 0 && (
        <div className="galeria-grid">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={'galeria-item' + (i === 0 || i === 3 ? ' galeria-tall' : '')}
            >
              <img
                src={photo.thumb_url}
                alt={photo.caption || 'Foto da trajetória'}
                className="galeria-img"
                onClick={() => !isAdmin && setLightbox(photo)}
                loading="lazy"
              />

              {/* Overlay admin com legenda e delete */}
              {isAdmin && (
                <div className="galeria-admin-controls">
                  <input
                    className="galeria-caption-input"
                    value={photo.caption || ''}
                    onChange={(e) => handleCaption(photo, e.target.value)}
                    placeholder="Legenda (opcional)"
                  />
                  <button
                    className="galeria-delete-btn"
                    onClick={() => handleDelete(photo)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Caption para visitantes */}
              {!isAdmin && photo.caption && (
                <div
                  className="galeria-overlay"
                  onClick={() => setLightbox(photo)}
                >
                  <p className="galeria-caption">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption || 'Foto da trajetória'}
              className="lightbox-img"
            />
            {lightbox.caption && (
              <p className="lightbox-caption">{lightbox.caption}</p>
            )}
            <div className="lightbox-nav">
              <button
                className="lightbox-btn"
                onClick={() => lightboxNav(-1)}
                disabled={photos.findIndex((p) => p.id === lightbox.id) === 0}
              >
                ← anterior
              </button>
              <button className="lightbox-close" onClick={() => setLightbox(null)}>
                fechar
              </button>
              <button
                className="lightbox-btn"
                onClick={() => lightboxNav(1)}
                disabled={photos.findIndex((p) => p.id === lightbox.id) === photos.length - 1}
              >
                próxima →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
