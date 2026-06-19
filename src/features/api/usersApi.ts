import type { StoredUser } from '@/features/auth/types'
import { apiRequest } from './client'
import type { ApiPagedResult, ApiUserListItem } from './types'

export type CreateUserRole = 'user' | 'admin' | 'master'

export function userToRole(
  user: Pick<StoredUser, 'isAdmin' | 'isMasterAdmin'>,
): CreateUserRole {
  if (user.isMasterAdmin) return 'master'
  if (user.isAdmin) return 'admin'
  return 'user'
}

export function roleToFlags(role: CreateUserRole) {
  const isMasterAdmin = role === 'master'
  return {
    isAdmin: role === 'admin' || isMasterAdmin,
    isMasterAdmin,
  }
}

function toStoredUser(user: ApiUserListItem): StoredUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    passwordHash: '',
    isAdmin: user.isAdmin || user.isMasterAdmin,
    isMasterAdmin: user.isMasterAdmin,
    isActive: user.isActive,
    internalField: '',
    createdAt: user.createdAt,
  }
}

export async function fetchUsers(query = ''): Promise<StoredUser[]> {
  const params = new URLSearchParams({
    page: '1',
    pageSize: '100',
    role: 'all',
  })
  if (query.trim()) params.set('query', query.trim())

  const result = await apiRequest<ApiPagedResult<ApiUserListItem>>(
    `/api/users?${params.toString()}`,
  )
  return result.items.map(toStoredUser)
}

export async function updateUserApi(
  id: string,
  input: {
    name: string
    role: CreateUserRole
    isActive: boolean
    password?: string
  },
): Promise<void> {
  const { isAdmin, isMasterAdmin } = roleToFlags(input.role)

  await apiRequest(`/api/users/${id}`, {
    method: 'PATCH',
    body: {
      name: input.name.trim(),
      isAdmin,
      isMasterAdmin,
      isActive: input.isActive,
      ...(input.password ? { password: input.password } : {}),
    },
  })
}

export async function deleteUserApi(id: string): Promise<void> {
  await apiRequest(`/api/users/${id}`, { method: 'DELETE' })
}

export async function createUserApi(input: {
  name: string
  email: string
  password: string
  role: CreateUserRole
}): Promise<void> {
  const isMasterAdmin = input.role === 'master'
  const isAdmin = input.role === 'admin' || isMasterAdmin

  await apiRequest('/api/users', {
    method: 'POST',
    body: {
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      isAdmin,
      isMasterAdmin,
    },
  })
}
