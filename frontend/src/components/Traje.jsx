import { useState, useEffect, useRef } from 'react'
import AtoHeader from './AtoHeader'
import { useAuth } from '../contexts/useAuth'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import './Traje.css'

const SLOTS = [
  { id: 'vestido_longo', label: 'VESTIDO LONGO', sub: 'Referência · convidadas' },
  { id: 'esmoquim',      label: 'ESMOQUIM',       sub: 'Referência · convidados' },
  { id: 'midi_de_gala',  label: 'MIDI DE GALA',   sub: 'Opção alternativa'      },
  { id: 'terno_escuro',  label: 'TERNO ESCURO',   sub: 'Opção alternativa'      },
]

const COLORS = [
  { name: 'PRETO',     sub: 'Smoking · Vestido longo', hex: '#0e0a08', textLight: true,  avoid: false },
  { name: 'DOURADO',   sub: 'Cetim · Lantejoula',       hex: '#c9a84c', textLight: false, avoid: false },
  { name: 'BORGONHA',  sub: 'reservado · evitar',       hex: '#6b0a0a', textLight: true,  avoid: true  },
  { name: 'CHAMPANHE', sub: 'Tons metálicos suaves',    hex: '#d4b896', textLight: false, avoid: false },
  { name: 'ESMERALDA', sub: 'Veludo · Cetim profundo',  hex: '#1a4a2e', textLight: true,  avoid: false },
]

function RefSlot({ slot, photo, isAdmin, onUpload, onDelete, uploading }) {
  const fileRef = useRef(null)
  const isUploading = uploading === slot.id

  return (
    <div className="traje-slot">

      {/* Imagem ou placeholder */}
      <div className="traje-slot-img">
        {photo ? (
          <img
            src={photo.thumb_url}
            alt={slot.label}
            className="traje-photo"
          />
        ) : isUploading ? (
          <div className="traje-uploading">
            <div className="traje-spinner" />
            <p className="traje-uploading-text">Enviando...</p>
          </div>
        ) : (
          <div className="traje-lines">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="traje-line" />
            ))}
          </div>
        )}

        {/* Rodapé com label */}
        <div className="traje-slot-footer">
          <p className="traje-slot-label">{slot.label}</p>
        </div>

        {/* Botão de adicionar — cobre o slot inteiro, só admin, só slot vazio */}
        {isAdmin && !photo && !isUploading && (
          <button
            className="traje-add-btn"
            onClick={() => fileRef.current?.click()}
            title={`Adicionar foto: ${slot.label}`}
          >
            +
          </button>
        )}

        {/* Botão de remover — só admin, só slot com foto */}
        {isAdmin && photo && (
          <button
            className="traje-remove-btn"
            onClick={() => onDelete(photo)}
            title="Remover foto"
          >
            ✕
          </button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(slot.id, file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function Traje() {
  const { user }        = useAuth()
  const { slug, token } = useEvent()
  const isAdmin         = user?.admin === true

  const [photos, setPhotos]       = useState([])
  const [uploading, setUploading] = useState(null)

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
      const cloudData = await uploadToCloudinary(file, 'festa-duda/traje')
      const photo = await createPhoto(slug, token, {
        ...cloudData,
        caption:  slotId,
        category: 'traje',
      })
      setPhotos((prev) => [
        ...prev.filter(p => p.caption !== slotId),
        photo,
      ])
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

  const photoForSlot = (slotId) =>
    photos.find(p => p.caption === slotId) || null

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
              ⚙ Passe o mouse sobre cada imagem para adicionar uma foto.
            </p>
          )}
        </div>
      </div>

      <div className="traje-refs">
        {SLOTS.map((slot) => (
          <RefSlot
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
