import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

export type AuthMode = 'login' | 'register'

export interface AuthBannerState {
  kind: 'error' | 'success'
  text: string
}

export function useAuthForms() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<AuthBannerState | null>(null)

  const clearBanner = useCallback(() => setBanner(null), [])

  const handleLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
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
      }
    },
    [login, loginEmail, loginPassword, remember],
  )

  const handleRegisterSubmit = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [register, regEmail, regName, regPassword],
  )

  return {
    mode,
    setMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    remember,
    setRemember,
    showLoginPassword,
    setShowLoginPassword,
    regName,
    setRegName,
    regEmail,
    setRegEmail,
    regPassword,
    setRegPassword,
    showRegPassword,
    setShowRegPassword,
    busy,
    banner,
    clearBanner,
    handleLoginSubmit,
    handleRegisterSubmit,
  }
}
