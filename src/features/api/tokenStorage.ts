const TOKEN_KEY = 'cservice_calculator_jwt'

export function readToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function writeToken(token: string | null, remember: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  if (!token) return
  if (remember) localStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  writeToken(null, false)
}
