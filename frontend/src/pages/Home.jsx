import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import './Home.css'

const FEATURES = [
  {
    icon: '✓',
    title: 'Confirmação de Presença',
    desc: 'RSVP digital com contagem de convidados, restrições alimentares e lista de confirmados em tempo real.',
  },
  {
    icon: '◈',
    title: 'Galeria de Fotos',
    desc: 'Upload direto para a nuvem. Fotos do ensaio e da festa organizadas e acessíveis para todos os convidados.',
  },
  {
    icon: '♡',
    title: 'Lista de Presentes',
    desc: 'Presentes com valores sugeridos, pagamento via Pix ou cartão. Sem complicação para quem presenteia.',
  },
  {
    icon: '✦',
    title: 'Livro de Mensagens',
    desc: 'Um mural digital onde convidados deixam recados carinhosos que ficam guardados para sempre.',
  },
  {
    icon: '◎',
    title: 'Contagem Regressiva',
    desc: 'Dias, horas, minutos e segundos até o grande momento. A expectativa faz parte da celebração.',
  },
  {
    icon: '⌘',
    title: 'Link Seguro e Único',
    desc: 'Cada evento tem uma URL exclusiva com token de acesso. Só quem recebe o link consegue acessar.',
  },
]

const STEPS = [
  { num: 'I',   title: 'Crie o evento',     desc: 'Cadastre as informações da celebração: data, local, tipo de evento e tema visual.' },
  { num: 'II',  title: 'Personalize',        desc: 'Adicione fotos, lista de presentes e detalhes do traje. Tudo pelo painel admin.' },
  { num: 'III', title: 'Compartilhe o link', desc: 'Envie o link exclusivo para os convidados pelo WhatsApp, e-mail ou impresso no convite.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="landing">

      {/* ── NAV ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <button className="landing-logo" onClick={() => navigate('/')}>
            Convida<span>.me</span>
          </button>
          <div className="landing-nav-actions">
            {user ? (
              <button
                className="landing-nav-btn landing-nav-btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                Meu painel
              </button>
            ) : (
              <>
                <button className="landing-nav-btn" onClick={() => navigate('/login')}>
                  Entrar
                </button>
                <button
                  className="landing-nav-btn landing-nav-btn-primary"
                  onClick={() => navigate('/login')}
                >
                  Começar agora
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">

          <p className="landing-hero-eyebrow">
            plataforma de eventos memoráveis
          </p>

          <h1 className="landing-hero-title">
            O site do seu evento,<br />
            <span>do jeito que merece.</span>
          </h1>

          <p className="landing-hero-sub">
            Crie um site elegante e completo para o seu 15 anos, casamento
            ou aniversário. RSVP, galeria, presentes e muito mais — tudo em
            uma página com o seu link exclusivo.
          </p>

          <div className="landing-hero-btns">
            <button
              className="landing-btn-primary"
              onClick={() => navigate('/login')}
            >
              {user ? 'Ir para o painel' : 'Criar meu evento'}
            </button>
            <button
              className="landing-btn-secondary"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver recursos
            </button>
          </div>

        </div>

        {/* Decoração SVG — índigo/ouro */}
        <div className="landing-hero-deco">
          <svg viewBox="0 0 200 260" fill="none" className="landing-deco-svg">
            <rect x="1" y="1" width="198" height="258"
              stroke="url(#grad1)" strokeWidth="1" opacity="0.6" />
            <rect x="10" y="10" width="180" height="240"
              stroke="url(#grad1)" strokeWidth="0.5" opacity="0.25" />
            <line x1="100" y1="1" x2="100" y2="259"
              stroke="#8b5cf6" strokeWidth="0.5" opacity="0.2" />
            <line x1="1" y1="130" x2="199" y2="130"
              stroke="#f0c060" strokeWidth="0.5" opacity="0.2" />
            <circle cx="100" cy="130" r="45"
              stroke="url(#grad1)" strokeWidth="0.8" opacity="0.3" />
            <circle cx="100" cy="130" r="28"
              stroke="#8b5cf6" strokeWidth="0.5" opacity="0.2" />
            <text x="100" y="138" textAnchor="middle"
              fill="url(#grad1)" fontSize="22"
              fontFamily="serif" opacity="0.6">XV</text>
            {/* Cantos decorativos */}
            <path d="M1 1 L20 1 M1 1 L1 20" stroke="#f0c060" strokeWidth="1.5" opacity="0.7"/>
            <path d="M199 1 L180 1 M199 1 L199 20" stroke="#f0c060" strokeWidth="1.5" opacity="0.7"/>
            <path d="M1 259 L20 259 M1 259 L1 240" stroke="#f0c060" strokeWidth="1.5" opacity="0.7"/>
            <path d="M199 259 L180 259 M199 259 L199 240" stroke="#f0c060" strokeWidth="1.5" opacity="0.7"/>
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6"/>
                <stop offset="100%" stopColor="#f0c060"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-features" id="features">
        <div className="landing-section-inner">
          <p className="landing-section-eyebrow">recursos</p>
          <h2 className="landing-section-title">
            Tudo que o seu evento precisa
          </h2>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <span className="landing-feature-icon">{f.icon}</span>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-how">
        <div className="landing-section-inner">
          <p className="landing-section-eyebrow">como funciona</p>
          <h2 className="landing-section-title">Pronto em minutos</h2>
          <div className="landing-steps">
            {STEPS.map((s) => (
              <div key={s.num} className="landing-step">
                <div className="landing-step-num">{s.num}</div>
                <h3 className="landing-step-title">{s.title}</h3>
                <p className="landing-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-section-inner landing-cta-inner">
          <h2 className="landing-cta-title">
            Pronto para criar um<br />momento inesquecível?
          </h2>
          <p className="landing-cta-sub">
            Configure o site do seu evento em poucos minutos.
          </p>
          <button className="landing-btn-primary" onClick={() => navigate('/login')}>
            {user ? 'Ir para o painel' : 'Começar agora'}
          </button>
        </div>
      </section>

    </div>
  )
}
