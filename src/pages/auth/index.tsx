import { AuthMarketingAside, LoginForm } from '@/pages/auth/components/AuthForms'
import { useAuthForms } from '@/pages/auth/hooks/useAuthForms'
import './AuthPage.css'

export function AuthPage() {
  const auth = useAuthForms()

  return (
    <div className="auth-root">
      <AuthMarketingAside />

      <div className="auth-panel-right">
        <div className="dots"></div>
        <div className="auth-card">
          <header className="auth-card__head">
            <h2 className="auth-card__title">Bem-vindo de volta!</h2>
            <p className="auth-card__subtitle">
              Faça login para acessar sua conta
            </p>
          </header>

          {auth.banner ? (
            <div
              className={`auth-banner auth-banner--${auth.banner.kind}`}
              role="status"
            >
              {auth.banner.text}
            </div>
          ) : null}

          <LoginForm
            loginEmail={auth.loginEmail}
            setLoginEmail={auth.setLoginEmail}
            loginPassword={auth.loginPassword}
            setLoginPassword={auth.setLoginPassword}
            remember={auth.remember}
            setRemember={auth.setRemember}
            showLoginPassword={auth.showLoginPassword}
            setShowLoginPassword={auth.setShowLoginPassword}
            busy={auth.busy}
            onSubmit={auth.handleLoginSubmit}
          />
        </div>

        <p className="auth-footer-note">
          <span className="auth-footer-note__lead">
            Acesso restrito. Contas são criadas pelo administrador master.
          </span>
        </p>
      </div>
    </div>
  )
}
