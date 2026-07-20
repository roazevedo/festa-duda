// ════════════════════════════════════════════════════════════
// TIPOS DE EVENTO
// Catálogo único usado na criação, no dashboard, no painel e no
// banner do site. O backend valida os ids em app/models/event.rb
// — os dois precisam andar juntos.
// ════════════════════════════════════════════════════════════

export const EVENT_TYPES = [
  { id: 'quinze_anos',        label: 'XV Anos',       eyebrow: 'Festa de 15 anos', desc: 'festa de debutante' },
  { id: 'casamento',          label: 'Casamento',     eyebrow: 'Casamento',        desc: 'cerimônia e recepção' },
  { id: 'aniversario',        label: 'Aniversário',   eyebrow: 'Aniversário',      desc: 'qualquer idade' },
  { id: 'cha_de_bebe',        label: 'Chá de Bebê',   eyebrow: 'Chá de Bebê',      desc: 'para celebrar a chegada' },
  { id: 'cha_revelacao',      label: 'Chá Revelação', eyebrow: 'Chá Revelação',    desc: 'menino ou menina?' },
  // id continua bodas_de_ouro por compatibilidade com eventos já criados
  { id: 'bodas_de_ouro',      label: 'Bodas',         eyebrow: 'Bodas',            desc: 'ouro, prata e todas as outras' },
  { id: 'formatura',          label: 'Formatura',     eyebrow: 'Formatura',        desc: 'colação e festa' },
  { id: 'evento_corporativo', label: 'Corporativo',   eyebrow: 'Evento',           desc: 'confraternizações e lançamentos' },
  { id: 'outro',              label: 'Outro Evento',  eyebrow: 'Evento',           desc: 'qualquer celebração' },
]

export function eventTypeLabel(id) {
  return EVENT_TYPES.find((t) => t.id === id)?.label || id
}

export function eventTypeEyebrow(id) {
  return EVENT_TYPES.find((t) => t.id === id)?.eyebrow || 'Evento'
}
