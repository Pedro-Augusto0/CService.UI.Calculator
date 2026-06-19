import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { loginApi, mapApiUser, meApi, registerApi } from '@/features/api/authApi'
import { useApi } from '@/features/api/config'
import { clearToken, readToken, writeToken } from '@/features/api/tokenStorage'
import { ApiError } from '@/features/api/client'
import { resolveIsAdminForNewUser } from './api/adminPolicy'
import { clearUrlHash, readHashConfigPrecos } from './appHash'
import { createInternalRegistrationField } from './api/internalRegistration'
import { hashPassword } from './api/passwordHash'
import type { AuthUser, StoredUser } from './types'
import {
  findUserByEmail,
  loadUsers,
  readSessionPayload,
  saveUsers,
  writeSessionPayload,
} from './api/userStorage'

interface AuthContextValue {
  user: AuthUser | null
  authLoading: boolean
  login: (input: {
    email: string
    password: string
    remember: boolean
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  register: (input: {
    name: string
    email: string
    password: string
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => void
  refreshSessionUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(record: StoredUser): AuthUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    isAdmin: record.isAdmin,
    isMasterAdmin: record.isMasterAdmin,
    internalField: record.internalField,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const apiEnabled = useApi()
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (apiEnabled) return null
    const session = readSessionPayload()
    if (!session) return null
    const found = loadUsers().find((u) => u.id === session.userId)
    if (!found) {
      writeSessionPayload(null)
      return null
    }
    return toAuthUser(found)
  })
  const [authLoading, setAuthLoading] = useState(apiEnabled)

  useEffect(() => {
    if (!apiEnabled) return
    const token = readToken()
    if (!token) {
      setAuthLoading(false)
      return
    }
    meApi()
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false))
  }, [apiEnabled])

  const login = useCallback<AuthContextValue['login']>(
    async ({ email, password, remember }) => {
      if (apiEnabled) {
        try {
          const response = await loginApi(email, password)
          writeToken(response.token, remember)
          setUser(mapApiUser(response.user))
          return { ok: true }
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : 'E-mail ou senha incorretos.'
          return { ok: false, message }
        }
      }

      const users = loadUsers()
      const existing = findUserByEmail(users, email)
      if (!existing) {
        return { ok: false, message: 'E-mail ou senha incorretos.' }
      }
      const hash = await hashPassword(password)
      if (hash !== existing.passwordHash) {
        return { ok: false, message: 'E-mail ou senha incorretos.' }
      }
      const now = Date.now()
      const withLogin = users.map((u) =>
        u.id === existing.id ? { ...u, lastLoginAt: now } : u,
      )
      saveUsers(withLogin)
      const refreshed = withLogin.find((u) => u.id === existing.id) ?? existing
      writeSessionPayload({ userId: refreshed.id, remember })
      setUser(toAuthUser(refreshed))
      return { ok: true }
    },
    [apiEnabled],
  )

  const register = useCallback<AuthContextValue['register']>(
    async ({ name, email, password }) => {
      if (apiEnabled) {
        try {
          await registerApi(name, email, password)
          return { ok: true }
        } catch (error) {
          const message =
            error instanceof ApiError
              ? (error.errors?.email?.[0] ?? error.message)
              : 'Não foi possível concluir o cadastro.'
          return { ok: false, message }
        }
      }

      const trimmedEmail = email.trim()
      const users = loadUsers()
      if (findUserByEmail(users, trimmedEmail)) {
        return { ok: false, message: 'Este e-mail já está cadastrado.' }
      }
      const passwordHash = await hashPassword(password)
      const record: StoredUser = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `usr_${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        passwordHash,
      isAdmin: resolveIsAdminForNewUser(trimmedEmail),
      internalField: createInternalRegistrationField(),
        createdAt: Date.now(),
      }
      saveUsers([...users, record])
      return { ok: true }
    },
    [apiEnabled],
  )

  const logout = useCallback(() => {
    if (typeof window !== 'undefined' && readHashConfigPrecos()) {
      clearUrlHash()
    }
    if (apiEnabled) clearToken()
    else writeSessionPayload(null)
    setUser(null)
  }, [apiEnabled])

  const refreshSessionUser = useCallback(() => {
    if (apiEnabled) {
      const token = readToken()
      if (!token) {
        setUser(null)
        return
      }
      meApi()
        .then((u) => setUser(u))
        .catch(() => {
          clearToken()
          setUser(null)
        })
      return
    }

    const session = readSessionPayload()
    if (!session) return
    const found = loadUsers().find((u) => u.id === session.userId)
    if (!found) {
      writeSessionPayload(null)
      setUser(null)
      return
    }
    setUser(toAuthUser(found))
  }, [apiEnabled])

  const value = useMemo(
    () => ({ user, authLoading, login, register, logout, refreshSessionUser }),
    [user, authLoading, login, register, logout, refreshSessionUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
