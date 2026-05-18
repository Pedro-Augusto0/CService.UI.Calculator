import type { AccessGroup, GroupColor } from './types'
import { getAllPermissionIds } from './permissions'

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

function seedGroups(): AccessGroup[] {
  const all = getAllPermissionIds()

  const comercial = [
    'proposals.view',
    'proposals.create',
    'clients.view',
    'clients.create',
    'templates.view',
    'templates.create',
    'reports.view',
    'reports.export',
  ]

  const operador = [
    'proposals.view',
    'proposals.create',
    'proposals.edit',
    'clients.view',
    'clients.edit',
    'templates.view',
    'templates.edit',
    'reports.view',
  ]

  const leitura = [
    'proposals.view',
    'clients.view',
    'templates.view',
    'reports.view',
  ]

  return [
    {
      id: 'grp-administrador',
      name: 'Administrador',
      description:
        'Acesso total à plataforma, configurações e administração.',
      color: 'green',
      iconKey: 'shield',
      permissionIds: [...all],
      active: true,
    },
    {
      id: 'grp-comercial',
      name: 'Comercial',
      description:
        'Criação de propostas, clientes e modelos. Sem acesso a configurações críticas.',
      color: 'pink',
      iconKey: 'briefcase',
      permissionIds: comercial,
      active: true,
    },
    {
      id: 'grp-operador',
      name: 'Operador',
      description:
        'Operações do dia a dia com edição de propostas e clientes.',
      color: 'blue',
      iconKey: 'settings',
      permissionIds: operador,
      active: true,
    },
    {
      id: 'grp-leitura',
      name: 'Leitura',
      description: 'Apenas visualização de propostas, clientes e relatórios.',
      color: 'orange',
      iconKey: 'eye',
      permissionIds: leitura,
      active: true,
    },
  ]
}

export function loadAccessGroups(): AccessGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = seedGroups()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = seedGroups()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const normalized = (parsed as AccessGroup[]).map(normalizeAccessGroup)
    return normalized
  } catch {
    const seed = seedGroups()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    } catch {
      /* ignore */
    }
    return seed
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
