// Persistência de rascunho no navegador (localStorage) com validade.
//
// Guarda o que o usuário está preenchendo para ele não perder o
// progresso ao sair e voltar. É armazenamento funcional/essencial —
// serve ao próprio usuário, não rastreia nada e some sozinho depois
// do prazo. Por isso não depende de consentimento de cookies.
const PREFIX = 'draft:'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

export function saveDraft(key, data) {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, savedAt: Date.now() })
    )
  } catch {
    // localStorage cheio/indisponível (ex.: aba anônima) — ignora
  }
}

export function loadDraft(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { data, savedAt } = JSON.parse(raw)
    // Expirou: descarta e trata como se não houvesse rascunho
    if (!savedAt || Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(PREFIX + key)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function clearDraft(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignora
  }
}
