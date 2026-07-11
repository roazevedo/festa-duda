import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useEvent } from '../contexts/useEvent'
import { updateEvent } from '../services/api'
import { THEMES, DEFAULT_THEME_ID, getTheme, applyTheme } from '../themes'
import './ThemePicker.css'

// Painel de escolha de tema do site do evento.
// Clicar em um tema aplica o preview ao vivo na página inteira;
// "Ativar tema" persiste em event.settings.theme.
export default function ThemePicker({ onClose }) {
  const { event, setEvent, slug, token } = useEvent()
  const savedId = event?.settings?.theme || DEFAULT_THEME_ID

  const [selected, setSelected] = useState(savedId)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)

  const preview = (id) => {
    setSelected(id)
    applyTheme(getTheme(id))
  }

  const cancel = () => {
    applyTheme(getTheme(savedId))
    onClose()
  }

  const save = async () => {
    if (selected === savedId) return onClose()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateEvent(slug, token, {
        settings: { ...event.settings, theme: selected },
      })
      setEvent(updated)
      onClose()
    } catch {
      setError('Não foi possível salvar o tema. Tente novamente.')
      setSaving(false)
    }
  }

  // Portal no <body>: evita ficar preso no stacking context de
  // ancestrais com backdrop-filter/transform (ex.: AdminBar)
  return createPortal(
    <div className="theme-picker-overlay" onClick={cancel}>
      <div className="theme-picker" onClick={(e) => e.stopPropagation()}>

        <div className="theme-picker-header">
          <h2 className="theme-picker-title">Escolha um tema</h2>
          <p className="theme-picker-sub">
            clique para ver o site com o tema · o preview é aplicado na hora
          </p>
        </div>

        <div className="theme-picker-grid">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={
                'theme-card'
                + (selected === theme.id ? ' theme-card-selected' : '')
              }
              onClick={() => preview(theme.id)}
            >
              {/* Miniatura com as cores principais do tema */}
              <span
                className="theme-card-preview"
                style={{ background: theme.vars['--bg-dark'] }}
              >
                <span
                  className="theme-card-dot"
                  style={{ background: theme.vars['--red'] }}
                />
                <span
                  className="theme-card-dot"
                  style={{ background: theme.vars['--gold'] }}
                />
                <span
                  className="theme-card-dot"
                  style={{ background: theme.vars['--btn-red'] }}
                />
                <span
                  className="theme-card-dot"
                  style={{ background: theme.vars['--cream'] }}
                />
              </span>

              <span className="theme-card-name">
                {theme.name}
                {savedId === theme.id && (
                  <span className="theme-card-active">ativo</span>
                )}
              </span>
              <span className="theme-card-desc">{theme.description}</span>
            </button>
          ))}
        </div>

        {error && <p className="theme-picker-error">{error}</p>}

        <div className="theme-picker-actions">
          <button
            className="theme-picker-cancel"
            onClick={cancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className="theme-picker-save"
            onClick={save}
            disabled={saving || selected === savedId}
          >
            {saving ? 'Salvando...' : 'Ativar tema'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}
