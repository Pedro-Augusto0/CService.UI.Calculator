import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type { CalculationInput, CalculationResult } from '@/domain/types'
import type { ProposalAction, ProposalState } from './lib/proposalActions'
import { createInitialProposalState, proposalReducer } from './lib/proposalReducer'
import { loadStoredPricingConfig } from './lib/pricingConfigStore'
import {
  calculateProposalState,
  createSavedProposalId,
  loadSavedProposals,
  nextProposalNumber,
  persistSavedProposals,
  resolveProposalMeta,
  type SavedProposalRecord,
  type SavedProposalStatus,
  sortSavedProposals,
  toCalculationInputFromState,
} from './lib/savedProposalStore'

import { proposalStateToTemplateSnapshot } from './lib/proposalTemplateSnapshot'
import {
  createUserProposalTemplateRecord,
  loadUserProposalTemplates,
  persistUserProposalTemplates,
  sortUserProposalTemplates,
  type UserProposalTemplateRecord,
} from './lib/userProposalTemplateStore'

interface ProposalContextValue {
  state: ProposalState
  dispatch: React.Dispatch<ProposalAction>
  calculation: CalculationResult
  calculationInput: CalculationInput
  savedProposals: SavedProposalRecord[]
  saveCurrentProposal: () => SavedProposalRecord
  loadSavedProposal: (id: string) => SavedProposalRecord | null
  duplicateSavedProposal: (id: string) => SavedProposalRecord | null
  updateSavedProposalStatus: (
    id: string,
    status: SavedProposalStatus,
  ) => void
  userProposalTemplates: UserProposalTemplateRecord[]
  saveCurrentAsUserTemplate: (name: string, description: string) => void
  bumpUserTemplateUsage: (id: string) => void
}

const ProposalContext = createContext<ProposalContextValue | null>(null)

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(proposalReducer, undefined, () => {
    const stored = loadStoredPricingConfig()
    return createInitialProposalState(
      stored
        ? {
            prices: stored.prices,
            pricingConfigSavedAt: stored.pricingConfigSavedAt,
          }
        : {},
    )
  })
  const [savedProposals, setSavedProposals] = useState<SavedProposalRecord[]>(() =>
    loadSavedProposals(),
  )
  const [userProposalTemplates, setUserProposalTemplates] = useState<
    UserProposalTemplateRecord[]
  >(() => loadUserProposalTemplates())

  useEffect(() => {
    persistSavedProposals(savedProposals)
  }, [savedProposals])

  useEffect(() => {
    persistUserProposalTemplates(userProposalTemplates)
  }, [userProposalTemplates])

  const calculationInput = useMemo(
    () => toCalculationInputFromState(state),
    [state],
  )

  const calculation = useMemo(() => calculateProposalState(state), [state])

  const saveCurrentProposal = useCallback(() => {
    const savedAt = Date.now()
    const meta = resolveProposalMeta(state)
    const existing = state.savedProposalId
      ? savedProposals.find((record) => record.id === state.savedProposalId)
      : null
    const id = existing?.id ?? createSavedProposalId()
    const savedRecord: SavedProposalRecord = {
      id,
      proposalNumber: existing?.proposalNumber ?? nextProposalNumber(savedProposals),
      status: existing?.status ?? 'rascunho',
      createdAt: existing?.createdAt ?? savedAt,
      updatedAt: savedAt,
      state: structuredClone({
        ...state,
        meta,
        savedProposalId: id,
        lastSavedAt: savedAt,
      }),
    }

    setSavedProposals(
      sortSavedProposals(
        existing
          ? savedProposals.map((record) =>
              record.id === id ? savedRecord : record,
            )
          : [savedRecord, ...savedProposals],
      ),
    )

    dispatch({
      type: 'SET_PROPOSAL_META',
      patch: meta,
    })
    dispatch({
      type: 'MARK_PROPOSAL_SAVED',
      id: savedRecord.id,
      savedAt,
    })

    return savedRecord
  }, [savedProposals, state])

  const loadSavedProposal = useCallback(
    (id: string) => {
      const record =
        savedProposals.find((savedProposal) => savedProposal.id === id) ?? null
      if (!record) return null

      dispatch({
        type: 'LOAD_PROPOSAL_STATE',
        state: structuredClone({
          ...record.state,
          currentStep: 0,
        }),
      })
      return record
    },
    [savedProposals],
  )

  const duplicateSavedProposal = useCallback(
    (id: string) => {
      const source =
        savedProposals.find((savedProposal) => savedProposal.id === id) ?? null
      if (!source) return null

      const duplicatedAt = Date.now()
      const duplicatedId = createSavedProposalId()
      const duplicatedMeta = {
        ...source.state.meta,
        proposalName: `${source.state.meta.proposalName} (cópia)`,
      }

      const duplicatedRecord: SavedProposalRecord = {
        id: duplicatedId,
        proposalNumber: nextProposalNumber(savedProposals),
        status: 'rascunho',
        createdAt: duplicatedAt,
        updatedAt: duplicatedAt,
        state: structuredClone({
          ...source.state,
          meta: duplicatedMeta,
          savedProposalId: duplicatedId,
          lastSavedAt: duplicatedAt,
        }),
      }

      setSavedProposals((current) =>
        sortSavedProposals([duplicatedRecord, ...current]),
      )

      return duplicatedRecord
    },
    [savedProposals],
  )

  const updateSavedProposalStatus = useCallback(
    (id: string, status: SavedProposalStatus) => {
      setSavedProposals((current) =>
        sortSavedProposals(
          current.map((record) => {
            if (record.id !== id) return record

            return {
              ...record,
              status,
              updatedAt: Date.now(),
            }
          }),
        ),
      )
    },
    [],
  )

  const saveCurrentAsUserTemplate = useCallback(
    (name: string, description: string) => {
      const snapshot = proposalStateToTemplateSnapshot(state)
      const record = createUserProposalTemplateRecord(name, description, snapshot)
      setUserProposalTemplates((prev) =>
        sortUserProposalTemplates([record, ...prev]),
      )
    },
    [state],
  )

  const bumpUserTemplateUsage = useCallback((id: string) => {
    setUserProposalTemplates((prev) =>
      sortUserProposalTemplates(
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                usedCount: t.usedCount + 1,
                lastUsedAt: Date.now(),
                updatedAt: Date.now(),
              }
            : t,
        ),
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      state,
      dispatch,
      calculation,
      calculationInput,
      savedProposals,
      saveCurrentProposal,
      loadSavedProposal,
      duplicateSavedProposal,
      updateSavedProposalStatus,
      userProposalTemplates,
      saveCurrentAsUserTemplate,
      bumpUserTemplateUsage,
    }),
    [
      state,
      dispatch,
      calculation,
      calculationInput,
      savedProposals,
      saveCurrentProposal,
      loadSavedProposal,
      duplicateSavedProposal,
      updateSavedProposalStatus,
      userProposalTemplates,
      saveCurrentAsUserTemplate,
      bumpUserTemplateUsage,
    ],
  )

  return (
    <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>
  )
}

export function useProposal(): ProposalContextValue {
  const ctx = useContext(ProposalContext)
  if (!ctx) {
    throw new Error('useProposal must be used within ProposalProvider')
  }
  return ctx
}
