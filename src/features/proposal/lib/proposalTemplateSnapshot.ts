import type {
  AdditionalsState,
  BroadcastState,
  OperationalState,
  ProposalSections,
  SectionKey,
} from '@/domain/types'
import { SECTION_KEYS } from '@/domain/types'
import type { ProposalState } from './proposalActions'
import { createInitialProposalState, type ProposalStateSeed } from './proposalReducer'

/** Parte da proposta reutilizável em modelos (sem cliente, volume ou termos). */
export interface ProposalTemplateSnapshot {
  sections: ProposalSections
  broadcast: BroadcastState
  additionals: AdditionalsState
  operational: OperationalState
  applyServicesToAll: boolean
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
    broadcast: structuredClone(state.broadcast),
    additionals: structuredClone(state.additionals),
    operational: structuredClone(state.operational),
    applyServicesToAll: state.applyServicesToAll,
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
    broadcast: { ...snapshot.broadcast },
    additionals: { ...snapshot.additionals },
    operational: { ...snapshot.operational },
    applyServicesToAll: snapshot.applyServicesToAll,
    activeScopeTab: snapshot.activeScopeTab,
  }
}

export function isProposalTemplateSnapshot(value: unknown): value is ProposalTemplateSnapshot {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    Boolean(v.sections)
    && typeof v.sections === 'object'
    && Boolean(v.broadcast)
    && typeof v.broadcast === 'object'
    && Boolean(v.additionals)
    && typeof v.additionals === 'object'
    && Boolean(v.operational)
    && typeof v.operational === 'object'
    && typeof v.applyServicesToAll === 'boolean'
    && typeof v.activeScopeTab === 'string'
  )
}
