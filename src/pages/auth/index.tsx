import {
  AuthMarketingAside,
  LoginForm,
  RegisterForm,
} from '@/pages/auth/components/AuthForms'
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
            {auth.mode === 'login' ? (
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

          {auth.banner ? (
            <div
              className={`auth-banner auth-banner--${auth.banner.kind}`}
              role="status"
            >
              {auth.banner.text}
            </div>
          ) : null}

          {auth.mode === 'login' ? (
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
              onSwitchToRegister={() => {
                auth.clearBanner()
                auth.setMode('register')
              }}
            />
          ) : (
            <RegisterForm
              regName={auth.regName}
              setRegName={auth.setRegName}
              regEmail={auth.regEmail}
              setRegEmail={auth.setRegEmail}
              regPassword={auth.regPassword}
              setRegPassword={auth.setRegPassword}
              showRegPassword={auth.showRegPassword}
              setShowRegPassword={auth.setShowRegPassword}
              busy={auth.busy}
              onSubmit={auth.handleRegisterSubmit}
              onSwitchToLogin={() => {
                auth.clearBanner()
                auth.setMode('login')
              }}
            />
          )}
        </div>

        {auth.mode === 'login' ? (
          <p className="auth-footer-note">
            <span className="auth-footer-note__lead">Não tem uma conta?</span>{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                auth.clearBanner()
                auth.setMode('register')
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
                auth.clearBanner()
                auth.setMode('login')
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
