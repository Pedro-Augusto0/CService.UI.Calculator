import type { SavedProposalRecord } from '@/features/proposal/lib/savedProposalStore'
import { REGION_LABELS } from '@/domain/prices'

export function collectExtraServices(record: SavedProposalRecord) {
  const a = record.state.additionals
  const r = record.state.reports
  const labels = [
    a.printEnabled ? 'Impresso' : null,
    a.webNationalEnabled ? 'Web (Nacional)' : null,
    a.webInternationalEnabled ? 'Web (Internacional)' : null,
    a.tvEnabled && a.tvRegion ? `TV ${REGION_LABELS[a.tvRegion]}` : null,
    a.radioEnabled && a.radioRegion ? `Rádio ${REGION_LABELS[a.radioRegion]}` : null,
    a.socialMediaEnabled ? 'Mídias Sociais' : null,
    a.storiesInstagramEnabled ? 'Stories Instagram' : null,
    a.webRealtimeAlerts ? 'Alertas web' : null,
    a.apiCService ? 'API CService' : null,
    a.newsletterWhatsApp ? 'Newsletter WhatsApp' : null,
    a.manualCuration ? 'Curadoria manual' : null,
    r.executiveEnabled ? 'Relatório Executivo' : null,
    r.strategicEnabled ? 'Relatório Estratégico' : null,
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
