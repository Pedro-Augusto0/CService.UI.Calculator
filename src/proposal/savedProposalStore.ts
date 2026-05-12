import { updateCalculations } from '../domain/calculations'
import type { CalculationInput, CalculationResult, ProposalMeta } from '../domain/types'
import type { ProposalState } from './proposalActions'

const STORAGE_KEY = 'cservice.ui.calculator.saved-proposals.v1'
const FIRST_PROPOSAL_NUMBER = 251

export const SAVED_PROPOSAL_STATUSES = [
  'rascunho',
  'enviada',
  'aprovada',
  'expirada',
] as const

export type SavedProposalStatus = (typeof SAVED_PROPOSAL_STATUSES)[number]

export interface SavedProposalRecord {
  id: string
  proposalNumber: number
  status: SavedProposalStatus
  createdAt: number
  updatedAt: number
  state: ProposalState
}

function hasBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isSavedProposalStatus(value: unknown): value is SavedProposalStatus {
  return typeof value === 'string' && SAVED_PROPOSAL_STATUSES.includes(value as SavedProposalStatus)
}

function isSavedProposalRecord(value: unknown): value is SavedProposalRecord {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.proposalNumber === 'number' &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.updatedAt === 'number' &&
    isSavedProposalStatus(candidate.status) &&
    Boolean(candidate.state) &&
    typeof candidate.state === 'object'
  )
}

export function sortSavedProposals(records: SavedProposalRecord[]): SavedProposalRecord[] {
  return [...records].sort((left, right) => right.updatedAt - left.updatedAt)
}

export function loadSavedProposals(): SavedProposalRecord[] {
  if (!hasBrowserStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return sortSavedProposals(parsed.filter(isSavedProposalRecord))
  } catch {
    return []
  }
}

export function persistSavedProposals(records: SavedProposalRecord[]): void {
  if (!hasBrowserStorage()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Falha silenciosa: o app continua funcional mesmo sem conseguir persistir.
  }
}

export function createSavedProposalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `proposal-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function nextProposalNumber(records: SavedProposalRecord[]): number {
  const maxNumber = records.reduce((highest, record) => {
    return Math.max(highest, record.proposalNumber)
  }, FIRST_PROPOSAL_NUMBER - 1)

  return maxNumber + 1
}

export function formatProposalNumber(proposalNumber: number): string {
  return `#${String(proposalNumber).padStart(4, '0')}`
}

export function resolveProposalMeta(state: ProposalState): ProposalMeta {
  const fallbackClient =
    state.sections.marcas.keywords[0]?.trim() ||
    state.sections.concorrentes.keywords[0]?.trim() ||
    state.sections.setor.keywords[0]?.trim() ||
    'Cliente sem nome'

  return {
    clientName: state.meta.clientName.trim() || fallbackClient,
    proposalName: state.meta.proposalName.trim() || 'Proposta de monitoramento',
  }
}

export function toCalculationInputFromState(state: ProposalState): CalculationInput {
  return {
    sections: state.sections,
    broadcast: state.broadcast,
    additionals: state.additionals,
    operational: state.operational,
    precoBaseMensal: state.precoBaseMensal,
  }
}

export function calculateProposalState(state: ProposalState): CalculationResult {
  return updateCalculations(toCalculationInputFromState(state), state.prices)
}
