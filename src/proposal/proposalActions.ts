import type { Prices } from '../domain/prices'
import type {
  AdditionalsState,
  BroadcastState,
  OperationalState,
  ProposalSections,
  SectionKey,
  MonitoringServiceKey,
} from '../domain/types'

export type ProposalAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET_PROPOSAL' }
  | { type: 'SET_SECTION_KEYWORDS'; section: SectionKey; keywords: string[] }
  | { type: 'SET_SECTION_VOLUME'; section: SectionKey; volume: number }
  | {
      type: 'TOGGLE_SECTION_SERVICE'
      section: SectionKey
      service: MonitoringServiceKey
    }
  | { type: 'SET_BROADCAST'; patch: Partial<BroadcastState> }
  | { type: 'SET_ADDITIONALS'; patch: Partial<AdditionalsState> }
  | { type: 'SET_OPERATIONAL'; patch: Partial<OperationalState> }
  | { type: 'SET_PRECO_BASE_MENSAL'; value: number }
  | { type: 'SET_PRICES'; prices: Prices }
  | { type: 'SET_APPLY_SERVICES_TO_ALL'; value: boolean }
  | { type: 'SET_ACTIVE_SCOPE_TAB'; section: SectionKey }

export interface ProposalState {
  currentStep: number
  sections: ProposalSections
  broadcast: BroadcastState
  additionals: AdditionalsState
  operational: OperationalState
  precoBaseMensal: number
  prices: Prices
  applyServicesToAll: boolean
  activeScopeTab: SectionKey
}
