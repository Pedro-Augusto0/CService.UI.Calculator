import { apiRequest } from './client'
import type { ApiClient, ApiPagedResult } from './types'

export async function fetchClients(
  query = '',
  activeOnly = false,
): Promise<ApiClient[]> {
  const params = new URLSearchParams({
    page: '1',
    pageSize: '100',
    activeOnly: String(activeOnly),
  })
  if (query.trim()) params.set('query', query.trim())

  const result = await apiRequest<ApiPagedResult<ApiClient>>(
    `/api/clients?${params.toString()}`,
  )
  return result.items
}

export async function createClientApi(name: string): Promise<ApiClient> {
  return apiRequest<ApiClient>('/api/clients', {
    method: 'POST',
    body: { name: name.trim() },
  })
}

export async function updateClientApi(
  id: number,
  input: { name?: string; isActive?: boolean },
): Promise<ApiClient> {
  return apiRequest<ApiClient>(`/api/clients/${id}`, {
    method: 'PATCH',
    body: input,
  })
}
