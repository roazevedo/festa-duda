import { useState } from 'react'
import { useEventAdmin } from '../contexts/useEventAdmin'
import { useEvent } from '../contexts/useEvent'
import { updateEvent } from '../services/api'
import { useConfirm } from './useConfirm'
import './SaveTheDate.css'

// ── Extrai o ID do vídeo de qualquer formato de URL do YouTube ──
// Cobre os formatos mais comuns:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/\s]+)/
  )
  return match?.[1] || null
}

export default function SaveTheDate() {
  const { slug, token, event, setEvent } = useEvent()
  const isAdmin           = useEventAdmin()

  // ID do vídeo salvo no settings do evento
  const savedId = event?.settings?.youtube_save_the_date || null

  const [editing, setEditing]   = useState(false)   // mostra/esconde o campo de input
  const [input, setInput]       = useState('')       // valor digitado pelo admin
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [confirm, confirmModal] = useConfirm()

  // Não renderiza nada para convidados se não houver vídeo configurado
  if (!savedId && !isAdmin) return null

  const handleSave = async () => {
    setError('')
    const id = extractYouTubeId(input.trim())

    if (!id) {
      setError('Link inválido. Cole a URL completa do YouTube.')
      return
    }

    setSaving(true)
    try {
      // PATCH /api/v1/events/:slug/:token
      // Mescla o novo campo ao settings existente para não perder outros dados
      const updatedEvent = await updateEvent(slug, token, {
        settings: {
          ...event.settings,
          youtube_save_the_date: id,
        }
      })
      // Atualiza o contexto do evento para refletir imediatamente na página
      setEvent(updatedEvent)
      setEditing(false)
      setInput('')
    } catch (err) {
      console.error('Erro ao salvar o vídeo:', err)
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!(await confirm('Remover o vídeo do Save the Date?'))) return
    setSaving(true)
    try {
      const restSettings = { ...event.settings }
      delete restSettings.youtube_save_the_date

      const updatedEvent = await updateEvent(slug, token, {
        settings: restSettings
      })
      setEvent(updatedEvent)
    } catch (err) {
      console.error('Erro ao remover:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="std-section">
      <p className="std-eyebrow">guarde a data</p>
      <h2 className="std-title">Save the Date</h2>

      {/* ── Vídeo do YouTube ── */}
      {savedId ? (
        <div className="std-video-wrapper">
          <iframe
            className="std-iframe"
            src={`https://www.youtube.com/embed/${savedId}`}
            title="Save the Date"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          {/* Botão de remover — só admin */}
          {isAdmin && (
            <button
              className="std-remove-btn"
              onClick={handleRemove}
              disabled={saving}
              title="Remover vídeo"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        /* Placeholder — só aparece para admin quando não há vídeo */
        isAdmin && !editing && (
          <div className="std-frame">
            <button
              className="std-add-btn"
              onClick={() => setEditing(true)}
            >
              <span className="std-add-icon">+</span>
              <span className="std-add-label">Adicionar vídeo do YouTube</span>
            </button>
          </div>
        )
      )}

      {/* ── Campo de input para colar o link ── */}
      {isAdmin && editing && (
        <div className="std-input-wrapper">
          <p className="std-input-label">Cole o link do YouTube:</p>
          <input
            className="std-input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            autoFocus
          />
          {error && <p className="std-error">{error}</p>}
          <div className="std-input-actions">
            <button
              className="std-save-btn"
              onClick={handleSave}
              disabled={saving || !input.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              className="std-cancel-btn"
              onClick={() => { setEditing(false); setInput(''); setError('') }}
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botão para trocar o vídeo — aparece quando já há um vídeo salvo */}
      {isAdmin && savedId && !editing && (
        <button
          className="std-change-btn"
          onClick={() => setEditing(true)}
        >
          ⚙ Trocar vídeo
        </button>
      )}

      {confirmModal}
    </section>
  )
}
