export function downloadHtmlDocument(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function slugifyFileSegment(value: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'proposta-monitoramento'
}

export function proposalFilename(
  clientName?: string,
  proposalNumber?: number,
): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const clientSlug = slugifyFileSegment(clientName ?? '')
  const numberSuffix = proposalNumber
    ? `-${String(proposalNumber).padStart(4, '0')}`
    : ''

  return `${clientSlug}${numberSuffix}-${y}${m}${day}.html`
}
