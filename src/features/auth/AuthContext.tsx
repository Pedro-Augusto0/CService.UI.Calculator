import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
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
  /** Recarrega o usuário da sessão a partir do armazenamento local. */
  refreshSessionUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(record: StoredUser): AuthUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    isAdmin: record.isAdmin,
    internalField: record.internalField,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = readSessionPayload()
    if (!session) return null
    const found = loadUsers().find((u) => u.id === session.userId)
    if (!found) {
      writeSessionPayload(null)
      return null
    }
    return toAuthUser(found)
  })

  const login = useCallback<
    AuthContextValue['login']
  >(async ({ email, password, remember }) => {
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
  }, [])

  const register = useCallback<
    AuthContextValue['register']
  >(async ({ name, email, password }) => {
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
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined' && readHashConfigPrecos()) {
      clearUrlHash()
    }
    writeSessionPayload(null)
    setUser(null)
  }, [])

  const refreshSessionUser = useCallback(() => {
    const session = readSessionPayload()
    if (!session) return
    const found = loadUsers().find((u) => u.id === session.userId)
    if (!found) {
      writeSessionPayload(null)
      setUser(null)
      return
    }
    setUser(toAuthUser(found))
  }, [])

  const value = useMemo(
    () => ({ user, login, register, logout, refreshSessionUser }),
    [user, login, register, logout, refreshSessionUser],
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
