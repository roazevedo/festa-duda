// ════════════════════════════════════════════════════════════
// PLANOS DA PLATAFORMA
// Espelha app/models/event.rb (PLANS / PLAN_LIMITS / FREE_THEMES)
// — os dois devem andar juntos. O plano vive em event.plan.
//
//   gratis   → para começar: ferramentas essenciais com limites
//   completo → R$ 149,90 por evento: tudo liberado (checkout MP)
//   atelie   → R$ 997: página sob medida, negociado por contato
// ════════════════════════════════════════════════════════════

export const DEFAULT_PLAN_ID = 'gratis'

// Contato do plano Ateliê — trocar quando houver e-mail no domínio
export const ATELIE_CONTACT = 'mailto:rodrigodeazevedosilva@yahoo.com.br'

export const PLANS = [
  {
    id: 'gratis',
    name: 'Grátis',
    priceLabel: 'R$ 0',
    tagline: 'para começar agora',
    // null = ilimitado; lifetimeMonths conta a partir da data da festa
    limits: { gifts: 10, photos: 20, lifetimeMonths: 3 },
    saveTheDate: false,
    export: false,
    branding: true,
  },
  {
    id: 'completo',
    name: 'Completo',
    priceLabel: 'R$ 149,90',
    tagline: 'por evento · tudo liberado',
    limits: { gifts: null, photos: null, lifetimeMonths: 12 },
    saveTheDate: true,
    export: true,
    branding: false,
  },
  {
    id: 'atelie',
    name: 'Ateliê',
    priceLabel: 'R$ 997',
    tagline: 'página sob medida, criada a quatro mãos',
    limits: { gifts: null, photos: null, lifetimeMonths: 12 },
    saveTheDate: true,
    export: true,
    branding: false,
  },
]

// Texto de venda dos planos (nome, preço, tagline, bullets, CTA).
// Usado na seção de planos da home e no modal de escolha do painel.
export const PLAN_CARDS = [
  {
    id: 'gratis',
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    tagline: 'para começar agora',
    bullets: [
      'Convite, contagem regressiva, RSVP, mural e local',
      'Traje / dress code com fotos de referência',
      '5 temas de cores',
      'Lista de presentes com até 10 itens',
      'Galeria com até 20 fotos',
      'Site no ar por 3 meses após a festa',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'completo',
    name: 'Completo',
    price: 'R$ 149,90',
    period: 'por evento',
    tagline: 'tudo liberado para a sua festa',
    highlight: true,
    bullets: [
      'Tudo do plano Grátis',
      'Save the Date em vídeo',
      'Todos os temas de cores',
      'Lista de presentes e galeria ilimitadas',
      'Sem a marca Convida.me no rodapé',
      'Exportação da lista de confirmados',
      'Site no ar por 12 meses após a festa',
      'Suporte por WhatsApp',
    ],
    cta: 'Criar meu evento',
  },
  {
    id: 'atelie',
    name: 'Ateliê',
    price: 'R$ 997',
    period: 'projeto exclusivo',
    tagline: 'uma página criada a quatro mãos',
    bullets: [
      'Tudo do plano Completo',
      'Tema criado do zero para a sua festa',
      'Animações e seções sob medida',
      'Contato direto com quem desenvolve a página',
    ],
    cta: 'Falar com o ateliê',
  },
]

// Temas de cores liberados no plano grátis — as 5 paletas versáteis;
// as temáticas (chá de bebê, revelação, bodas...) são do Completo.
// Espelha FREE_THEMES em app/models/event.rb.
export const FREE_THEMES = [
  'classico-dourado',
  'noite-de-gala',
  'rosa-cha',
  'verde-jardim',
  'azul-sereno',
]

export function planOf(event) {
  return PLANS.find((p) => p.id === event?.plan)
      || PLANS.find((p) => p.id === DEFAULT_PLAN_ID)
}

export function isFreePlan(event) {
  return planOf(event).id === 'gratis'
}

// Limite numérico do plano — null significa ilimitado
export function planLimit(event, key) {
  return planOf(event).limits[key] ?? null
}

export function planAllows(event, feature) {
  return Boolean(planOf(event)[feature])
}

export function themeLocked(event, themeId) {
  return isFreePlan(event) && !FREE_THEMES.includes(themeId)
}

// Seções do site travadas pelo plano (usado no editor e no render)
export function sectionLocked(event, sectionId) {
  return sectionId === 'save_the_date' && !planAllows(event, 'saveTheDate')
}
