import {
  ArrowRightCircle,
  Calculator,
  FileText,
  History,
  Mail,
  Lock,
  Eye,
  EyeOff,
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
    </form>
  )
}
