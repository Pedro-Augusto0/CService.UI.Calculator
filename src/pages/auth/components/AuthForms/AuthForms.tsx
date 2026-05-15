import {
  ArrowRightCircle,
  Calculator,
  FileText,
  History,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserRound,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import backgroundPng from '@/assets/background.png'
import logoClipping from '@/assets/logocs-aberto.png'

export function AuthMarketingAside() {
  return (
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
  )
}

interface LoginFormProps {
  loginEmail: string
  setLoginEmail: (v: string) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  remember: boolean
  setRemember: (v: boolean) => void
  showLoginPassword: boolean
  setShowLoginPassword: (v: boolean | ((p: boolean) => boolean)) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
  onSwitchToRegister: () => void
}

export function LoginForm({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  remember,
  setRemember,
  showLoginPassword,
  setShowLoginPassword,
  busy,
  onSubmit,
  onSwitchToRegister,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
            aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
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

      <button type="submit" className="auth-submit" disabled={busy}>
        <ArrowRightCircle size={20} strokeWidth={2} aria-hidden />
        Entrar na plataforma
      </button>

      <div className="auth-sep">ou</div>

      <button
        type="button"
        className="auth-secondary"
        onClick={onSwitchToRegister}
      >
        Criar conta
      </button>
    </form>
  )
}

interface RegisterFormProps {
  regName: string
  setRegName: (v: string) => void
  regEmail: string
  setRegEmail: (v: string) => void
  regPassword: string
  setRegPassword: (v: string) => void
  showRegPassword: boolean
  setShowRegPassword: (v: boolean | ((p: boolean) => boolean)) => void
  busy: boolean
  onSubmit: (e: React.FormEvent) => void
  onSwitchToLogin: () => void
}

export function RegisterForm({
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  showRegPassword,
  setShowRegPassword,
  busy,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
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
            aria-label={showRegPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
        <button type="button" className="auth-link" onClick={onSwitchToLogin}>
          Voltar ao login
        </button>
      </div>

      <button type="submit" className="auth-submit" disabled={busy}>
        <ArrowRightCircle size={20} strokeWidth={2} aria-hidden />
        Cadastrar
      </button>
    </form>
  )
}
