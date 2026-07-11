import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/useAuth'
import './Login.css'

// O Google OAuth não aceita origens *.fly.dev (Public Suffix List).
// Reative quando o site tiver domínio próprio cadastrado nas
// Authorized JavaScript origins do Google Cloud Console.
const GOOGLE_LOGIN_ENABLED = false

export default function Login() {
  const { user, login, signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Destino pós-login: ?next=/rota (somente caminhos internos)
  const next = searchParams.get('next')
  const dest = next?.startsWith('/') ? next : '/dashboard'

  const [mode, setMode] = useState(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  )
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [passwordConf, setPasswordConf]   = useState('')
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)

  const isSignup = mode === 'signup'

  // Quem já está logado não precisa ver o login de novo
  useEffect(() => {
    if (user) navigate(dest, { replace: true })
  }, [user, dest, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isSignup && password !== passwordConf) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        await signup(email, password, passwordConf)
      } else {
        await login(email, password)
      }
      navigate(dest)
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]
        || err?.response?.data?.error
        || (isSignup ? 'Erro ao criar conta.' : 'Email ou senha inválidos.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async ({ credential }) => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle(credential)
      navigate(dest)
    } catch {
      setError('Erro ao autenticar com o Google.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login')
    setError('')
    setEmail('')
    setPassword('')
    setPasswordConf('')
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <button
          className="login-platform-logo"
          onClick={() => navigate('/')}
        >
          Convida<span>.me</span>
        </button>

        <p className="login-eyebrow">{isSignup ? 'nova conta' : 'área restrita'}</p>
        <h1 className="login-title">{isSignup ? 'Cadastro' : 'Acesso'}</h1>
        <p className="login-sub">
          {isSignup ? 'crie sua conta gratuitamente' : 'administração do evento'}
        </p>

        {/* ── Formulário manual ── */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignup && (
            <div className="login-field">
              <label className="login-label">Confirmar senha</label>
              <input
                className="login-input"
                type="password"
                value={passwordConf}
                onChange={e => setPasswordConf(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading
              ? (isSignup ? 'Criando conta...' : 'Entrando...')
              : (isSignup ? 'Criar conta' : 'Entrar')}
          </button>
        </form>

        {GOOGLE_LOGIN_ENABLED && (
          <>
            {/* ── Divisor ── */}
            <div className="login-divider">
              <span>ou</span>
            </div>

            {/* ── Botão Google ── */}
            <div className="login-google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Erro ao autenticar com o Google.')}
                text={isSignup ? 'signup_with' : 'signin_with'}
                shape="rectangular"
                theme="filled_black"
                width="100%"
              />
            </div>
          </>
        )}

        {/* ── Alternar entre login e cadastro ── */}
        <div className="login-switch">
          <span className="login-switch-text">
            {isSignup ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          </span>
          <button className="login-switch-btn" onClick={switchMode}>
            {isSignup ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <button className="login-back" onClick={() => navigate('/')}>
          ← voltar ao início
        </button>
      </div>
    </div>
  )
}
