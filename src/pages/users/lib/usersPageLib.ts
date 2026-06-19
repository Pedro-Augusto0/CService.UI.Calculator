import type { StoredUser } from '@/features/auth/types'

export const MS_DAY = 24 * 60 * 60 * 1000
export const ACTIVE_WINDOW_MS = 30 * MS_DAY

export const AVATAR_PALETTES = [
  { bg: '#3b82f6', fg: '#fff' },
  { bg: '#ec4899', fg: '#fff' },
  { bg: '#06b6d4', fg: '#fff' },
  { bg: '#8b5cf6', fg: '#fff' },
  { bg: '#14b8a6', fg: '#fff' },
] as const

export type RoleFilter = 'all' | 'admin' | 'user'

export function paletteForId(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * 17) % 997
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length]
}

export function activityTimestamp(u: StoredUser): number {
  return u.lastLoginAt ?? u.createdAt
}

export function isActiveInWindow(u: StoredUser, now: number): boolean {
  return now - activityTimestamp(u) <= ACTIVE_WINDOW_MS
}

export function formatDatePt(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatTimePt(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
