import type { Prices } from '@/domain/prices'
import type {
  AdditionalsState,
  BroadcastState,
  OperationalState,
  ProposalMeta,
  ProposalSections,
  SectionKey,
  MonitoringServiceKey,
} from '@/domain/types'

export type ProposalAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET_PROPOSAL' }
  | { type: 'LOAD_PROPOSAL_STATE'; state: ProposalState }
  | { type: 'SET_SECTION_KEYWORDS'; section: SectionKey; keywords: string[] }
  | { type: 'SET_SECTION_VOLUME'; section: SectionKey; volume: number }
  | { type: 'SET_PROPOSAL_META'; patch: Partial<ProposalMeta> }
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
  /** Persiste tabela de preços e preço base mensal num único passo (tela de configuração). */
  | { type: 'COMMIT_PRICING_CONFIG'; prices: Prices; precoBaseMensal: number }
  | { type: 'SET_APPLY_SERVICES_TO_ALL'; value: boolean }
  | { type: 'SET_ACTIVE_SCOPE_TAB'; section: SectionKey }
  | { type: 'MARK_PROPOSAL_SAVED'; id: string; savedAt: number }

export interface ProposalState {
  currentStep: number
  meta: ProposalMeta
  sections: ProposalSections
  broadcast: BroadcastState
  additionals: AdditionalsState
  operational: OperationalState
  precoBaseMensal: number
  prices: Prices
  applyServicesToAll: boolean
  activeScopeTab: SectionKey
  savedProposalId: string | null
  lastSavedAt: number | null
  /** Timestamp ms da última persistência da tabela de preços ou do preço base (config). */
  pricingConfigSavedAt: number
}
