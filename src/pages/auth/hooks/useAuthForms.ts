import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

export interface AuthBannerState {
  kind: 'error' | 'success'
  text: string
}

export function useAuthForms() {
  const { login } = useAuth()

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showLoginPassword, setShowLoginPassword] = useState(false)

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

  return {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    remember,
    setRemember,
    showLoginPassword,
    setShowLoginPassword,
    busy,
    banner,
    clearBanner,
    handleLoginSubmit,
  }
}
