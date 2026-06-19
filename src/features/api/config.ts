export const API_SERVICE_PREFIX = '/CServiceProposalCalculator'

export function useApi(): boolean {
  return import.meta.env.VITE_USE_API === 'true'
}

export function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_API_URL ?? 'https://localhost:7264/Utility'
  return `${base.replace(/\/$/, '')}${API_SERVICE_PREFIX}`
}