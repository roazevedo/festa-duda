// ════════════════════════════════════════════════════════════
// CICLO DE VIDA DO EVENTO
// O site fica no ar por um período após a data da festa, conforme
// o plano (3 meses no Grátis, 12 nos pagos — ver plans.js).
// Depois disso é "finalizado": a página pública é encerrada,
// mas os dados permanecem (card no dashboard, exportações).
// Espelha app/models/event.rb#lifetime — os dois andam juntos.
// ════════════════════════════════════════════════════════════

import { planLimit } from './plans'

export function eventLifetimeMonths(event) {
  return planLimit(event, 'lifetimeMonths')
}

export function eventExpiresAt(event) {
  if (!event?.event_date) return null
  const d = new Date(event.event_date)
  d.setMonth(d.getMonth() + eventLifetimeMonths(event))
  return d
}

export function isEventFinished(event, now = Date.now()) {
  const expires = eventExpiresAt(event)
  return expires ? expires.getTime() < now : false
}
