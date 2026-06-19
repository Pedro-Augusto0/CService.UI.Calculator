import './App.css'
import { useAuth } from '@/features/auth/AuthContext'
import { ProposalProvider } from '@/features/proposal/ProposalProvider'
import { AuthPage } from '@/pages/auth'
import { MainAppRoutes } from '@/routes/main-app.routes'

export default function App() {
  const { user, authLoading } = useAuth()
  if (authLoading) {
    return (
      <div className="app-root" style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando…
      </div>
    )
  }
  if (!user) {
    return <AuthPage />
  }
  return (
    <ProposalProvider>
      <MainAppRoutes />
    </ProposalProvider>
  )
}
