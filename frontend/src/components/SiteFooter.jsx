import { useLocation, Link } from 'react-router-dom'
import './SiteFooter.css'

// Footer global. Nas páginas da plataforma (home, login, painel)
// usa a paleta Convida.me; nos sites de evento acompanha as cores
// do tema do evento (via variáveis CSS aplicadas pelo tema).
export default function SiteFooter() {
  const { pathname } = useLocation()

  const isPlatform =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/privacidade')

  return (
    <footer className={'site-footer' + (isPlatform ? ' site-footer-brand' : '')}>
      <p className="site-footer-copy">© Convida.me 2026</p>
      <Link className="site-footer-link" to="/privacidade">
        Política de Privacidade
      </Link>
    </footer>
  )
}
