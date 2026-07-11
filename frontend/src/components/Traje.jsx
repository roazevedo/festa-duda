import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Traje.css'

export default function Traje() {
  const { slug, token } = useEvent()
  const isAdmin         = useEventAdmin()
  const fileRef         = useRef(null)

  const [photos, setPhotos]       = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPhotos(slug, token, 'traje')
        setPhotos(data)
      } catch (err) {
        console.error('Erro ao carregar fotos do traje:', err)
      }
    }
    load()
  }, [slug, token])

  const handleUpload = async (files) => {
    setUploading(true)
    try {
      for (const file of files) {
        const cloudData = await uploadToCloudinary(file, 'festa-duda/traje')
        const photo = await createPhoto(slug, token, {
          ...cloudData,
          caption:  'referencia',
          category: 'traje',
        })
        setPhotos((prev) => [...prev, photo])
      }
    } catch (err) {
      console.error('Erro no upload:', err)
      alert(err.message || 'Erro ao enviar foto.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo) => {
    if (!window.confirm('Remover esta foto?')) return
    try {
      await deletePhoto(slug, token, photo.id)
      setPhotos((prev) => prev.filter(p => p.id !== photo.id))
    } catch (err) {
      console.error('Erro ao remover foto:', err)
    }
  }

  return (
    <section className="section">
      <AtoHeader
        number="VI"
        title="O Traje"
        subtitle="social completo · uma releitura dos anos 20"
      />

      <div className="traje-top">
        <div className="traje-card">
          <p className="traje-card-eyebrow">TRAJE</p>
          <h3 className="traje-card-title">Social Completo</h3>
          <p className="traje-card-text">
            Uma noite inspirada na elegância dos anos 20.
          </p>
          <p className="traje-card-text" style={{ marginTop: 10 }}>
            <em>
              O traje temático não é obrigatório, mas, se desejar, você pode
              acrescentar um acessório ou detalhe inspirado na época para
              entrar no clima.
            </em>
          </p>
        </div>

        <div className="traje-warning">
          <svg className="traje-fan" viewBox="0 0 60 40" fill="none">
            <g stroke="#a8842e" strokeWidth="1">
              {[...Array(9)].map((_, i) => {
                const a = (i / 8) * Math.PI
                return (
                  <line key={i}
                    x1="30" y1="40"
                    x2={30 + 28 * Math.cos(a)}
                    y2={40 - 28 * Math.sin(a)}
                    strokeWidth={i === 4 ? 1.5 : 0.8}
                  />
                )
              })}
              <path d="M 2 40 A 28 28 0 0 1 58 40" strokeWidth="1.2" />
              <path d="M 9 40 A 21 21 0 0 1 51 40" strokeWidth="0.7" opacity="0.6" />
            </g>
          </svg>

          <p className="traje-warning-text aviso-destaque">
            Pedimos, gentilmente, que as convidadas{' '}
            <strong>
              evitem trajes em tons de vermelho (incluindo vinho e marsala).
            </strong>
          </p>

          <div className="traje-rule" />

          <p className="traje-ref-note">
            As imagens abaixo são apenas referências de traje e inspiração.
          </p>

          {isAdmin && (
            <p className="traje-admin-hint">
              ⚙ Use o card com "+" para adicionar fotos · passe o mouse sobre
              uma foto para removê-la.
            </p>
          )}
        </div>
      </div>

      {/* Galeria de referências — quantas fotos o admin quiser */}
      {(photos.length > 0 || isAdmin) && (
        <div className="traje-refs">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={'traje-ref-img' + (isAdmin ? ' traje-ref-admin' : '')}
            >
              <img
                src={photo.thumb_url}
                alt="Referência de traje"
                className="traje-ref-photo"
                loading="lazy"
              />
              {isAdmin && (
                <div className="traje-overlay">
                  <button
                    className="traje-overlay-remove"
                    onClick={() => handleDelete(photo)}
                  >
                    ✕ remover
                  </button>
                </div>
              )}
            </div>
          ))}

          {isAdmin && (
            <div
              className="traje-ref-img traje-ref-add"
              onClick={() => !uploading && fileRef.current?.click()}
            >
              {uploading ? (
                <div className="traje-uploading">
                  <div className="traje-spinner" />
                  <p className="traje-uploading-text">Enviando...</p>
                </div>
              ) : (
                <>
                  <span className="traje-add-plus">+</span>
                  <p className="traje-add-text">adicionar fotos</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = [...(e.target.files || [])]
                  if (files.length) handleUpload(files)
                  e.target.value = ''
                }}
              />
            </div>
          )}
        </div>
      )}

    </section>
  )
}
