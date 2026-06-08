const BASE = import.meta.env.VITE_API_URL

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(error.error || 'Erro na requisição')
  }

  return res.json()
}

// ── RSVP ─────────────────────────────────────────────────────
export const getRsvps = (slug, token) =>
  apiFetch(`/events/${slug}/${token}/rsvps`)

export const createRsvp = (slug, token, data) =>
  apiFetch(`/events/${slug}/${token}/rsvps`, {
    method: 'POST',
    body: JSON.stringify({ rsvp: data }),
  })

// ── Messages ─────────────────────────────────────────────────
export const getMessages = (slug, token) =>
  apiFetch(`/events/${slug}/${token}/messages`)

export const createMessage = (slug, token, data) =>
  apiFetch(`/events/${slug}/${token}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message: data }),
  })

// ── Photos ───────────────────────────────────────────────────
export const getPhotos = (slug, token) =>
  apiFetch(`/events/${slug}/${token}/photos`)

export const createPhoto = (slug, token, data) =>
  apiFetch(`/events/${slug}/${token}/photos`, {
    method: 'POST',
    body: JSON.stringify({ photo: data }),
  })

export const updatePhoto = (slug, token, id, data) =>
  apiFetch(`/events/${slug}/${token}/photos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ photo: data }),
  })

export const deletePhoto = (slug, token, id) =>
  apiFetch(`/events/${slug}/${token}/photos/${id}`, {
    method: 'DELETE',
  })

// ── Events ───────────────────────────────────────────────────
export const getEvent = (slug, token) =>
  apiFetch(`/events/${slug}/${token}`)
