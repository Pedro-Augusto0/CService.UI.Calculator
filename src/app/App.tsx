import './App.css'
import { useAuth } from '@/features/auth/AuthContext'
import { ProposalProvider } from '@/features/proposal/ProposalProvider'
import { AuthPage } from '@/pages/auth'
import { MainAppRoutes } from '@/routes/main-app.routes'

export default function App() {
  const { user } = useAuth()
  if (!user) {
    return <AuthPage />
  }
  return (
    <ProposalProvider>
      <MainAppRoutes />
    </ProposalProvider>
  )
}
