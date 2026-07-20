// ════════════════════════════════════════════════════════════
// SEÇÕES DO SITE DO EVENTO
// O site é montado por seções que o dono do evento liga/desliga
// no painel. A configuração vive em event.settings.sections:
//   { rsvp: { enabled: true, title: '...', subtitle: '...' }, ... }
// Na ausência de configuração, valem os padrões abaixo.
//
// event.settings.template === 'teatro' preserva o layout original
// do site da Maria Eduarda (Atos, cortinas, salão, traje).
// ════════════════════════════════════════════════════════════

export const SECTIONS = [
  {
    id: 'save_the_date',
    label: 'Save the Date (vídeo)',
    description: 'vídeo-convite do YouTube',
    defaultEnabled: false,
    header: { title: 'Save the Date', subtitle: 'guarde essa data com a gente' },
  },
  {
    id: 'convite',
    label: 'Arte do convite',
    description: 'imagem do convite da festa',
    defaultEnabled: false,
    header: { title: 'Convite', subtitle: 'nosso convite para você' },
  },
  {
    id: 'countdown',
    label: 'Contagem regressiva',
    description: 'dias, horas e minutos até a festa',
    defaultEnabled: true,
    header: { title: 'Contagem Regressiva', subtitle: 'falta pouco para a festa' },
  },
  {
    id: 'rsvp',
    label: 'Confirmação de presença',
    description: 'formulário de RSVP para os convidados',
    defaultEnabled: true,
    header: { title: 'Confirme sua Presença', subtitle: 'sua presença é o nosso presente' },
  },
  {
    id: 'presentes',
    label: 'Lista de presentes',
    description: 'contribuições via pix ou cartão',
    defaultEnabled: true,
    header: { title: 'Lista de Presentes', subtitle: 'se quiser nos presentear, escolha com o coração' },
  },
  {
    id: 'palavras',
    label: 'Mural de recados',
    description: 'mensagens deixadas pelos convidados',
    defaultEnabled: true,
    header: { title: 'Mural de Recados', subtitle: 'deixe uma mensagem carinhosa' },
  },
  {
    id: 'galeria',
    label: 'Galeria de fotos',
    description: 'fotos do evento ou do homenageado',
    defaultEnabled: true,
    header: { title: 'Galeria de Fotos', subtitle: 'momentos para guardar' },
  },
  {
    id: 'traje',
    label: 'Traje / dress code',
    description: 'orientação de traje com fotos de referência',
    defaultEnabled: false,
    header: { title: 'O Traje', subtitle: 'como se vestir para a ocasião' },
  },
  {
    id: 'local',
    label: 'Local da festa',
    description: 'endereço e como chegar',
    defaultEnabled: true,
    header: { title: 'Local da Festa', subtitle: 'onde vamos comemorar' },
  },
]

export function isTeatro(event) {
  return event?.settings?.template === 'teatro'
}

// Ordem das seções no site: settings.section_order quando salvo.
// Ids desconhecidos são descartados; seções novas (ainda fora da
// ordem salva) entram no fim, na ordem padrão.
export function sectionOrder(event) {
  const ids   = SECTIONS.map((s) => s.id)
  const saved = event?.settings?.section_order
  if (!Array.isArray(saved)) return ids
  const valid   = saved.filter((id) => ids.includes(id))
  const missing = ids.filter((id) => !valid.includes(id))
  return [...valid, ...missing]
}

export function sectionEnabled(event, id) {
  const def = SECTIONS.find((s) => s.id === id)
  const cfg = event?.settings?.sections?.[id]
  return cfg?.enabled ?? def?.defaultEnabled ?? true
}

export function sectionHeader(event, id) {
  const def = SECTIONS.find((s) => s.id === id)?.header || {}
  const cfg = event?.settings?.sections?.[id] || {}
  return {
    title:    cfg.title    || def.title,
    subtitle: cfg.subtitle ?? def.subtitle,
  }
}
