import { useState } from 'react'
import { lookupRsvp, addCompanions } from '../services/api'

// Modal para quem já confirmou presença e quer incluir mais acompanhantes.
// 1) busca a própria confirmação pelo nome
// 2) mostra os acompanhantes já registrados e quantas vagas restam
// 3) permite adicionar novos nomes (respeitando o teto vindo do backend)
export default function AddCompanionsModal({ slug, token, initialName = '', onClose, onUpdated }) {
  const [name, setName]         = useState(initialName)
  const [found, setFound]       = useState(null)   // rsvp + remaining_slots
  const [searching, setSearching] = useState(false)
  const [error, setError]       = useState('')
  const [additions, setAdditions] = useState([])   // [{ name, child }]
  const [saving, setSaving]     = useState(false)
  const [done, setDone]         = useState(false)

  const remaining = found ? found.remaining_slots : 0

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSearching(true)
    setError('')
    setFound(null)
    setDone(false)
    try {
      const rsvp = await lookupRsvp(slug, token, name.trim())
      setFound(rsvp)
      // Começa já com um campo em branco se ainda houver vaga
      setAdditions(rsvp.remaining_slots > 0 ? [{ name: '', child: false }] : [])
    } catch (err) {
      setError(err.message || 'Não encontramos uma confirmação com esse nome.')
    } finally {
      setSearching(false)
    }
  }

  const setAddition = (i, patch) =>
    setAdditions((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))

  const addRow = () =>
    setAdditions((prev) =>
      prev.length < remaining ? [...prev, { name: '', child: false }] : prev)

  const removeRow = (i) =>
    setAdditions((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async (e) => {
    e.preventDefault()
    const clean = additions
      .map((a) => ({ name: a.name.trim(), child: !!a.child }))
      .filter((a) => a.name)
    if (clean.length === 0) {
      setError('Informe ao menos um acompanhante.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const updated = await addCompanions(slug, token, {
        name: found.name,
        companion_names:    clean.map((a) => a.name),
        companion_children: clean.map((a) => a.child),
      })
      onUpdated?.(updated)
      setFound({ ...updated, remaining_slots: Math.max(6 - updated.companion_names.length, 0) })
      setAdditions([])
      setDone(true)
    } catch (err) {
      setError(err.message || 'Não foi possível adicionar os acompanhantes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="companions-overlay" onClick={onClose}>
      <div className="companions-modal" onClick={(e) => e.stopPropagation()}>
        <button className="companions-close" onClick={onClose} title="Fechar">✕</button>

        <p className="companions-title">Adicionar acompanhantes</p>
        <p className="companions-hint">
          Se você já confirmou presença e quer incluir mais acompanhantes,
          busque a sua confirmação pelo nome.
        </p>

        <form className="companions-search" onSubmit={handleSearch}>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="seu nome completo"
          />
          <button className="rsvp-btn" type="submit" disabled={searching || !name.trim()}>
            {searching ? 'Buscando...' : 'Buscar convidado'}
          </button>
        </form>

        {error && <p className="companions-error">{error}</p>}

        {found && (
          <div className="companions-result">
            <p className="companions-found-name">
              {found.name}
              {found.companion_names?.length > 0 && (
                <span className="companions-count">
                  {' '}· {found.companion_names.length} acompanhante
                  {found.companion_names.length > 1 ? 's' : ''}
                </span>
              )}
            </p>

            {found.companion_names?.length > 0 && (
              <ul className="companions-existing">
                {found.companion_names.map((cn, i) => (
                  <li key={i}>
                    + {cn}
                    {found.companion_children?.[i] && (
                      <em className="companions-child"> · criança -8</em>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {done && (
              <p className="companions-done">Acompanhantes adicionados. Até lá! 🥂</p>
            )}

            {remaining > 0 ? (
              <form className="companions-add" onSubmit={handleSave}>
                <p className="companions-add-label">
                  {remaining} vaga{remaining > 1 ? 's' : ''} disponíve
                  {remaining > 1 ? 'is' : 'l'}
                </p>
                {additions.map((a, i) => (
                  <div key={i} className="companions-row">
                    <input
                      className="form-input"
                      type="text"
                      value={a.name}
                      onChange={(e) => setAddition(i, { name: e.target.value })}
                      placeholder="nome completo"
                    />
                    <label className="form-checkbox">
                      <input
                        type="checkbox"
                        checked={a.child}
                        onChange={(e) => setAddition(i, { child: e.target.checked })}
                      />
                      criança abaixo de 8 anos
                    </label>
                    {additions.length > 1 && (
                      <button
                        type="button"
                        className="companions-remove"
                        onClick={() => removeRow(i)}
                      >
                        remover
                      </button>
                    )}
                  </div>
                ))}
                {additions.length < remaining && (
                  <button type="button" className="companions-more" onClick={addRow}>
                    + adicionar outro
                  </button>
                )}
                <button className="rsvp-btn" type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Adicionar acompanhantes'}
                </button>
              </form>
            ) : (
              !done && (
                <p className="companions-full">
                  Você já atingiu o limite de acompanhantes desta confirmação.
                </p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
