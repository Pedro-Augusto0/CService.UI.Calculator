export type GroupColor =
  | 'purple'
  | 'blue'
  | 'teal'
  | 'orange'
  | 'pink'
  | 'grey'
  | 'green'

export type GroupIconKey = 'shield' | 'briefcase' | 'settings' | 'eye'

export interface PermissionItem {
  id: string
  label: string
}

/** Ícone do cartão no editor de permissões (tema visual do módulo). */
export type PermissionCardIcon =
  | 'file-text'
  | 'users'
  | 'layout-grid'
  | 'circle-dollar-sign'
  | 'bar-chart-3'
  | 'shield'

export type PermissionCardAccent =
  | 'blue'
  | 'green'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'red'

export interface PermissionModule {
  title: string
  /** Texto de apoio no cabeçalho do cartão. */
  description: string
  icon: PermissionCardIcon
  accent: PermissionCardAccent
  items: PermissionItem[]
}

export interface AccessGroup {
  id: string
  name: string
  description: string
  color: GroupColor
  iconKey: GroupIconKey
  permissionIds: string[]
  /** Grupos inativos não aparecem para novas atribuições. */
  active?: boolean
}
