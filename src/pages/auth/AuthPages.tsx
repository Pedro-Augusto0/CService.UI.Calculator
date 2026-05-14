import {
  ArrowRightCircle,
  Calculator,
  FileText,
  History,
  Lock,
  Mail,
  UserRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import backgroundPng from '../../assets/background.png'
import logoClipping from '../../assets/result_logo_clipping_bg-removed.png'
import { useAuth } from '../../auth/AuthContext'
import './AuthPages.css'

type Mode = 'login' | 'register'

export function AuthPages() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<{
    kind: 'error' | 'success'
    text: string
  } | null>(null)

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBanner(null)
    setBusy(true)
    const result = await login({
      email: loginEmail,
      password: loginPassword,
      remember,
    })
    setBusy(false)
    if (!result.ok) {
      setBanner({ kind: 'error', text: result.message })
      return
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBanner(null)
    setBusy(true)
    const result = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
    })
    setBusy(false)
    if (!result.ok) {
      setBanner({ kind: 'error', text: result.message })
      return
    }
    setBanner({
      kind: 'success',
      text: 'Conta criada. Faça login com seu e-mail e senha.',
    })
    setMode('login')
    setLoginEmail(regEmail.trim())
    setLoginPassword('')
  }

  return (
    <div
      className="auth-root"

    >
      <div
        className="auth-panel-left"
        style={
          {
            '--auth-background-url': `url(${backgroundPng})`,
          } as CSSProperties
        }
        aria-hidden={false}
      >
        <div className="auth-panel-left__content">
          <header className="auth-panel-left__intro">
            <div className="auth-brand">
              <img
                className="auth-brand__logo"
                src={logoClipping}
                alt="CService"
              />
              <p className="auth-brand__sub">Calculadora de propostas</p>
            </div>

            <h1 className="auth-hero-title">
              Mais agilidade para{' '}
              <em className="auth-hero-title__accent">suas propostas.</em>
            </h1>
            <p className="auth-hero-lead">
              Centralize cálculos, personalize serviços e envie propostas
              profissionais de forma rápida e inteligente.
            </p>

            <ul className="auth-features" aria-label="Benefícios da plataforma">
              <li className="auth-feature">
                <div className="auth-feature__icon" aria-hidden>
                  <Calculator size={20} strokeWidth={1.8} />
                </div>
                <div className="auth-feature__body">
                  <h2 className="auth-feature__title">Cálculos precisos</h2>
                  <p className="auth-feature__text">
                    Parâmetros inteligentes e atualizados
                  </p>
                </div>
              </li>
              <li className="auth-feature">
                <div className="auth-feature__icon" aria-hidden>
                  <FileText size={20} strokeWidth={1.8} />
                </div>
                <div className="auth-feature__body">
                  <h2 className="auth-feature__title">Propostas profissionais</h2>
                  <p className="auth-feature__text">
                    Modelos modernos e personalizáveis
                  </p>
                </div>
              </li>
              <li className="auth-feature">
                <div className="auth-feature__icon" aria-hidden>
                  <History size={20} strokeWidth={1.8} />
                </div>
                <div className="auth-feature__body">
                  <h2 className="auth-feature__title">Gestão completa</h2>
                  <p className="auth-feature__text">
                    Histórico, clientes e acompanhamento
                  </p>
                </div>
              </li>
            </ul>
          </header>
        </div>
      </div>

      <div className="auth-panel-right">
        <div className="dots"></div>
        <div className="auth-card">
          <header className="auth-card__head">
            {mode === 'login' ? (
              <>
                <h2 className="auth-card__title">Bem-vindo de volta!</h2>
                <p className="auth-card__subtitle">
                  Faça login para acessar sua conta
                </p>
              </>
            ) : (
              <>
                <h2 className="auth-card__title">Criar conta</h2>
                <p className="auth-card__subtitle">
                  Informe seus dados para começar a usar a calculadora
                </p>
              </>
            )}
          </header>

          {banner ? (
            <div
              className={`auth-banner auth-banner--${banner.kind}`}
              role="status"
            >
              {banner.text}
            </div>
          ) : null}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-login-email">
                  E-mail
                </label>
                <div className="auth-input-shell">
                  <Mail size={18} strokeWidth={1.8} aria-hidden />
                  <input
                    id="auth-login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(ev) => setLoginEmail(ev.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-login-password">
                  Senha
                </label>
                <div className="auth-input-shell">
                  <Lock size={18} strokeWidth={1.8} aria-hidden />
                  <input
                    id="auth-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(ev) => setLoginPassword(ev.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowLoginPassword((v) => !v)}
                    aria-label={
                      showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-row-options">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(ev) => setRemember(ev.target.checked)}
                  />
                  Lembrar de mim
                </label>
                <button type="button" className="auth-link">
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={busy}
              >
                <ArrowRightCircle size={20} strokeWidth={2} aria-hidden />
                Entrar na plataforma
              </button>

              <div className="auth-sep">ou</div>

              <button
                type="button"
                className="auth-secondary"
                onClick={() => {
                  setBanner(null)
                  setMode('register')
                }}
              >
                Criar conta
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-reg-name">
                  Nome
                </label>
                <div className="auth-input-shell">
                  <UserRound size={18} strokeWidth={1.8} aria-hidden />
                  <input
                    id="auth-reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Seu nome completo"
                    value={regName}
                    onChange={(ev) => setRegName(ev.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-reg-email">
                  E-mail
                </label>
                <div className="auth-input-shell">
                  <Mail size={18} strokeWidth={1.8} aria-hidden />
                  <input
                    id="auth-reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={regEmail}
                    onChange={(ev) => setRegEmail(ev.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-reg-password">
                  Senha
                </label>
                <div className="auth-input-shell">
                  <Lock size={18} strokeWidth={1.8} aria-hidden />
                  <input
                    id="auth-reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    value={regPassword}
                    onChange={(ev) => setRegPassword(ev.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowRegPassword((v) => !v)}
                    aria-label={
                      showRegPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showRegPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-row-options auth-row-options--solo">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setBanner(null)
                    setMode('login')
                  }}
                >
                  Voltar ao login
                </button>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={busy}
              >
                <ArrowRightCircle size={20} strokeWidth={2} aria-hidden />
                Cadastrar
              </button>
            </form>
          )}
        </div>

        {mode === 'login' ? (
          <p className="auth-footer-note">
            <span className="auth-footer-note__lead">Não tem uma conta?</span>{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setBanner(null)
                setMode('register')
              }}
            >
              Fale com nosso time comercial →
            </button>
          </p>
        ) : (
          <p className="auth-footer-note">
            <span className="auth-footer-note__lead">Já possui acesso?</span>{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setBanner(null)
                setMode('login')
              }}
            >
              Voltar ao login
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
