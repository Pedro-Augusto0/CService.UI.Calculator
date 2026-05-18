import type { SavedProposalStatus } from '@/features/proposal/lib/savedProposalStore'

export const STATUS_LABELS: Record<SavedProposalStatus, string> = {
  rascunho: 'Rascunho',
  enviada: 'Enviada',
  aprovada: 'Aprovada',
  expirada: 'Expirada',
}

export const STATUS_TONE: Record<SavedProposalStatus, string> = {
  rascunho: 'warning',
  enviada: 'info',
  aprovada: 'success',
  expirada: 'muted',
}
