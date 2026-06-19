import { getApiBaseUrl } from './config'
import { readToken } from './tokenStorage'

export class ApiError extends Error {
  status: number
  type?: string
  errors?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    type?: string,
    errors?: Record<string, string[]>,
  ) {
    super(message)
    this.status = status
    this.type = type
    this.errors = errors
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined)
    requestHeaders.set('Content-Type', 'application/json')

  if (auth) {
    const token = readToken()
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) return undefined as T

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new ApiError(
      payload?.title ?? payload?.message ?? 'Erro na requisição',
      response.status,
      payload?.type,
      payload?.errors,
    )
  }

  return payload as T
}
