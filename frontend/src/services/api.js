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
export const getPhotos = (slug, token, category = null) => {
  const query = category ? `?category=${category}` : ''
  return apiFetch(`/events/${slug}/${token}/photos${query}`)
}

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

// ── Gifts ────────────────────────────────────────────────────
export const getGifts = (slug, token) =>
  apiFetch(`/events/${slug}/${token}/gifts`)

export const createGift = (slug, token, data) =>
  apiFetch(`/events/${slug}/${token}/gifts`, {
    method: 'POST',
    body: JSON.stringify({ gift: data }),
  })

export const updateGift = (slug, token, id, data) =>
  apiFetch(`/events/${slug}/${token}/gifts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ gift: data }),
  })

export const deleteGift = (slug, token, id) =>
  apiFetch(`/events/${slug}/${token}/gifts/${id}`, {
    method: 'DELETE',
  })

// ── Cloudinary (upload signed) ───────────────────────────────
export const getCloudinarySignature = (folder) =>
  apiFetch('/cloudinary/signature', {
    method: 'POST',
    body: JSON.stringify({ folder }),
  })

// ── Events ───────────────────────────────────────────────────
export const getEvent = (slug, token) =>
  apiFetch(`/events/${slug}/${token}`)

export const updateEvent = (slug, token, data) =>
  apiFetch(`/events/${slug}/${token}`, {
    method: 'PATCH',
    body: JSON.stringify({ event: data }),
  })
