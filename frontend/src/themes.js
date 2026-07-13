// ════════════════════════════════════════════════════════════
// CATÁLOGO DE TEMAS
// Cada tema redefine as variáveis CSS globais declaradas em
// index.css. O tema ativo fica salvo em event.settings.theme;
// na ausência dele, o site usa DEFAULT_THEME_ID.
// Todos os temas devem definir o mesmo conjunto de variáveis.
// ════════════════════════════════════════════════════════════

export const DEFAULT_THEME_ID = 'classico-dourado'

export const THEMES = [
  {
    id: 'classico-dourado',
    name: 'Clássico Dourado',
    description: 'creme e dourado · elegante e luminoso',
    dark: false,
    vars: {
      '--bg-dark':       '#ece3d0',
      '--bg-section':    '#e6dcc6',
      '--bg-card':       '#f4ede0',
      '--red':           '#8b1a1a',
      '--red-light':     '#a82323',
      '--gold':          '#a8842e',
      '--gold-dim':      '#a98f58',
      '--cream':         '#2e2417',
      '--ivory':         '#201a10',
      '--text-muted':    '#7a6a4d',
      '--border':        'rgba(139, 108, 46, 0.3)',
      '--btn-red':       '#b1554b',
      '--btn-red-hover': '#bf675d',
      '--btn-text':      '#faf4e6',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'noite-de-gala',
    name: 'Noite de Gala',
    description: 'fundo escuro · vermelho e ouro de teatro',
    dark: true,
    vars: {
      '--bg-dark':       '#0e0a08',
      '--bg-section':    '#141010',
      '--bg-card':       '#1c1614',
      '--red':           '#8b1a1a',
      '--red-light':     '#c0392b',
      '--gold':          '#c9a84c',
      '--gold-dim':      '#7a6030',
      '--cream':         '#f0e6cc',
      '--ivory':         '#faf6ee',
      '--text-muted':    '#8a7a60',
      '--border':        'rgba(201, 168, 76, 0.25)',
      '--btn-red':       '#8b1a1a',
      '--btn-red-hover': '#c0392b',
      '--btn-text':      '#f0e6cc',
      '--footer-copy':   'rgba(255, 255, 255, 0.4)',
    },
  },
  {
    id: 'rosa-cha',
    name: 'Rosa Chá',
    description: 'rosa suave · toques de rose gold',
    dark: false,
    vars: {
      '--bg-dark':       '#f9e9ee',
      '--bg-section':    '#f4dde6',
      '--bg-card':       '#fdf3f6',
      '--red':           '#a3355f',
      '--red-light':     '#bf4a76',
      '--gold':          '#b76e79',
      '--gold-dim':      '#c19099',
      '--cream':         '#3a2230',
      '--ivory':         '#2a1622',
      '--text-muted':    '#8d6474',
      '--border':        'rgba(183, 110, 121, 0.35)',
      '--btn-red':       '#c76a8d',
      '--btn-red-hover': '#d47da0',
      '--btn-text':      '#fdf3f6',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'verde-jardim',
    name: 'Verde Jardim',
    description: 'verdes naturais · clima de jardim',
    dark: false,
    vars: {
      '--bg-dark':       '#e9efe2',
      '--bg-section':    '#dfe8d4',
      '--bg-card':       '#f3f7ec',
      '--red':           '#2f5d3f',
      '--red-light':     '#3f7a54',
      '--gold':          '#96833a',
      '--gold-dim':      '#a09a63',
      '--cream':         '#24301f',
      '--ivory':         '#1a2415',
      '--text-muted':    '#6b755c',
      '--border':        'rgba(111, 128, 77, 0.35)',
      '--btn-red':       '#557a4e',
      '--btn-red-hover': '#689260',
      '--btn-text':      '#f5f9ef',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'azul-sereno',
    name: 'Azul Sereno',
    description: 'azuis calmos · sofisticação discreta',
    dark: false,
    vars: {
      '--bg-dark':       '#e7eef5',
      '--bg-section':    '#dbe6f0',
      '--bg-card':       '#f2f7fb',
      '--red':           '#274b6d',
      '--red-light':     '#35608a',
      '--gold':          '#9c8440',
      '--gold-dim':      '#8fa0b3',
      '--cream':         '#1f2a36',
      '--ivory':         '#141d26',
      '--text-muted':    '#5d7183',
      '--border':        'rgba(90, 120, 150, 0.35)',
      '--btn-red':       '#4a6f94',
      '--btn-red-hover': '#5b81a8',
      '--btn-text':      '#f2f7fb',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'azul-bebe',
    name: 'Azul Bebê',
    description: 'azul clarinho e creme · doçura de chá de bebê',
    dark: false,
    vars: {
      '--bg-dark':       '#e8f1f4',
      '--bg-section':    '#dcebf0',
      '--bg-card':       '#f4f9fb',
      '--red':           '#3e7291',
      '--red-light':     '#4f86a8',
      '--gold':          '#c2a878',
      '--gold-dim':      '#94bccf',
      '--cream':         '#243642',
      '--ivory':         '#182833',
      '--text-muted':    '#5f7d8c',
      '--border':        'rgba(111, 163, 189, 0.35)',
      '--btn-red':       '#6fa3bd',
      '--btn-red-hover': '#82b4cd',
      '--btn-text':      '#f4f9fb',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'rosa-e-azul',
    name: 'Rosa & Azul',
    description: 'rosa e azul lado a lado · clima de chá revelação',
    dark: false,
    vars: {
      '--bg-dark':       '#faf1f0',
      '--bg-section':    '#f3e5e6',
      '--bg-card':       '#fdf8f7',
      '--red':           '#c2527d',
      '--red-light':     '#d3688f',
      '--gold':          '#5b8fb5',
      '--gold-dim':      '#8fb3cd',
      '--cream':         '#33272c',
      '--ivory':         '#241a1f',
      '--text-muted':    '#87707a',
      '--border':        'rgba(194, 82, 125, 0.3)',
      '--btn-red':       '#c2527d',
      '--btn-red-hover': '#d3688f',
      '--btn-text':      '#fdf8f7',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'bodas-de-ouro',
    name: 'Bodas de Ouro',
    description: 'dourado clássico · cinquenta anos de brilho',
    dark: false,
    vars: {
      '--bg-dark':       '#f5eedc',
      '--bg-section':    '#efe5cb',
      '--bg-card':       '#faf5e8',
      '--red':           '#8a6d1d',
      '--red-light':     '#a3851f',
      '--gold':          '#b8860b',
      '--gold-dim':      '#c4a44a',
      '--cream':         '#33290f',
      '--ivory':         '#241c08',
      '--text-muted':    '#7d6f45',
      '--border':        'rgba(184, 134, 11, 0.35)',
      '--btn-red':       '#b08a2e',
      '--btn-red-hover': '#c19b3c',
      '--btn-text':      '#faf5e8',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
  {
    id: 'lilas-encanto',
    name: 'Lilás Encanto',
    description: 'lilás e violeta · delicado e moderno',
    dark: false,
    vars: {
      '--bg-dark':       '#f0eaf5',
      '--bg-section':    '#e6dcef',
      '--bg-card':       '#f8f4fb',
      '--red':           '#6b3f8a',
      '--red-light':     '#7f52a0',
      '--gold':          '#8a63b3',
      '--gold-dim':      '#a68fc4',
      '--cream':         '#2c2236',
      '--ivory':         '#201830',
      '--text-muted':    '#776a85',
      '--border':        'rgba(138, 99, 179, 0.3)',
      '--btn-red':       '#8a63b3',
      '--btn-red-hover': '#9b77c4',
      '--btn-text':      '#f8f4fb',
      '--footer-copy':   'rgba(0, 0, 0, 0.4)',
    },
  },
]

const THEME_VAR_NAMES = Object.keys(THEMES[0].vars)

export function getTheme(id) {
  return THEMES.find((t) => t.id === id)
      || THEMES.find((t) => t.id === DEFAULT_THEME_ID)
}

// Aplica o tema como estilos inline no <html>, sobrepondo o :root
export function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([name, value]) => {
    root.style.setProperty(name, value)
  })
}

// Remove as sobreposições, devolvendo o site ao tema padrão do CSS
export function clearTheme() {
  const root = document.documentElement
  THEME_VAR_NAMES.forEach((name) => root.style.removeProperty(name))
}
