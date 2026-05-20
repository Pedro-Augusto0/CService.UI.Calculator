import type { Prices } from '@/domain/prices'
import type {
  AdditionalsState,
  GlobalBillingMode,
  MatterServiceKey,
  ProposalMeta,
  ProposalSections,
  RegionKey,
  ReportFrequency,
  ReportsState,
  SectionKey,
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
      service: MatterServiceKey
    }
  | { type: 'SET_ACTIVE_SCOPE_TAB'; section: SectionKey }
  | { type: 'SET_GLOBAL_BILLING_MODE'; mode: GlobalBillingMode }
  | { type: 'SET_AVALIACAO_TIER'; tierId: string | null }
  | { type: 'SET_REPORTS'; patch: Partial<ReportsState> }
  | { type: 'TOGGLE_REPORT_EXECUTIVO'; enabled: boolean }
  | { type: 'SET_REPORT_EXECUTIVO_FREQ'; freq: ReportFrequency | null }
  | { type: 'TOGGLE_REPORT_ESTRATEGICO'; enabled: boolean }
  | { type: 'SET_REPORT_ESTRATEGICO_FREQ'; freq: ReportFrequency | null }
  | { type: 'TOGGLE_BI'; enabled: boolean }
  | { type: 'SET_ADDITIONALS'; patch: Partial<AdditionalsState> }
  | { type: 'TOGGLE_IMPRESSO'; enabled: boolean }
  | { type: 'TOGGLE_WEB_NACIONAL'; enabled: boolean }
  | { type: 'TOGGLE_WEB_INTERNACIONAL'; enabled: boolean }
  | { type: 'TOGGLE_RADIO'; enabled: boolean }
  | { type: 'SET_RADIO_REGION'; region: RegionKey | null }
  | { type: 'TOGGLE_TV'; enabled: boolean }
  | { type: 'SET_TV_REGION'; region: RegionKey | null }
  | { type: 'TOGGLE_MIDIAS_SOCIAIS'; enabled: boolean }
  | { type: 'SET_MIDIAS_SOCIAIS_TIER'; tierId: string | null }
  | { type: 'TOGGLE_STORIES_INSTAGRAM'; enabled: boolean }
  | { type: 'SET_STORIES_INSTAGRAM_TIER'; tierId: string | null }
  | { type: 'TOGGLE_DESTINATARIOS_EXTRAS'; enabled: boolean }
  | { type: 'SET_DESTINATARIOS_EXTRAS_TIER'; tierId: string | null }
  | { type: 'SET_NEWSLETTER_EXTRA_ENVIOS'; value: number }
  | { type: 'SET_VALIDADE_DIAS'; dias: number }
  | { type: 'SET_PRECO_BASE_MENSAL'; value: number }
  | { type: 'SET_PRICES'; prices: Prices }
  | {
      type: 'COMMIT_PRICING_CONFIG'
      prices: Prices
      precoBaseMensal: number
      /** Alinha estado e localStorage ao mesmo instante (opcional). */
      savedAt?: number
    }
  | { type: 'MARK_PROPOSAL_SAVED'; id: string; savedAt: number }

export interface ProposalState {
  currentStep: number
  meta: ProposalMeta
  sections: ProposalSections
  globalBillingMode: GlobalBillingMode
  avaliacaoTierId: string | null
  reports: ReportsState
  additionals: AdditionalsState
  validadeDias: number
  precoBaseMensal: number
  prices: Prices
  activeScopeTab: SectionKey
  /** Versão do fluxo do assistente (2 = cinco etapas). */
  wizardVersion: number
  savedProposalId: string | null
  lastSavedAt: number | null
  /** Timestamp ms da última persistência da tabela de preços ou do preço base (config). */
  pricingConfigSavedAt: number
}
