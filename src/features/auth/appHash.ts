/** Hash usado para deep-link da configuração de preços (apenas admins). */
export const CONFIGURACAO_PRECOS_HASH = '#configuracao-precos'

export function readHashConfigPrecos(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hash === CONFIGURACAO_PRECOS_HASH
}

export function setHashConfigPrecos(): void {
  if (typeof window === 'undefined') return
  window.location.hash = CONFIGURACAO_PRECOS_HASH.replace(/^#/, '')
}

export function clearUrlHash(): void {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  window.history.replaceState(null, '', pathname + search)
}
