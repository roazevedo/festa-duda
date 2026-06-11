import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Traje.css'

const SLOTS = [
  { id: 'vestido_longo',  label: 'VESTIDO LONGO',  sub: 'Referência · convidadas'   },
  { id: 'esmoquim',       label: 'ESMOQUIM',        sub: 'Referência · convidados'   },
  { id: 'midi_de_gala',   label: 'MIDI DE GALA',    sub: 'Opção alternativa'         },
  { id: 'terno_escuro',   label: 'TERNO ESCURO',    sub: 'Opção alternativa'         },
]

const COLORS = [
  { name: 'PRETO',     sub: 'Smoking · Vestido longo',  hex: '#0e0a08', textLight: true,  avoid: false },
  { name: 'DOURADO',   sub: 'Cetim · Lantejoula',        hex: '#c9a84c', textLight: false, avoid: false },
  { name: 'BORGONHA',  sub: 'reservado · evitar',        hex: '#6b0a0a', textLight: true,  avoid: true  },
  { name: 'CHAMPANHE', sub: 'Tons metálicos suaves',     hex: '#d4b896', textLight: false, avoid: false },
  { name: 'ESMERALDA', sub: 'Veludo · Cetim profundo',   hex: '#1a4a2e', textLight: true,  avoid: false },
]

function SlotUpload({ slot, photo, isAdmin, onUpload, onDelete, uploading }) {
  const fileRef = useRef(null)

  return (
    <div className="traje-ref-item">
      <div
        className={'traje-ref-img' + (isAdmin ? ' traje-ref-admin' : '')}
        onClick={() => isAdmin && !photo && fileRef.current?.click()}
      >
        {/* Foto enviada */}
        {photo && (
          <img
            src={photo.thumb_url}
            alt={slot.label}
            className="traje-ref-photo"
          />
        )}

        {/* Placeholder sem foto */}
        {!photo && (
          <>
            <div className="traje-ref-lines">
              {[...Array(12)].map((_, j) => (
                <div key={j} className="ref-line" />
              ))}
            </div>
            <p className="traje-ref-label">{slot.label}</p>
            <p className="traje-ref-sub">{slot.sub}</p>
          </>
        )}

        {/* Overlay admin */}
        {isAdmin && (
          <div className="traje-ref-overlay">
            {uploading === slot.id ? (
              <p className="traje-ref-overlay-text">Enviando...</p>
            ) : photo ? (
              <button
                className="traje-ref-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(photo) }}
              >
                ✕ remover
              </button>
            ) : (
              <p className="traje-ref-overlay-text">+ adicionar foto</p>
            )}
          </div>
        )}

        {/* Caption se tiver foto */}
        {photo && !isAdmin && (
          <div className="traje-ref-caption-bar">
            <p className="traje-ref-label">{slot.label}</p>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(slot.id, file)
          }}
        />
      </div>
    </div>
  )
}

export default function Traje() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true

  const [photos, setPhotos]     = useState([])
  const [uploading, setUploading] = useState(null) // slot id sendo enviado

  // Carrega fotos da categoria 'traje'
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

  const handleUpload = async (slotId, file) => {
    setUploading(slotId)
    try {
      // 1. Envia para Cloudinary
      const cloudData = await uploadToCloudinary(file, 'festa-duda/traje')

      // 2. Salva no banco com categoria 'traje' e caption = slotId
      const photo = await createPhoto(slug, token, {
        ...cloudData,
        caption:  slotId,
        category: 'traje',
      })

      setPhotos((prev) => [...prev.filter(p => p.caption !== slotId), photo])
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Erro ao enviar foto. Verifique as configurações do Cloudinary.')
    } finally {
      setUploading(null)
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

  // Encontra a foto de cada slot pelo caption
  const photoForSlot = (slotId) => photos.find(p => p.caption === slotId) || null

  return (
    <section className="section">
      <AtoHeader
        number="VI"
        title="O Traje"
        subtitle="social completo · uma releitura dos anos 20"
      />

      {/* Topo: card + aviso */}
      <div className="traje-top">
        <div className="traje-card">
          <p className="traje-card-eyebrow">TRAJE</p>
          <h3 className="traje-card-title">Social Completo</h3>
          <p className="traje-card-text">
            Nossa celebração será inspirada na elegância e no glamour
            dos anos 20, em uma releitura moderna e sofisticada.
          </p>
          <p className="traje-card-text" style={{ marginTop: 10 }}>
            <em>Não é necessário utilizar trajes temáticos ou fantasias.</em>
          </p>
        </div>

        <div className="traje-warning">
          <svg className="traje-fan" viewBox="0 0 60 40" fill="none">
            <g stroke="#c9a84c" strokeWidth="1">
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

          <p className="traje-warning-text">
            Para valorizar a debutante em seu momento especial, pedimos
            gentilmente que as convidadas{' '}
            <strong style={{ color: '#e8c84a', fontStyle: 'italic', fontWeight: 400 }}>
              evitem trajes em tons de vermelho, vinho e marsala.
            </strong>
          </p>

          <div className="traje-rule" />

          <p className="traje-ref-note">
            As imagens abaixo servem como referência do nível de formalidade
            esperado para a ocasião.
          </p>

          {isAdmin && (
            <p className="traje-admin-hint">
              ⚙ Clique em cada imagem para adicionar uma foto de referência.
            </p>
          )}
        </div>
      </div>

      {/* Grade de referências com upload */}
      <div className="traje-refs">
        {SLOTS.map((slot) => (
          <SlotUpload
            key={slot.id}
            slot={slot}
            photo={photoForSlot(slot.id)}
            isAdmin={isAdmin}
            onUpload={handleUpload}
            onDelete={handleDelete}
            uploading={uploading}
          />
        ))}
      </div>

      {/* Paleta de cores */}
      <p className="traje-palette-title">CORES SUGERIDAS ·</p>
      <div className="traje-palette">
        {COLORS.map((c) => (
          <div key={c.name} className="traje-color">
            <div
              className={'traje-swatch' + (c.avoid ? ' traje-swatch-avoid' : '')}
              style={{ background: c.hex }}
            >
              {c.avoid && (
                <svg viewBox="0 0 100 100" className="traje-avoid-line">
                  <line x1="10" y1="10" x2="90" y2="90"
                    stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
                </svg>
              )}
              <span
                className="traje-swatch-name"
                style={{ color: c.textLight ? 'rgba(240,230,200,0.7)' : 'rgba(20,10,0,0.7)' }}
              >
                {c.name}
              </span>
            </div>
            <p className={'traje-color-sub' + (c.avoid ? ' traje-avoid-text' : '')}>
              {c.sub}
            </p>
          </div>
        ))}
      </div>

      <p className="traje-footer-note">
        o branco é reservado à aniversariante · vermelho, vinho e marsala, à debutante.
      </p>
    </section>
  )
}
