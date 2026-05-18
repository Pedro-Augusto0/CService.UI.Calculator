import type { ComponentType } from 'react'
import {
  BarChart3,
  Briefcase,
  CircleDollarSign,
  Eye,
  FileText,
  LayoutGrid,
  Settings2,
  Shield,
  Users,
} from 'lucide-react'
import type {
  GroupColor,
  PermissionCardIcon,
} from '@/features/access-groups/types'
import { userBelongsToGroup } from '@/features/auth/groupIds'
import type { StoredUser } from '@/features/auth/types'
import { loadUsers } from '@/features/auth/api/userStorage'

export const DESCRIPTION_MAX = 200

export const GROUP_COLORS_ORDER: GroupColor[] = [
  'purple',
  'blue',
  'teal',
  'green',
  'orange',
  'pink',
  'grey',
]

export function newGroupId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  return `grp-${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`
}

export const ICON_MAP = {
  shield: Shield,
  briefcase: Briefcase,
  settings: Settings2,
  eye: Eye,
} as const

export const CARD_ICON_MAP: Record<
  PermissionCardIcon,
  ComponentType<{ size?: number; strokeWidth?: number }>
> = {
  'file-text': FileText,
  users: Users,
  'layout-grid': LayoutGrid,
  'circle-dollar-sign': CircleDollarSign,
  'bar-chart-3': BarChart3,
  shield: Shield,
}

export const COLOR_STYLES: Record<
  GroupColor,
  { bg: string; fg: string; soft: string }
> = {
  purple: { bg: '#7c3aed', fg: '#fff', soft: '#ede9fe' },
  blue: { bg: '#2563eb', fg: '#fff', soft: '#dbeafe' },
  teal: { bg: '#0d9488', fg: '#fff', soft: '#ccfbf1' },
  green: { bg: '#16a34a', fg: '#fff', soft: '#dcfce7' },
  orange: { bg: '#ea580c', fg: '#fff', soft: '#ffedd5' },
  pink: { bg: '#db2777', fg: '#fff', soft: '#fce7f3' },
  grey: { bg: '#475569', fg: '#fff', soft: '#e2e8f0' },
}

export function countUsersForGroup(groupId: string): number {
  return loadUsers().filter((u) => userBelongsToGroup(u, groupId)).length
}

export function usersAssignedToGroup(groupId: string): StoredUser[] {
  return loadUsers().filter((u) => userBelongsToGroup(u, groupId))
}
