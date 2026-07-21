import { useRef, useState, useEffect } from 'react'
import { useEvent } from '../contexts/useEvent'
import { updateEvent } from '../services/api'
import { saveDraft, loadDraft, clearDraft } from '../utils/draftStorage'
import { uploadToCloudinary } from '../services/cloudinary'
import { THEMES, DEFAULT_THEME_ID } from '../themes'
import { SECTIONS, sectionEnabled, sectionOrder, isTeatro } from '../sections'
import { isFreePlan, themeLocked, sectionLocked } from '../plans'
import { BANNER_PRESETS } from '../banners'
import { DECORATIONS, decorationOf } from '../decorations'
import { useConfirm } from './useConfirm'
import './EditorPanel.css'

// Converte ISO → data/hora locais para os inputs
function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

// Campos do evento que o editor pode alterar — usados para
// detectar mudanças, montar o PATCH do salvar e guardar o rascunho
const editableFields = (ev) => ({
  settings:         ev?.settings || {},
  name:             ev?.name || '',
  event_date:       ev?.event_date || '',
  venue_name:       ev?.venue_name || '',
  venue_address:    ev?.venue_address || '',
  rsvp_list_public: Boolean(ev?.rsvp_list_public),
  messages_public:  Boolean(ev?.messages_public),
})

const snapshot = (ev) => JSON.stringify(editableFields(ev))

