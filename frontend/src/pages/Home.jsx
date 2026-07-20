import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { ATELIE_CONTACT } from '../plans'
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

// ── Planos — espelha src/plans.js (limites) com o texto de venda ──
const PRICING = [
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

// Tabela comparativa — ✓ / — / texto
const COMPARISON = [
  ['Convite, contagem, RSVP, mural e local', '✓', '✓', '✓'],
  ['Traje / dress code',                     '✓', '✓', '✓'],
  ['Save the Date (vídeo)',                  '—', '✓', '✓'],
  ['Temas de cores',                         '5 temas', 'todos', 'criado do zero'],
  ['Lista de presentes',                     '10 itens', 'ilimitada', 'ilimitada'],
  ['Galeria de fotos',                       '20 fotos', 'ilimitada', 'ilimitada'],
  ['Marca no rodapé',                        'sim', 'não', 'não'],
  ['Exportar confirmados',                   '—', '✓', '✓'],
  ['Site no ar após a festa',                '3 meses', '12 meses', '12 meses'],
  ['Suporte',                                '—', 'WhatsApp', 'contato direto'],
  ['Animações sob medida',                   '—', '—', '✓'],
]

const STEPS = [
  { num: 'I',   title: 'Crie o evento',     desc: 'Cadastre as informações da celebração: data, local, tipo de evento e tema visual.' },
  { num: 'II',  title: 'Personalize',        desc: 'Adicione fotos, lista de presentes e detalhes do traje. Tudo pelo painel admin.' },
  { num: 'III', title: 'Compartilhe o link', desc: 'Envie o link exclusivo para os convidados pelo WhatsApp, e-mail ou impresso no convite.' },
]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Funil: todo CTA leva à escolha do plano; o cadastro só aparece
  // depois que a pessoa escolhe (e o pagamento, depois do cadastro)
  const scrollToPlanos = () =>
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })

  const choosePlan = (planId) => {
    const dest = `/dashboard/novo?plano=${planId}`
    navigate(user ? dest : `/login?mode=signup&next=${encodeURIComponent(dest)}`)
  }

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
                  onClick={scrollToPlanos}
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
            Crie um site elegante e completo para casamento, 15 anos,
            aniversário, formatura, evento corporativo ou qualquer outra
            celebração. RSVP, galeria, presentes e muito mais — tudo em
            uma página com o seu link exclusivo.
          </p>

          <div className="landing-hero-btns">
            <button className="landing-btn-primary" onClick={scrollToPlanos}>
              Criar meu evento
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
            <text x="100" y="139" textAnchor="middle"
              fill="url(#grad1)" fontSize="24"
              fontFamily="serif" opacity="0.6">✦</text>
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

      {/* ── PLANOS ── */}
      <section className="landing-pricing" id="planos">
        <div className="landing-section-inner">
          <p className="landing-section-eyebrow">planos</p>
          <h2 className="landing-section-title">
            Um plano para cada celebração
          </h2>

          <div className="landing-plans">
            {PRICING.map((p) => (
              <div
                key={p.id}
                className={
                  'landing-plan-card'
                  + (p.highlight ? ' landing-plan-highlight' : '')
                }
              >
                {p.highlight && (
                  <span className="landing-plan-flag">mais escolhido</span>
                )}
                <p className="landing-plan-name">{p.name}</p>
                <p className="landing-plan-price">{p.price}</p>
                <p className="landing-plan-period">{p.period}</p>
                <p className="landing-plan-tagline">{p.tagline}</p>
                <ul className="landing-plan-bullets">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                {p.id === 'atelie' ? (
                  <a className="landing-plan-cta" href={ATELIE_CONTACT}>
                    {p.cta}
                  </a>
                ) : (
                  <button
                    className={
                      'landing-plan-cta'
                      + (p.highlight ? ' landing-plan-cta-primary' : '')
                    }
                    onClick={() => choosePlan(p.id)}
                  >
                    {p.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Ferramentas por plano */}
          <div className="landing-compare">
            <p className="landing-compare-title">Ferramentas por plano</p>
            <table className="landing-compare-table">
              <thead>
                <tr>
                  <th />
                  <th>Grátis</th>
                  <th>Completo</th>
                  <th>Ateliê</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(([label, ...cols]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    {cols.map((c, i) => (
                      <td
                        key={i}
                        className={c === '✓' ? 'landing-compare-yes' : ''}
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
          <button
            className="landing-btn-primary"
            onClick={user ? () => navigate('/dashboard') : scrollToPlanos}
          >
            {user ? 'Ir para o painel' : 'Começar agora'}
          </button>
        </div>
      </section>

    </div>
  )
}
