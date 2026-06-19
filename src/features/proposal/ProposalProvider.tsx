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
import { useApi } from '@/features/api/config'
import { fetchCurrentPricing } from '@/features/api/pricingApi'
import {
  createProposal,
  duplicateProposalApi,
  fetchProposals,
  fetchProposalById,
  updateProposal,
  updateProposalStatusApi,
} from '@/features/api/proposalsApi'
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
  proposalsLoading: boolean
  saveCurrentProposal: () => SavedProposalRecord | Promise<SavedProposalRecord>
  loadSavedProposal: (id: string) => SavedProposalRecord | null | Promise<SavedProposalRecord | null>
  duplicateSavedProposal: (id: string) => SavedProposalRecord | null | Promise<SavedProposalRecord | null>
  updateSavedProposalStatus: (
    id: string,
    status: SavedProposalStatus,
  ) => void | Promise<void>
  userProposalTemplates: UserProposalTemplateRecord[]
  saveCurrentAsUserTemplate: (name: string, description: string) => void
  bumpUserTemplateUsage: (id: string) => void
}

const ProposalContext = createContext<ProposalContextValue | null>(null)

export function ProposalProvider({ children }: { children: ReactNode }) {
  const apiEnabled = useApi()
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
    apiEnabled ? [] : loadSavedProposals(),
  )
  const [proposalsLoading, setProposalsLoading] = useState(apiEnabled)
  const [userProposalTemplates, setUserProposalTemplates] = useState<
    UserProposalTemplateRecord[]
  >(() => loadUserProposalTemplates())

  useEffect(() => {
    if (apiEnabled) return
    persistSavedProposals(savedProposals)
  }, [apiEnabled, savedProposals])

  useEffect(() => {
    persistUserProposalTemplates(userProposalTemplates)
  }, [userProposalTemplates])

  useEffect(() => {
    if (!apiEnabled) return

    let cancelled = false
    ;(async () => {
      try {
        const [pricing, proposals] = await Promise.all([
          fetchCurrentPricing(),
          fetchProposals(),
        ])
        if (cancelled) return
        dispatch({
          type: 'COMMIT_PRICING_CONFIG',
          prices: pricing.prices,
          baseMonthlyPrice: pricing.baseMonthlyPrice,
          savedAt: pricing.pricingConfigSavedAt,
        })
        setSavedProposals(sortSavedProposals(proposals))
      } catch {
        if (!cancelled) setSavedProposals([])
      } finally {
        if (!cancelled) setProposalsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apiEnabled])

  const calculationInput = useMemo(
    () => toCalculationInputFromState(state),
    [state],
  )

  const calculation = useMemo(() => calculateProposalState(state), [state])

  const saveCurrentProposalLocal = useCallback(() => {
    const savedAt = Date.now()
    const meta = resolveProposalMeta(state)
    const existing = state.savedProposalId
      ? savedProposals.find((record) => record.id === state.savedProposalId)
      : null
    const id = existing?.id ?? createSavedProposalId()
    const savedRecord: SavedProposalRecord = {
      id,
      proposalNumber: existing?.proposalNumber ?? nextProposalNumber(savedProposals),
      status: existing?.status ?? 'draft',
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

    dispatch({ type: 'SET_PROPOSAL_META', patch: meta })
    dispatch({ type: 'MARK_PROPOSAL_SAVED', id: savedRecord.id, savedAt })
    return savedRecord
  }, [savedProposals, state])

  const saveCurrentProposal = useCallback(async () => {
    if (!apiEnabled) return saveCurrentProposalLocal()

    const meta = resolveProposalMeta(state)
    const payload = structuredClone({
      ...state,
      meta,
    })

    const record = state.savedProposalId
      ? await updateProposal(state.savedProposalId, payload)
      : await createProposal(payload)

    const savedAt = record.updatedAt
    dispatch({ type: 'SET_PROPOSAL_META', patch: meta })
    dispatch({ type: 'MARK_PROPOSAL_SAVED', id: record.id, savedAt })
    setSavedProposals((current) =>
      sortSavedProposals([
        record,
        ...current.filter((item) => item.id !== record.id),
      ]),
    )
    return record
  }, [apiEnabled, saveCurrentProposalLocal, state])

  const loadSavedProposalLocal = useCallback(
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

  const loadSavedProposal = useCallback(
    async (id: string) => {
      if (!apiEnabled) return loadSavedProposalLocal(id)

      try {
        const record = await fetchProposalById(id)
        dispatch({
          type: 'LOAD_PROPOSAL_STATE',
          state: structuredClone({
            ...record.state,
            currentStep: 0,
          }),
        })
        setSavedProposals((current) =>
          sortSavedProposals([
            record,
            ...current.filter((item) => item.id !== record.id),
          ]),
        )
        return record
      } catch {
        return null
      }
    },
    [apiEnabled, loadSavedProposalLocal],
  )

  const duplicateSavedProposalLocal = useCallback(
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
        status: 'draft',
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

  const duplicateSavedProposal = useCallback(
    async (id: string) => {
      if (!apiEnabled) return duplicateSavedProposalLocal(id)

      try {
        const record = await duplicateProposalApi(id)
        setSavedProposals((current) =>
          sortSavedProposals([record, ...current]),
        )
        return record
      } catch {
        return null
      }
    },
    [apiEnabled, duplicateSavedProposalLocal],
  )

  const updateSavedProposalStatusLocal = useCallback(
    (id: string, status: SavedProposalStatus) => {
      setSavedProposals((current) =>
        sortSavedProposals(
          current.map((record) => {
            if (record.id !== id) return record
            return { ...record, status, updatedAt: Date.now() }
          }),
        ),
      )
    },
    [],
  )

  const updateSavedProposalStatus = useCallback(
    async (id: string, status: SavedProposalStatus) => {
      if (!apiEnabled) {
        updateSavedProposalStatusLocal(id, status)
        return
      }

      await updateProposalStatusApi(id, status)
      setSavedProposals((current) =>
        sortSavedProposals(
          current.map((record) =>
            record.id === id
              ? { ...record, status, updatedAt: Date.now() }
              : record,
          ),
        ),
      )
    },
    [apiEnabled, updateSavedProposalStatusLocal],
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
      proposalsLoading,
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
      proposalsLoading,
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
