import { useState, useRef, useEffect } from 'react'
import { useEvent } from '../contexts/useEvent'
import { uploadToCloudinary } from '../services/cloudinary'
import { getTheme } from '../themes'
import { eventTypeEyebrow } from '../eventTypes'
import '@fontsource/great-vibes'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import './InviteCreator.css'

// ════════════════════════════════════════════════════════════
// CRIADOR DE CONVITE — monta a arte do convite ao vivo:
// foto, textos, cores, fonte, moldura e QR code do site.
// Exporta como PNG e pode publicar direto na seção Convite.
// A configuração fica em event.settings.invite para reabrir.
// ════════════════════════════════════════════════════════════

const FONTS = {
  elegante: {
    label: 'Elegante',
    name: "'Great Vibes', cursive",
    body: "'Montserrat', sans-serif",
    nameSize: 92,
  },
  classico: {
    label: 'Clássico',
    name: "'Cormorant Garamond', serif",
    body: "'Cormorant Garamond', serif",
    nameSize: 68,
  },
  moderno: {
    label: 'Moderno',
    name: "'Montserrat', sans-serif",
    body: "'Inter', sans-serif",
    nameSize: 56,
  },
}

const FRAMES = [
  { id: 'nenhuma', label: 'Sem moldura' },
  { id: 'fina',    label: 'Fina' },
  { id: 'dupla',   label: 'Dupla' },
]

