// ════════════════════════════════════════════════════════════
// DECORAÇÕES DAS LATERAIS
// Ornamentos discretos nas margens do site (desktop). A escolha
// fica em event.settings.decoration; desenhos em PageOrnaments.
// ════════════════════════════════════════════════════════════

export const DECORATIONS = [
  { id: 'nenhuma',  label: 'Nenhuma' },
  { id: 'classica', label: 'Linhas clássicas' },
  { id: 'coracoes', label: 'Corações' },
  { id: 'estrelas', label: 'Estrelas' },
  { id: 'flores',   label: 'Flores' },
  { id: 'folhagem', label: 'Folhagem' },
  { id: 'baloes',   label: 'Balões' },
  { id: 'confete',  label: 'Confete' },
  { id: 'nuvens',   label: 'Nuvens' },
  { id: 'bebe',     label: 'Bebê' },
  { id: 'glamour',  label: 'Glamour' },
]

export const DEFAULT_DECORATION = 'classica'

export function decorationOf(event) {
  return event?.settings?.decoration ?? DEFAULT_DECORATION
}
