import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { updateCalculations } from '../domain/calculations'
import type { CalculationInput, CalculationResult } from '../domain/types'
import type { ProposalAction, ProposalState } from './proposalActions'
import { createInitialProposalState, proposalReducer } from './proposalReducer'

interface ProposalContextValue {
  state: ProposalState
  dispatch: React.Dispatch<ProposalAction>
  calculation: CalculationResult
  calculationInput: CalculationInput
}

const ProposalContext = createContext<ProposalContextValue | null>(null)

function toCalculationInput(state: ProposalState): CalculationInput {
  return {
    sections: state.sections,
    broadcast: state.broadcast,
    additionals: state.additionals,
    operational: state.operational,
    precoBaseMensal: state.precoBaseMensal,
  }
}

export function ProposalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    proposalReducer,
    undefined,
    createInitialProposalState,
  )

  const calculationInput = useMemo(() => toCalculationInput(state), [state])

  const calculation = useMemo(
    () => updateCalculations(calculationInput, state.prices),
    [calculationInput, state.prices],
  )

  const value = useMemo(
    () => ({
      state,
      dispatch,
      calculation,
      calculationInput,
    }),
    [state, dispatch, calculation, calculationInput],
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
