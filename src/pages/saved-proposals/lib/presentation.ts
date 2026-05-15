import type { SavedProposalRecord } from '@/features/proposal/lib/savedProposalStore'

export function collectExtraServices(record: SavedProposalRecord) {
  const labels = [
    record.state.additionals.midiasSociais ? 'Mídias Sociais' : null,
    record.state.additionals.alertasWeb ? 'Alertas WebSites' : null,
    record.state.additionals.api ? 'API' : null,
    record.state.additionals.stories ? 'Stories' : null,
    record.state.additionals.destaques ? 'Destaques' : null,
    record.state.broadcast.tvEnabled ? 'TV' : null,
    record.state.broadcast.radioEnabled ? 'Rádio' : null,
    record.state.broadcast.relatorioEnabled ? 'Relatório' : null,
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
