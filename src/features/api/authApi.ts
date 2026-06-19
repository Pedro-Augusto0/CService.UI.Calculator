import type { AuthUser } from '@/features/auth/types'
import { apiRequest } from './client'
import type { ApiAuthResponse, ApiAuthUser } from './types'

export function mapApiUser(user: ApiAuthUser): AuthUser {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin || user.isMasterAdmin,
    isMasterAdmin: user.isMasterAdmin,
    internalField: '',
  }
}

export async function loginApi(
  email: string,
  password: string,
): Promise<ApiAuthResponse> {
  return apiRequest<ApiAuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  })
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
): Promise<ApiAuthUser> {
  return apiRequest<ApiAuthUser>('/api/auth/register', {
    method: 'POST',
    auth: false,
    body: { name, email, password },
  })
}

export async function meApi(): Promise<AuthUser> {
  const user = await apiRequest<ApiAuthUser>('/api/auth/me')
  return mapApiUser(user)
}
