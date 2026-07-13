// ════════════════════════════════════════════════════════════
// CICLO DE VIDA DO EVENTO
// Cada evento fica no ar por 6 meses após a data da festa.
// Depois disso é "finalizado": a página pública é encerrada,
// mas os dados permanecem (card no dashboard, exportações).
// ════════════════════════════════════════════════════════════

export const EVENT_LIFETIME_MONTHS = 6

export function eventExpiresAt(event) {
  if (!event?.event_date) return null
  const d = new Date(event.event_date)
  d.setMonth(d.getMonth() + EVENT_LIFETIME_MONTHS)
  return d
}

export function isEventFinished(event, now = Date.now()) {
  const expires = eventExpiresAt(event)
  return expires ? expires.getTime() < now : false
}
