import { useNavigate } from 'react-router-dom'
import './Privacy.css'

// Política de privacidade da plataforma. Enxuta e honesta: só descreve
// o que a plataforma realmente faz hoje (sem trackers de terceiros).
// Segue o design índigo + ouro da landing (nav, logo e eyebrow).
export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="privacy">

      {/* ── NAV ── */}
      <nav className="privacy-nav">
        <div className="privacy-nav-inner">
          <button className="privacy-logo" onClick={() => navigate('/')}>
            Convida<span>.me</span>
          </button>
          <button className="privacy-nav-btn" onClick={() => navigate('/')}>
            Início
          </button>
        </div>
      </nav>

      <main className="privacy-main">
        <p className="privacy-eyebrow">Política de Privacidade</p>
        <h1 className="privacy-title">Como cuidamos dos seus dados</h1>
        <p className="privacy-updated">Última atualização: 20 de julho de 2026</p>

        <section className="privacy-section">
          <h2>Quais dados coletamos</h2>
          <p>
            Para criar sua conta, guardamos seu nome e e-mail. Ao criar um
            evento, guardamos as informações que você adiciona ao site (nome
            do evento, data, local, textos e imagens). As confirmações de
            presença e mensagens deixadas pelos seus convidados também ficam
            associadas ao seu evento.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Informações guardadas no seu navegador</h2>
          <p>
            Guardamos localmente, no seu navegador, um código de sessão que
            mantém você conectado após o login. Também salvamos
            temporariamente os rascunhos do que você está preenchendo — como
            a criação de um evento, a confirmação de presença ou edições do
            site ainda não salvas — para que você não perca o progresso caso
            saia e volte. Esses rascunhos ficam apenas no seu dispositivo e
            são apagados automaticamente após 24 horas.
          </p>
          <p>
            Não utilizamos cookies de rastreamento, nem ferramentas de
            análise ou publicidade de terceiros.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Pagamentos</h2>
          <p>
            Os pagamentos de presentes e de planos são processados pelo
            Mercado Pago. Os dados do seu cartão são tratados diretamente por
            eles — nós não armazenamos dados de cartão. Guardamos apenas o
            registro do pagamento (valor, status e identificador) para
            controlar o repasse e o histórico do evento.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a
            qualquer momento, conforme a Lei Geral de Proteção de Dados
            (LGPD). Para isso, entre em contato pelo e-mail{' '}
            <a href="mailto:contato@convida.me">contato@convida.me</a>.
          </p>
        </section>
      </main>
    </div>
  )
}
