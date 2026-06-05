import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/useAuth'
import AtoHeader from './AtoHeader'
import './Galeria.css'

// ─────────────────────────────────────────────────────────────
//  Configure com seus dados do Cloudinary
//  1. Entre em cloudinary.com → Settings → Upload → Upload Presets
//  2. Crie um preset com "Signing Mode = Unsigned"
//  3. Cole o Cloud Name e o nome do preset abaixo
// ─────────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME    = 'SEU_CLOUD_NAME'
const CLOUDINARY_UPLOAD_PRESET = 'SEU_PRESET'

export default function Galeria() {
  const { user } = useAuth()
  const isAdmin = user?.admin === true

  const [photos, setPhotos]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('galeria_photos') || '[]') }
    catch { return [] }
  })
  const [lightbox, setLightbox] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const fileInputRef = useRef(null)

  // Salva sempre que photos mudar
  useEffect(() => {
    localStorage.setItem('galeria_photos', JSON.stringify(photos))
  }, [photos])

  // Upload para o Cloudinary via API direta
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadPct(0)

    const arr = Array.from(files)
    const uploaded = []

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', 'festa-duda')

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()
        if (data.secure_url) {
          uploaded.push({
            id:        data.public_id,
            url:       data.secure_url,
            thumb:     data.secure_url.replace('/upload/', '/upload/w_600,q_auto,f_auto/'),
            caption:   '',
            createdAt: Date.now(),
          })
        }
      } catch (err) {
        console.error('Erro no upload:', err)
      }

      setUploadPct(Math.round(((i + 1) / arr.length) * 100))
    }

    setPhotos(prev => [...prev, ...uploaded])
    setUploading(false)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Remover esta foto da galeria?')) return
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const handleCaption = (id, caption) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p))
  }

  // Navegar no lightbox
  const lightboxNav = (dir) => {
    const idx = photos.findIndex(p => p.id === lightbox.id)
    const next = photos[idx + dir]
    if (next) setLightbox(next)
  }

  return (
    <section className="section">
      <AtoHeader
        number="VII"
        title="O Ensaio"
        subtitle="cenas dos bastidores · um aperitivo do que será a noite"
      />

      {/* Badge de admin — só aparece se logado como admin */}
      {isAdmin && (
        <div className="admin-badge">
          modo admin · você está logado como administrador
        </div>
      )}

      {/* Área de upload — só aparece para admin */}
      {isAdmin && (
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading
              ? `Enviando... ${uploadPct}%`
              : '+ Adicionar Fotos'}
          </button>
          {uploading && (
            <div className="upload-progress">
              <div className="upload-bar" style={{ width: `${uploadPct}%` }} />
            </div>
          )}
          <p className="upload-hint">
            Selecione uma ou várias fotos · JPG, PNG, WEBP
          </p>
        </div>
      )}

      {/* Galeria vazia */}
      {photos.length === 0 && (
        <div className="galeria-empty">
          {isAdmin
            ? 'Nenhuma foto ainda. Use o botão acima para adicionar.'
            : 'As fotos do ensaio serão adicionadas em breve.'}
        </div>
      )}

      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div className="galeria-grid">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className={'galeria-item' + (i === 0 || i === 3 ? ' galeria-tall' : '')}
            >
              <img
                src={photo.thumb}
                alt={photo.caption || 'Foto do ensaio'}
                className="galeria-img"
                onClick={() => setLightbox(photo)}
                loading="lazy"
              />

              {/* Controles de admin */}
              {isAdmin && (
                <div className="galeria-admin-controls">
                  <input
                    className="galeria-caption-input"
                    value={photo.caption}
                    onChange={e => handleCaption(photo.id, e.target.value)}
                    placeholder="Legenda (opcional)"
                  />
                  <button
                    className="galeria-delete-btn"
                    onClick={() => handleDelete(photo.id)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Caption para visitantes */}
              {!isAdmin && photo.caption && (
                <div className="galeria-overlay" onClick={() => setLightbox(photo)}>
                  <p className="galeria-caption">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="galeria-note">
        {photos.length > 0
          ? `${photos.length} foto${photos.length !== 1 ? 's' : ''} · mais serão adicionadas após a festa`
          : 'as fotos da festa serão adicionadas após o evento'}
      </p>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.url}
              alt={lightbox.caption || 'Foto do ensaio'}
              className="lightbox-img"
            />
            {lightbox.caption && (
              <p className="lightbox-caption">{lightbox.caption}</p>
            )}
            <div className="lightbox-nav">
              <button
                className="lightbox-btn"
                onClick={() => lightboxNav(-1)}
                disabled={photos.findIndex(p => p.id === lightbox.id) === 0}
              >
                ← anterior
              </button>
              <button
                className="lightbox-close"
                onClick={() => setLightbox(null)}
              >
                fechar
              </button>
              <button
                className="lightbox-btn"
                onClick={() => lightboxNav(1)}
                disabled={photos.findIndex(p => p.id === lightbox.id) === photos.length - 1}
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
