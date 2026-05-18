import type { AccessGroup, GroupColor } from './types'

const STORAGE_KEY = 'cservice_access_groups'

const VALID_COLORS: GroupColor[] = [
  'purple',
  'blue',
  'teal',
  'orange',
  'pink',
  'grey',
  'green',
]

function coerceColor(raw: string | undefined): GroupColor {
  if (raw && VALID_COLORS.includes(raw as GroupColor)) return raw as GroupColor
  return 'blue'
}

/** Normaliza dados antigos do localStorage (cores renomeadas, novos campos). */
export function normalizeAccessGroup(g: AccessGroup): AccessGroup {
  return {
    ...g,
    color: coerceColor(g.color as unknown as string),
    active: g.active !== false,
    iconKey: g.iconKey ?? 'shield',
    permissionIds: Array.isArray(g.permissionIds) ? g.permissionIds : [],
  }
}


export function loadAccessGroups(): AccessGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = JSON.parse(raw ?? '[]') as unknown

    const normalized = (parsed as AccessGroup[]).map(normalizeAccessGroup)
    return normalized
  } catch {
    return []
  }
}

export function saveAccessGroups(groups: AccessGroup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
}

export function permissionsSummaryLabel(
  permissionIds: string[],
  total: number,
): string {
  if (permissionIds.length >= total) return 'Acesso total'
  if (permissionIds.length === 0) return 'Sem permissões'
  const n = permissionIds.length
  return `${n} ${n === 1 ? 'permissão' : 'permissões'}`
}