// ════════════════════════════════════════════════════════════
// EDITOR AO VIVO — barra lateral esquerda de personalização.
// Cada escolha é aplicada imediatamente no site (via setEvent);
// nada é persistido até clicar em "Salvar alterações".
// ════════════════════════════════════════════════════════════
export default function EditorPanel({ onClose }) {
  const { event, setEvent, slug, token } = useEvent()

  // Retrato do evento no momento em que o editor abriu —
  // é para ele que voltamos ao descartar
  const [saved, setSaved]           = useState(() => event)
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [feedback, setFeedback]     = useState(null)
  const [openSection, setOpenSection] = useState(null)
  const [confirm, confirmModal]     = useConfirm()
  const fileRef = useRef(null)

  // Rascunho de edições não salvas — restaurável ao reabrir o editor
  // (some após 24h). Só oferece se o rascunho diferir do que veio do
  // servidor, para não sobrescrever dados mais novos sem o dono querer.
  const draftKey = `editor:${slug}`
  const [pendingDraft, setPendingDraft] = useState(() => {
    const d = loadDraft(draftKey)
    if (!d) return null
    return JSON.stringify(d) !== snapshot(event) ? d : null
  })

  const teatro  = isTeatro(event)
  const themeId = event?.settings?.theme || DEFAULT_THEME_ID
  const banner  = event?.settings?.banner_url || null

  const dirty = snapshot(event) !== snapshot(saved)

  // Enquanto houver edições não salvas, mantém o rascunho no navegador
  useEffect(() => {
    if (dirty) saveDraft(draftKey, editableFields(event))
  }, [event, dirty, draftKey])

  const restoreDraft = () => {
    setEvent({ ...event, ...pendingDraft })
    setPendingDraft(null)
  }

  const dismissDraft = () => {
    clearDraft(draftKey)
    setPendingDraft(null)
  }

  const flash = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 2500)
  }

  // Aplica mudanças só no estado local — o site reflete na hora
  const patchSettings = (patch) => {
    setEvent({ ...event, settings: { ...event.settings, ...patch } })
  }

  const patchEvent = (patch) => setEvent({ ...event, ...patch })

  // Data/horário separados nos inputs, combinados no event_date.
  // Sempre em ISO completo com fuso — o servidor não deve
  // interpretar horário local como UTC.
  const localDT = toLocalInput(event?.event_date)
  const dateVal = localDT.slice(0, 10)
  const timeVal = localDT.slice(11, 16)

  const setDateTime = (d, t) =>
    patchEvent({ event_date: new Date(`${d}T${t}`).toISOString() })

  const toggleSection = (id) => {
    const sections = { ...(event.settings?.sections || {}) }
    sections[id] = { ...(sections[id] || {}), enabled: !sectionEnabled(event, id) }
    patchSettings({ sections })
  }

  // Título/subtítulo da seção — vazio volta ao texto padrão
  const setSectionField = (id, field, value) => {
    const sections = { ...(event.settings?.sections || {}) }
    const cfg = { ...(sections[id] || {}) }
    if (value) cfg[field] = value
    else delete cfg[field]
    sections[id] = cfg
    patchSettings({ sections })
  }

  // O que aparece no banner de capa (padrão: tudo visível)
  const bannerShowCfg = event?.settings?.banner_show || {}
  const bannerShow = {
    type: bannerShowCfg.type ?? true,
    name: bannerShowCfg.name ?? true,
    date: bannerShowCfg.date ?? true,
  }

  const toggleBannerShow = (key) =>
    patchSettings({ banner_show: { ...bannerShowCfg, [key]: !bannerShow[key] } })

  const order = sectionOrder(event)

  const moveSection = (id, dir) => {
    const idx    = order.indexOf(id)
    const target = idx + dir
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    patchSettings({ section_order: next })
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const data = await uploadToCloudinary(file, 'festa-duda/banner')
      patchSettings({ banner_url: data.url })
    } catch (err) {
      flash(err.message || 'Erro ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!event.name?.trim()) return flash('Informe o nome do evento.')
    if (!event.event_date)   return flash('Informe a data da festa.')

    setSaving(true)
    try {
      const updated = await updateEvent(slug, token, {
        name:             event.name.trim(),
        event_date:       event.event_date,
        venue_name:       event.venue_name || null,
        venue_address:    event.venue_address || null,
        rsvp_list_public: Boolean(event.rsvp_list_public),
        messages_public:  Boolean(event.messages_public),
        settings:         event.settings,
      })
      setEvent(updated)
      setSaved(updated)
      clearDraft(draftKey)
      flash('Alterações salvas!')
    } catch {
      flash('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    setEvent(saved)
    clearDraft(draftKey)
  }

  const close = async () => {
    if (dirty) {
      const ok = await confirm(
        'Sair sem salvar? As alterações serão descartadas.',
        'Sair sem salvar'
      )
      if (!ok) return
      setEvent(saved)
    }
    onClose()
  }

  return (
    <aside className="editor-panel">

      <div className="editor-header">
        <div>
          <p className="editor-title">Personalizar</p>
          <p className="editor-sub">as mudanças aparecem na hora — salve quando gostar</p>
        </div>
        <button className="editor-close" onClick={close} title="Fechar editor">✕</button>
      </div>

      <div className="editor-body">

        {pendingDraft && (
          <div className="editor-draft-note">
            <p>Você tem alterações não salvas de antes. Quer restaurá-las?</p>
            <div className="editor-draft-actions">
              <button className="editor-draft-restore" onClick={restoreDraft}>
                Restaurar
              </button>
              <button className="editor-draft-dismiss" onClick={dismissDraft}>
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* ── Dados do evento ── */}
        <div className="editor-group">
          <p className="editor-group-title">Dados do evento</p>
          <div className="editor-fields">
            <label className="editor-field">
              <span>Nome</span>
              <input
                type="text"
                value={event?.name || ''}
                onChange={(e) => patchEvent({ name: e.target.value })}
                maxLength={80}
              />
            </label>
            <div className="editor-field-grid">
              <label className="editor-field">
                <span>Data</span>
                <input
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateTime(e.target.value, timeVal || '12:00')}
                />
              </label>
              <label className="editor-field">
                <span>Horário</span>
                <input
                  type="time"
                  value={timeVal}
                  onChange={(e) => dateVal && setDateTime(dateVal, e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* ── Tema (cores) ── */}
        <div className="editor-group">
          <p className="editor-group-title">Tema de cores</p>
          {isFreePlan(event) && (
            <p className="editor-group-hint">
              o plano Grátis inclui 5 temas — os demais fazem parte do
              plano Completo
            </p>
          )}
          <div className="editor-themes">
            {THEMES.map((t) => {
              const locked = themeLocked(event, t.id)
              return (
                <button
                  key={t.id}
                  className={
                    'editor-theme-row'
                    + (themeId === t.id ? ' editor-theme-active' : '')
                    + (locked ? ' editor-theme-locked' : '')
                  }
                  disabled={locked}
                  title={locked ? 'Disponível no plano Completo' : undefined}
                  onClick={() => !locked && patchSettings({ theme: t.id })}
                >
                  <span className="editor-theme-dots">
                    <span style={{ background: t.vars['--bg-dark'] }} />
                    <span style={{ background: t.vars['--red'] }} />
                    <span style={{ background: t.vars['--gold'] }} />
                    <span style={{ background: t.vars['--btn-red'] }} />
                  </span>
                  <span className="editor-theme-name">{t.name}</span>
                  {locked && <span className="editor-lock-tag">Completo</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Foto de capa (só nos templates modulares) ── */}
        {!teatro && (
          <div className="editor-group">
            <p className="editor-group-title">Foto de capa</p>
            <div className="editor-banners">

              {/* Sem foto — gradiente do tema */}
              <button
                className={
                  'editor-banner-tile editor-banner-none'
                  + (!banner ? ' editor-banner-active' : '')
                }
                onClick={() => patchSettings({ banner_url: null })}
              >
                sem foto
              </button>

              {BANNER_PRESETS.map((b) => (
                <button
                  key={b.id}
                  className={
                    'editor-banner-tile'
                    + (banner === b.url ? ' editor-banner-active' : '')
                  }
                  onClick={() => patchSettings({ banner_url: b.url })}
                  title={b.label}
                >
                  <img src={b.url} alt={b.label} loading="lazy" />
                </button>
              ))}

              {/* Foto própria já enviada e ativa */}
              {banner && !BANNER_PRESETS.some((b) => b.url === banner) && (
                <button className="editor-banner-tile editor-banner-active" title="Sua foto">
                  <img src={banner} alt="Sua foto" />
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            <button
              className="editor-upload-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : '⬆ Usar minha própria foto'}
            </button>

            {/* O que aparece por cima do banner */}
            <p className="editor-subgroup-title">O que aparece no banner</p>
            <div className="editor-checks">
              <label className="editor-check">
                <input
                  type="checkbox"
                  checked={bannerShow.type}
                  onChange={() => toggleBannerShow('type')}
                />
                <span>Tipo de evento (ex.: Casamento)</span>
              </label>
              <label className="editor-check">
                <input
                  type="checkbox"
                  checked={bannerShow.name}
                  onChange={() => toggleBannerShow('name')}
                />
                <span>Nome do evento ou aniversariante</span>
              </label>
              <label className="editor-check">
                <input
                  type="checkbox"
                  checked={bannerShow.date}
                  onChange={() => toggleBannerShow('date')}
                />
                <span>Data da festa</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Decoração das laterais (só nos templates modulares) ── */}
        {!teatro && (
          <div className="editor-group">
            <p className="editor-group-title">Decoração das laterais</p>
            <p className="editor-group-hint">
              ornamentos discretos nas margens, na cor do tema — aparecem
              em telas largas
            </p>
            <div className="editor-decos">
              {DECORATIONS.map((d) => (
                <button
                  key={d.id}
                  className={
                    'editor-deco-btn'
                    + (decorationOf(event) === d.id ? ' editor-deco-active' : '')
                  }
                  onClick={() => patchSettings({ decoration: d.id })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Seções (só nos templates modulares) ── */}
        {!teatro && (
          <div className="editor-group">
            <p className="editor-group-title">Seções do site</p>
            <p className="editor-group-hint">
              Marque o que aparece, mova com as setas e clique em ✎ para
              editar título e subtítulo.
            </p>
            <div className="editor-sections">
              {order.map((id, i) => {
                const s = SECTIONS.find((sec) => sec.id === id)
                if (!s) return null
                const cfg    = event.settings?.sections?.[id] || {}
                const open   = openSection === id
                const locked = sectionLocked(event, id)
                return (
                  <div
                    key={id}
                    className={
                      'editor-section'
                      + (open ? ' editor-section-open' : '')
                      + (locked ? ' editor-section-locked' : '')
                    }
                  >
                    <div className="editor-section-row">
                      <input
                        type="checkbox"
                        checked={!locked && sectionEnabled(event, id)}
                        disabled={locked}
                        onChange={() => !locked && toggleSection(id)}
                      />
                      <button
                        className="editor-section-name"
                        title={locked ? 'Disponível no plano Completo' : undefined}
                        onClick={() => !locked && toggleSection(id)}
                      >
                        {s.label}
                      </button>
                      {locked && <span className="editor-lock-tag">Completo</span>}
                      <div className="editor-section-tools">
                        <button
                          onClick={() => moveSection(id, -1)}
                          disabled={i === 0}
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSection(id, 1)}
                          disabled={i === order.length - 1}
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => setOpenSection(open ? null : id)}
                          title="Editar título e subtítulo"
                        >
                          ✎
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className="editor-section-fields">
                        <label className="editor-field">
                          <span>Título</span>
                          <input
                            type="text"
                            value={cfg.title || ''}
                            placeholder={s.header.title}
                            onChange={(e) => setSectionField(id, 'title', e.target.value)}
                          />
                        </label>
                        <label className="editor-field">
                          <span>Subtítulo</span>
                          <input
                            type="text"
                            value={cfg.subtitle ?? ''}
                            placeholder={s.header.subtitle}
                            onChange={(e) => setSectionField(id, 'subtitle', e.target.value)}
                          />
                        </label>
                        <p className="editor-field-hint">
                          Deixe em branco para usar o texto padrão.
                        </p>
                      </div>
                    )}

                    {/* Local/endereço só fazem sentido com a seção ligada */}
                    {id === 'local' && sectionEnabled(event, id) && (
                      <div className="editor-section-fields">
                        <label className="editor-field">
                          <span>Local</span>
                          <input
                            type="text"
                            value={event?.venue_name || ''}
                            placeholder="Ex: Casa de Festas Elite"
                            onChange={(e) => patchEvent({ venue_name: e.target.value })}
                            maxLength={120}
                          />
                        </label>
                        <label className="editor-field">
                          <span>Endereço</span>
                          <input
                            type="text"
                            value={event?.venue_address || ''}
                            placeholder="Ex: Rua Vítor Meireles, 485 · Rio de Janeiro"
                            onChange={(e) => patchEvent({ venue_address: e.target.value })}
                            maxLength={200}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Privacidade ── */}
        <div className="editor-group">
          <p className="editor-group-title">Privacidade</p>
          <div className="editor-checks">
            <label className="editor-check">
              <input
                type="checkbox"
                checked={Boolean(event?.rsvp_list_public)}
                onChange={() =>
                  patchEvent({ rsvp_list_public: !event.rsvp_list_public })
                }
              />
              <span>Lista de confirmados visível para convidados</span>
            </label>
            <label className="editor-check">
              <input
                type="checkbox"
                checked={Boolean(event?.messages_public)}
                onChange={() =>
                  patchEvent({ messages_public: !event.messages_public })
                }
              />
              <span>Mural de mensagens visível para convidados</span>
            </label>
          </div>
        </div>

        {teatro && (
          <p className="editor-note">
            Este evento usa o template exclusivo <strong>Teatro</strong> —
            o layout das seções é fixo; por aqui você ajusta o tema de
            cores, os dados e a privacidade.
          </p>
        )}

      </div>

      <div className="editor-footer">
        {feedback && <p className="editor-feedback">{feedback}</p>}
        <div className="editor-footer-btns">
          <button
            className="editor-discard"
            onClick={discard}
            disabled={!dirty || saving}
          >
            Descartar
          </button>
          <button
            className="editor-save"
            onClick={save}
            disabled={!dirty || saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </div>

      {confirmModal}
    </aside>
  )
}
