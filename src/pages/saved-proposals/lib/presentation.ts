import type { SavedProposalRecord } from '@/features/proposal/lib/savedProposalStore'

export function collectExtraServices(record: SavedProposalRecord) {
  const a = record.state.additionals
  const r = record.state.reports
  const labels = [
    a.midiasSociaisEnabled ? 'Mídias Sociais' : null,
    a.storiesInstagramEnabled ? 'Stories Instagram' : null,
    a.alertasWebRealtime ? 'Alertas web' : null,
    a.apiCService ? 'API CService' : null,
    a.newsletterWhatsApp ? 'Newsletter WhatsApp' : null,
    a.curadoriaAprovacaoManual ? 'Curadoria manual' : null,
    a.tvEnabled ? 'TV' : null,
    a.radioEnabled ? 'Rádio' : null,
    r.executivoEnabled ? 'Relatório Executivo' : null,
    r.estrategicoEnabled ? 'Relatório Estratégico' : null,
    r.biEnabled ? 'CService BI' : null,
  ]

  return labels.filter(Boolean) as string[]
}

export function formatEditedAt(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(timestamp)
}

export function formatCalendarEdit(timestamp: number) {
  const editedAt = new Date(timestamp)
  const now = new Date()
  const startOfEditedDay = new Date(
    editedAt.getFullYear(),
    editedAt.getMonth(),
    editedAt.getDate(),
  )
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round(
    (startOfEditedDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  )
  const timeLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)

  if (diffDays === 0) return `Editada hoje às ${timeLabel}`
  if (diffDays === -1) return `Editada ontem às ${timeLabel}`

  const dateLabel = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(timestamp)
  return `Editada em ${dateLabel} às ${timeLabel}`
}
