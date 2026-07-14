import { useState, useEffect, useRef } from 'react'
import SectionHeading from './SectionHeading'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { useEvent } from '../contexts/useEvent'
import { getPhotos, createPhoto, deletePhoto, updateEvent } from '../services/api'
import { uploadToCloudinary } from '../services/cloudinary'
import { useConfirm } from './useConfirm'
import Lightbox from './Lightbox'
import InviteCreator from './InviteCreator'
import './Convite.css'

const CAPTION_ARTE = 'arte_convite'

export default function Convite() {
  const { slug, token, event, setEvent } = useEvent()
  const isAdmin         = useEventAdmin()
  const arteRef         = useRef(null)

  const [arte, setArte]           = useState(null)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [creating, setCreating]   = useState(false)
  const [confirm, confirmModal]   = useConfirm()

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
    if (!(await confirm('Remover a arte do convite?'))) return
    try {
      await deletePhoto(slug, token, arte.id)
      setArte(null)
    } catch (err) {
      console.error('Erro ao remover foto:', err)
    }
  }

  // Publica a arte gerada pelo criador de convite: sobe o PNG,
  // substitui a arte atual e guarda a configuração para reabrir
  const publishInvite = async (blob, inviteCfg) => {
    const file = new File([blob], `convite-${slug}.png`, { type: 'image/png' })
    const cloudData = await uploadToCloudinary(file, 'festa-duda/convite')
    if (arte) await deletePhoto(slug, token, arte.id)
    const created = await createPhoto(slug, token, {
      ...cloudData,
      caption:  CAPTION_ARTE,
      category: 'convite',
    })
    setArte(created)
    const updated = await updateEvent(slug, token, {
      settings: { ...event.settings, invite: inviteCfg },
    })
    setEvent(updated)
  }

  return (
    <section className="section">
      <SectionHeading
        id="convite"
        atoNumber="I"
        atoTitle="O Convite"
        atoSubtitle="a casa abre suas portas para a senhorita e quem lhe acompanha"
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
              onClick={(e) => { e.stopPropagation(); setExpanded(true) }}
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

        {/* Criador de convite — além do upload, para quem não tem arte */}
        {isAdmin && (
          <div className="convite-admin-actions">
            <button
              className="convite-create-btn"
              onClick={() => setCreating(true)}
            >
              ✨ Criar convite
            </button>
            <p className="convite-admin-hint">
              monte a arte com foto, textos, cores e QR code do site —
              ou clique no quadro para enviar um convite pronto
            </p>
          </div>
        )}
      </div>

      {expanded && arte && (
        <Lightbox photo={arte} onClose={() => setExpanded(false)} />
      )}

      {creating && (
        <InviteCreator
          onPublish={publishInvite}
          onClose={() => setCreating(false)}
        />
      )}

      {confirmModal}
    </section>
  )
}
