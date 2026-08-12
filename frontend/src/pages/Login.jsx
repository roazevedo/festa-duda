import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/useAuth'
import './Login.css'

// O Google OAuth não aceita origens *.fly.dev (Public Suffix List), por isso
// o login Google só é habilitado com o domínio próprio: convidame.app está
// cadastrado nas Authorized JavaScript origins do Google Cloud Console.
const GOOGLE_LOGIN_ENABLED = true

export default function Login() {
  const { user, login, signup, verifyEmail, resendCode, loginWithGoogle } = useAuth()
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
  const [code, setCode]                   = useState('')
  const [error, setError]                 = useState('')
  const [info, setInfo]                   = useState('')
  const [loading, setLoading]             = useState(false)

  // O botão do Google (GIS) só aceita largura em PIXELS (máx. 400), não %.
  // Medimos a largura real do container e repassamos, pra ele acompanhar
  // o botão "Entrar".
  const googleWrapRef = useRef(null)
  const [googleBtnWidth, setGoogleBtnWidth] = useState(0)

  useEffect(() => {
    if (!GOOGLE_LOGIN_ENABLED) return
    const el = googleWrapRef.current
    if (!el) return
    const measure = () =>
      setGoogleBtnWidth(Math.min(400, Math.round(el.getBoundingClientRect().width)))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isSignup = mode === 'signup'
  const isVerify = mode === 'verify'

  // Quem já está logado não precisa ver o login de novo
  useEffect(() => {
    if (user) navigate(dest, { replace: true })
  }, [user, dest, navigate])

  // Leva ao passo de verificação de e-mail, guardando o e-mail em jogo.
  const goToVerify = (targetEmail) => {
    if (targetEmail) setEmail(targetEmail)
    setPassword('')
    setPasswordConf('')
    setCode('')
    setError('')
    setInfo(`Enviamos um código de 6 dígitos para ${targetEmail || email}.`)
    setMode('verify')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (isSignup && password !== passwordConf) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        const res = await signup(email, password, passwordConf)
        goToVerify(res?.email || email)
      } else {
        await login(email, password)
        navigate(dest)
      }
    } catch (err) {
      // Login de conta ainda não confirmada → manda para a verificação
      if (!isSignup && err?.response?.data?.unverified) {
        goToVerify(err.response.data.email || email)
        return
      }
      const msg = err?.response?.data?.errors?.[0]
        || err?.response?.data?.error
        || (isSignup ? 'Erro ao criar conta.' : 'Email ou senha inválidos.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await verifyEmail(email, code.trim())
      navigate(dest)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Código inválido ou expirado.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await resendCode(email)
      setInfo('Enviamos um novo código para o seu e-mail.')
    } catch {
      setError('Não foi possível reenviar agora. Tente novamente em instantes.')
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
    setInfo('')
    setEmail('')
    setPassword('')
    setPasswordConf('')
    setCode('')
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

        <p className="login-eyebrow">
          {isVerify ? 'confirmação' : isSignup ? 'nova conta' : 'área restrita'}
        </p>
        <h1 className="login-title">
          {isVerify ? 'Verifique seu e-mail' : isSignup ? 'Cadastro' : 'Acesso'}
        </h1>
        <p className="login-sub">
          {isVerify
            ? 'digite o código que enviamos'
            : isSignup ? 'crie sua conta gratuitamente' : 'administração do evento'}
        </p>

        {/* ── Passo de verificação por código ── */}
        {isVerify ? (
          <>
            <form onSubmit={handleVerify} className="login-form">
              <div className="login-field">
                <label className="login-label">Código de verificação</label>
                <input
                  className="login-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              {info && <p className="login-info">{info}</p>}
              {error && <p className="login-error">{error}</p>}

              <button className="login-btn" type="submit" disabled={loading || code.length < 6}>
                {loading ? 'Confirmando...' : 'Confirmar'}
              </button>
            </form>

            <div className="login-switch">
              <span className="login-switch-text">Não recebeu?</span>
              <button className="login-switch-btn" onClick={handleResend} disabled={loading}>
                Reenviar código
              </button>
            </div>

            <button className="login-back" onClick={() => { setMode('login'); setError(''); setInfo('') }}>
              ← usar outro e-mail
            </button>
          </>
        ) : (
        <>
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
            <div className="login-google-wrapper" ref={googleWrapRef}>
              {googleBtnWidth > 0 && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Erro ao autenticar com o Google.')}
                  text={isSignup ? 'signup_with' : 'signin_with'}
                  shape="rectangular"
                  theme="filled_black"
                  width={String(googleBtnWidth)}
                />
              )}
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
        </>
        )}

        <button className="login-back" onClick={() => navigate('/')}>
          ← voltar ao início
        </button>
      </div>
    </div>
  )
}