function defaultInvite(event) {
  const theme = getTheme(event?.settings?.theme)
  const d = event?.event_date ? new Date(event.event_date) : null
  const dateLine = d
    ? `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : ''
  return {
    eyebrow:   eventTypeEyebrow(event?.event_type),
    name:      event?.name || '',
    message:   'Temos a honra de convidar você para celebrar conosco',
    dateLine,
    venueLine: [event?.venue_name, event?.venue_address].filter(Boolean).join(' · '),
    bg:        theme.vars['--bg-card'],
    text:      theme.vars['--cream'],
    accent:    theme.vars['--gold'],
    font:      'elegante',
    frame:     'fina',
    photo_url: null,
    qr:        true,
  }
}

export default function InviteCreator({ onPublish, onClose }) {
  const { event, slug, token } = useEvent()

  const [cfg, setCfg] = useState(() => ({
    ...defaultInvite(event),
    ...(event?.settings?.invite || {}),
  }))
  const [qrDataUrl, setQrDataUrl]   = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [working, setWorking]       = useState(null) // 'png' | 'publish'
  const [feedback, setFeedback]     = useState(null)

  const cardRef = useRef(null)
  const fileRef = useRef(null)

  const siteUrl = `${window.location.origin}/${slug}/${token}`
  const patch = (p) => setCfg((c) => ({ ...c, ...p }))

  const flash = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 3000)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // QR code do link do site — gerado sob demanda no navegador
  useEffect(() => {
    if (!cfg.qr) return
    let alive = true
    import('qrcode').then(({ default: QRCode }) =>
      QRCode.toDataURL(siteUrl, {
        margin: 1,
        width: 220,
        color: { dark: '#1c1610', light: '#ffffff' },
      })
    ).then((url) => alive && setQrDataUrl(url))
      .catch((err) => console.error('Erro ao gerar QR code:', err))
    return () => { alive = false }
  }, [cfg.qr, siteUrl])

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const data = await uploadToCloudinary(file, 'festa-duda/convite')
      patch({ photo_url: data.thumb_url })
    } catch (err) {
      flash(err.message || 'Erro ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  // Gera o PNG do cartão (1500×2100) desenhando em canvas —
  // ver inviteRender.js, que espelha o layout do preview
  const renderPng = async (asBlob) => {
    const { renderInvitePng } = await import('../inviteRender')
    const canvas = await renderInvitePng(cfg, font, siteUrl)
    if (asBlob) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar a imagem.'))),
          'image/png'
        )
      })
    }
    return canvas.toDataURL('image/png')
  }

  const download = async () => {
    setWorking('png')
    try {
      const dataUrl = await renderPng(false)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `convite-${slug}.png`
      a.click()
    } catch (err) {
      console.error('Erro ao gerar o PNG:', err)
      flash('Erro ao gerar a imagem. Tente novamente.')
    } finally {
      setWorking(null)
    }
  }

  const publish = async () => {
    setWorking('publish')
    try {
      const blob = await renderPng(true)
      await onPublish(blob, cfg)
      flash('Convite publicado na seção!')
    } catch (err) {
      console.error('Erro ao publicar o convite:', err)
      flash(err.message || 'Erro ao publicar o convite.')
    } finally {
      setWorking(null)
    }
  }

  const font = FONTS[cfg.font] || FONTS.elegante

  return (
    <div className="invite-overlay">
      <div className="invite-modal">

        {/* ── Controles ── */}
        <aside className="invite-controls">
          <div className="invite-controls-header">
            <p className="invite-title">Criar convite</p>
            <button className="invite-close" onClick={onClose} title="Fechar">✕</button>
          </div>

          <div className="invite-controls-body">

            <div className="invite-group">
              <p className="invite-group-title">Textos</p>
              <label className="invite-field">
                <span>Tipo de evento</span>
                <input value={cfg.eyebrow} maxLength={40}
                  onChange={(e) => patch({ eyebrow: e.target.value })} />
              </label>
              <label className="invite-field">
                <span>Nome / título</span>
                <input value={cfg.name} maxLength={60}
                  onChange={(e) => patch({ name: e.target.value })} />
              </label>
              <label className="invite-field">
                <span>Mensagem</span>
                <textarea rows={3} value={cfg.message} maxLength={180}
                  onChange={(e) => patch({ message: e.target.value })} />
              </label>
              <label className="invite-field">
                <span>Data e horário</span>
                <input value={cfg.dateLine} maxLength={80}
                  onChange={(e) => patch({ dateLine: e.target.value })} />
              </label>
              <label className="invite-field">
                <span>Local</span>
                <input value={cfg.venueLine} maxLength={120}
                  placeholder="Ex: Casa de Festas Elite · Rua Vítor Meireles, 485"
                  onChange={(e) => patch({ venueLine: e.target.value })} />
              </label>
            </div>

            <div className="invite-group">
              <p className="invite-group-title">Foto</p>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handlePhoto} />
              <div className="invite-photo-btns">
                <button
                  className="invite-btn-sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : (cfg.photo_url ? 'Trocar foto' : '+ Adicionar foto')}
                </button>
                {cfg.photo_url && (
                  <button className="invite-btn-sm" onClick={() => patch({ photo_url: null })}>
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div className="invite-group">
              <p className="invite-group-title">Estilo</p>
              <div className="invite-options">
                {Object.entries(FONTS).map(([id, f]) => (
                  <button key={id}
                    className={'invite-option' + (cfg.font === id ? ' invite-option-active' : '')}
                    onClick={() => patch({ font: id })}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="invite-options">
                {FRAMES.map((f) => (
                  <button key={f.id}
                    className={'invite-option' + (cfg.frame === f.id ? ' invite-option-active' : '')}
                    onClick={() => patch({ frame: f.id })}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="invite-colors">
                <label className="invite-color">
                  <input type="color" value={cfg.bg}
                    onChange={(e) => patch({ bg: e.target.value })} />
                  <span>Fundo</span>
                </label>
                <label className="invite-color">
                  <input type="color" value={cfg.text}
                    onChange={(e) => patch({ text: e.target.value })} />
                  <span>Texto</span>
                </label>
                <label className="invite-color">
                  <input type="color" value={cfg.accent}
                    onChange={(e) => patch({ accent: e.target.value })} />
                  <span>Destaque</span>
                </label>
              </div>
            </div>

            <div className="invite-group">
              <label className="invite-check">
                <input type="checkbox" checked={cfg.qr}
                  onChange={() => patch({ qr: !cfg.qr })} />
                <span>Incluir QR code com o link do site</span>
              </label>
            </div>

          </div>

          <div className="invite-controls-footer">
            {feedback && <p className="invite-feedback">{feedback}</p>}
            <button className="invite-download" onClick={download} disabled={working !== null}>
              {working === 'png' ? 'Gerando...' : '⇓ Baixar PNG'}
            </button>
            <button className="invite-publish" onClick={publish} disabled={working !== null}>
              {working === 'publish' ? 'Publicando...' : 'Publicar na seção Convite'}
            </button>
          </div>
        </aside>

        {/* ── Preview do cartão ── */}
        <div className="invite-preview">
          <div className="invite-card-scale">
            <div
              ref={cardRef}
              className={'invite-card invite-frame-' + cfg.frame}
              style={{
                background: cfg.bg,
                color: cfg.text,
                '--invite-accent': cfg.accent,
                fontFamily: font.body,
              }}
            >
              <p className="invite-card-eyebrow">{cfg.eyebrow}</p>

              {cfg.photo_url && (
                <div className="invite-card-photo">
                  <img src={cfg.photo_url} alt="" crossOrigin="anonymous" />
                </div>
              )}

              <h1
                className="invite-card-name"
                style={{ fontFamily: font.name, fontSize: font.nameSize }}
              >
                {cfg.name}
              </h1>

              {cfg.message && <p className="invite-card-message">{cfg.message}</p>}

              <div className="invite-card-divider">
                <span /><i /><span />
              </div>

              {cfg.dateLine && <p className="invite-card-date">{cfg.dateLine}</p>}
              {cfg.venueLine && <p className="invite-card-venue">{cfg.venueLine}</p>}

              {cfg.qr && qrDataUrl && (
                <div className="invite-card-qr">
                  <img src={qrDataUrl} alt="QR code do site" />
                  <p>aponte a câmera para confirmar presença</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
