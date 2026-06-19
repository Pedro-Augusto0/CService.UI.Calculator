export const SECTION_KEYS = ['brands', 'competitors', 'sector'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

/** Modo de cobrança configurado pelo administrador para um serviço por matéria. */
export type BillingMode = 'fixed' | 'variable' | 'both'

/** Toggle global escolhido pelo comercial no Resumo da Proposta. */
export type GlobalBillingMode = 'fixed' | 'variable'

export const REPORT_FREQUENCIES = [
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
] as const
export type ReportFrequency = (typeof REPORT_FREQUENCIES)[number]

/**
 * Catálogo dos 6 serviços por matéria conforme item 5 do documento da Fase 1.
 * "Texto" foi removido — monitoramento textual faz parte do pacote base.
 */
export const MATTER_SERVICE_KEYS = [
  'columnInches',
  'highlight',
  'score',
  'ai',
  'screenshot',
  'assessment',
] as const
export type MatterServiceKey = (typeof MATTER_SERVICE_KEYS)[number]

/** Região para itens mutuamente exclusivos (Rádio e TV). */
export type RegionKey = 'spRj' | 'national'

export interface SectionConfig {
  keywords: string[]
  volume: number
  services: Record<MatterServiceKey, boolean>
}

export type ProposalSections = Record<SectionKey, SectionConfig>

export interface ReportsState {
  executiveEnabled: boolean
  executiveFrequency: ReportFrequency | null
  strategicEnabled: boolean
  strategicFrequency: ReportFrequency | null
  biEnabled: boolean
}

export interface AdditionalsState {
  printEnabled: boolean
  /** Web nacional e internacional podem ficar ligados ao mesmo tempo. */
  webNationalEnabled: boolean
  webInternationalEnabled: boolean
  radioEnabled: boolean
  radioRegion: RegionKey | null
  tvEnabled: boolean
  tvRegion: RegionKey | null
  socialMediaEnabled: boolean
  socialMediaTierId: string | null
  storiesInstagramEnabled: boolean
  storiesInstagramTierId: string | null
  webRealtimeAlerts: boolean
  apiCService: boolean
  newsletterWhatsApp: boolean
  /** Quantidade de envios adicionais cobrados como fixo por envio. */
  newsletterExtraSends: number
  extraRecipientsEnabled: boolean
  extraRecipientsTierId: string | null
  /** Acréscimo percentual sobre o total (item 7.11). */
  weekendOnCall: boolean
  manualCuration: boolean
  /** Desconto percentual sobre o total (item 7.13). */
  autoApproval: boolean
}

export interface ProposalMeta {
  clientName: string
  proposalName: string
  clientId: number | null
}

export interface CalculationInput {
  sections: ProposalSections
  globalBillingMode: GlobalBillingMode
  assessmentTierId: string | null
  reports: ReportsState
  additionals: AdditionalsState
  baseMonthlyPrice: number
  validityDays: number
  /** Desconto percentual escolhido pelo comercial sobre o total da proposta (após demais ajustes e preço base). 0–100. */
  totalDiscountPercent: number
}

export interface CalculationResult {
  totalKeywords: number
  totalVolume: number
  hasActiveServices: boolean
  /** Valor monetário por serviço por matéria selecionado (já resolvido por modo). */
  matterServiceValues: Record<MatterServiceKey, number>
  /** Soma de todos os Serviços por Matéria. */
  matterServicesTotal: number
  /** Soma dos Relatórios e BI selecionados. */
  reportsTotal: number
  /** Soma dos Adicionais (fixos, faixas, fixo por envio extra). */
  additionalsTotal: number
  /** Soma antes da aplicação dos modificadores percentuais. */
  subtotalBeforeModifiers: number
  /** % configurado pelo admin aplicado quando plantão está ligado. */
  onCallPercent: number
  /** % configurado pelo admin aplicado como desconto quando aprovação automática está ligada. */
  autoApprovalDiscountPercent: number
  factorPlantao: number
  factorAprovacaoAutomatica: number
  onCallSurchargeAmount: number
  autoApprovalDiscountAmount: number
  /** afterAprovacao + preço base, antes do desconto comercial informado na proposta. */
  amountBeforeCommercialDiscount: number
  /** Eco do percentual de desconto total (0–100). */
  totalDiscountPercent: number
  /** Valor retirado pelo desconto comercial (≤ 0). */
  totalDiscountAmount: number
  finalPrice: number
  /** Modo efetivo escolhido na proposta (eco do toggle). */
  globalBillingMode: GlobalBillingMode
  /** Rótulos dos serviços por matéria selecionados (para chips). */
  selectedMatterLabels: string[]
  /** Agrupamento usado por SummaryPanel e exportação HTML. */
  breakdownGroups: {
    baseMonthlyPrice: number
    matterServices: number
    reportsBi: number
    additionalServices: number
  }
}
