import type {
  AdditionalsState,
  GlobalBillingMode,
  ProposalSections,
  ReportsState,
  SectionKey,
} from '@/domain/types'
import { SECTION_KEYS } from '@/domain/types'
import type { ProposalState } from './proposalActions'
import {
  coerceLoadedAdditionals,
  createInitialProposalState,
  emptyAdditionals,
  type ProposalStateSeed,
} from './proposalReducer'

/** Parte da proposta reutilizável em modelos (sem cliente, volume ou termos). */
export interface ProposalTemplateSnapshot {
  sections: ProposalSections
  globalBillingMode: GlobalBillingMode
  avaliacaoTierId: string | null
  reports: ReportsState
  additionals: AdditionalsState
  validadeDias: number
  activeScopeTab: SectionKey
}

export function proposalStateToTemplateSnapshot(
  state: ProposalState,
): ProposalTemplateSnapshot {
  const sections = structuredClone(state.sections)
  for (const sk of SECTION_KEYS) {
    sections[sk] = {
      ...sections[sk],
      keywords: [],
      volume: 0,
    }
  }

  return {
    sections,
    globalBillingMode: state.globalBillingMode,
    avaliacaoTierId: state.avaliacaoTierId,
    reports: structuredClone(state.reports),
    additionals: structuredClone(state.additionals),
    validadeDias: state.validadeDias,
    activeScopeTab: state.activeScopeTab,
  }
}

export function proposalSnapshotToState(
  snapshot: ProposalTemplateSnapshot,
  seed: ProposalStateSeed,
): ProposalState {
  const initial = createInitialProposalState(seed)

  return {
    ...initial,
    currentStep: 0,
    meta: { clientName: '', proposalName: '' },
    savedProposalId: null,
    lastSavedAt: null,
    sections: structuredClone(snapshot.sections),
    globalBillingMode: snapshot.globalBillingMode,
    avaliacaoTierId: snapshot.avaliacaoTierId,
    reports: structuredClone(snapshot.reports),
    additionals: coerceLoadedAdditionals({
      ...emptyAdditionals(),
      ...structuredClone(snapshot.additionals),
    }),
    wizardVersion: 2,
    validadeDias: snapshot.validadeDias,
    activeScopeTab: snapshot.activeScopeTab,
  }
}

export function isProposalTemplateSnapshot(value: unknown): value is ProposalTemplateSnapshot {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    Boolean(v.sections)
    && typeof v.sections === 'object'
    && typeof v.globalBillingMode === 'string'
    && Boolean(v.reports)
    && typeof v.reports === 'object'
    && Boolean(v.additionals)
    && typeof v.additionals === 'object'
    && typeof v.validadeDias === 'number'
    && typeof v.activeScopeTab === 'string'
  )
}
