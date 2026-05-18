import {
  normalizeUserGroupIds,
  withUserGroupIds,
} from '@/features/auth/groupIds'
import type { AuthSessionPayload, StoredUser } from '../types'

const USERS_KEY = 'cservice_auth_users'
const SESSION_LOCAL_KEY = 'cservice_auth_session'
const SESSION_SESSION_KEY = 'cservice_auth_session_tab'

function migrateStoredUserPayload(u: StoredUser): StoredUser {
  const base = { ...u }
  if (
    base.groupId !== undefined &&
    base.groupId !== null &&
    String(base.groupId).trim() === ''
  ) {
    delete base.groupId
  }
  const ids = normalizeUserGroupIds(base)
  return withUserGroupIds(base, ids)
}

export function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    let needsSave = false
    const migrated = parsed.map((u) => {
      const before = JSON.stringify(u)
      const nu = migrateStoredUserPayload(u as StoredUser)
      if (before !== JSON.stringify(nu)) needsSave = true
      return nu
    })
    if (needsSave) {
      localStorage.setItem(USERS_KEY, JSON.stringify(migrated))
    }
    return migrated
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function findUserByEmail(
  users: StoredUser[],
  email: string,
): StoredUser | undefined {
  const key = email.trim().toLowerCase()
  return users.find((u) => u.email.toLowerCase() === key)
}

export function readSessionPayload(): AuthSessionPayload | null {
  const fromTab = sessionStorage.getItem(SESSION_SESSION_KEY)
  if (fromTab) {
    try {
      return JSON.parse(fromTab) as AuthSessionPayload
    } catch {
      return null
    }
  }
  const fromLocal = localStorage.getItem(SESSION_LOCAL_KEY)
  if (fromLocal) {
    try {
      return JSON.parse(fromLocal) as AuthSessionPayload
    } catch {
      return null
    }
  }
  return null
}

export function writeSessionPayload(
  payload: AuthSessionPayload | null,
): void {
  sessionStorage.removeItem(SESSION_SESSION_KEY)
  localStorage.removeItem(SESSION_LOCAL_KEY)
  if (!payload) return
  if (payload.remember) {
    localStorage.setItem(SESSION_LOCAL_KEY, JSON.stringify(payload))
  } else {
    sessionStorage.setItem(SESSION_SESSION_KEY, JSON.stringify(payload))
  }
}
