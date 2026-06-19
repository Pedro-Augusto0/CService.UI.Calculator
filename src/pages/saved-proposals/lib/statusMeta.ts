import type { SavedProposalStatus } from '@/features/proposal/lib/savedProposalStore'

export const STATUS_LABELS: Record<SavedProposalStatus, string> = {
  draft: 'Rascunho',
  sent: 'Enviada',
  approved: 'Aprovada',
  expired: 'Expirada',
}

export const STATUS_TONE: Record<SavedProposalStatus, string> = {
  draft: 'warning',
  sent: 'info',
  approved: 'success',
  expired: 'muted',
}

/** Rótulo de status com fallback para valores legados da API em português. */
export function statusLabel(status: string): string {
  const legacy: Record<string, string> = {
    rascunho: STATUS_LABELS.draft,
    enviada: STATUS_LABELS.sent,
    aprovada: STATUS_LABELS.approved,
    expirada: STATUS_LABELS.expired,
  }
  return STATUS_LABELS[status as SavedProposalStatus] ?? legacy[status] ?? status
}

export function statusTone(status: string): string {
  const legacy: Record<string, string> = {
    rascunho: STATUS_TONE.draft,
    enviada: STATUS_TONE.sent,
    aprovada: STATUS_TONE.approved,
    expirada: STATUS_TONE.expired,
  }
  return STATUS_TONE[status as SavedProposalStatus] ?? legacy[status] ?? 'muted'
}
