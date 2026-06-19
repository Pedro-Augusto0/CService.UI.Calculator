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
  | { type: 'SET_ASSESSMENT_TIER'; tierId: string | null }
  | { type: 'SET_REPORTS'; patch: Partial<ReportsState> }
  | { type: 'TOGGLE_REPORT_EXECUTIVE'; enabled: boolean }
  | { type: 'SET_REPORT_EXECUTIVE_FREQUENCY'; freq: ReportFrequency | null }
  | { type: 'TOGGLE_REPORT_STRATEGIC'; enabled: boolean }
  | { type: 'SET_REPORT_STRATEGIC_FREQUENCY'; freq: ReportFrequency | null }
  | { type: 'TOGGLE_BI'; enabled: boolean }
  | { type: 'SET_ADDITIONALS'; patch: Partial<AdditionalsState> }
  | { type: 'TOGGLE_PRINT'; enabled: boolean }
  | { type: 'TOGGLE_WEB_NATIONAL'; enabled: boolean }
  | { type: 'TOGGLE_WEB_INTERNATIONAL'; enabled: boolean }
  | { type: 'TOGGLE_RADIO'; enabled: boolean }
  | { type: 'SET_RADIO_REGION'; region: RegionKey | null }
  | { type: 'TOGGLE_TV'; enabled: boolean }
  | { type: 'SET_TV_REGION'; region: RegionKey | null }
  | { type: 'TOGGLE_SOCIAL_MEDIA'; enabled: boolean }
  | { type: 'SET_SOCIAL_MEDIA_TIER'; tierId: string | null }
  | { type: 'TOGGLE_STORIES_INSTAGRAM'; enabled: boolean }
  | { type: 'SET_STORIES_INSTAGRAM_TIER'; tierId: string | null }
  | { type: 'TOGGLE_EXTRA_RECIPIENTS'; enabled: boolean }
  | { type: 'SET_EXTRA_RECIPIENTS_TIER'; tierId: string | null }
  | { type: 'SET_NEWSLETTER_EXTRA_SENDS'; value: number }
  | { type: 'SET_VALIDITY_DAYS'; days: number }
  | { type: 'SET_BASE_MONTHLY_PRICE'; value: number }
  | { type: 'SET_PRICES'; prices: Prices }
  | {
      type: 'COMMIT_PRICING_CONFIG'
      prices: Prices
      baseMonthlyPrice: number
      /** Alinha estado e localStorage ao mesmo instante (opcional). */
      savedAt?: number
    }
  | { type: 'MARK_PROPOSAL_SAVED'; id: string; savedAt: number }
  /** Desconto comercial total (0–100%) sobre investimento após demais ajustes. */
  | { type: 'SET_TOTAL_DISCOUNT_PERCENT'; percent: number }

export interface ProposalState {
  currentStep: number
  meta: ProposalMeta
  sections: ProposalSections
  globalBillingMode: GlobalBillingMode
  assessmentTierId: string | null
  reports: ReportsState
  additionals: AdditionalsState
  validityDays: number
  baseMonthlyPrice: number
  prices: Prices
  activeScopeTab: SectionKey
  /** Desconto percentual total informado na última etapa (0–100). */
  totalDiscountPercent: number
  /** Versão do fluxo do assistente (2 = cinco etapas). */
  wizardVersion: number
  savedProposalId: string | null
  lastSavedAt: number | null
  /** Timestamp ms da última persistência da tabela de preços ou do preço base (config). */
  pricingConfigSavedAt: number
}
