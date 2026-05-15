/** Iniciais para avatar (ex.: "Maria Silva" → "MS"). */
export function initialsFromName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
  }
  const single = parts[0] ?? trimmed
  return single.slice(0, 2).toUpperCase()
}
