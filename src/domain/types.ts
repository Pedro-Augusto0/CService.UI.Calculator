export const SECTION_KEYS = ['marcas', 'concorrentes', 'setor'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const MONITORING_SERVICE_KEYS = [
  'texto',
  'centimetragem',
  'grifo',
  'score',
  'avaliacao',
  'ia',
  'screenshot',
] as const
export type MonitoringServiceKey = (typeof MONITORING_SERVICE_KEYS)[number]

export const SERVICE_VALUE_KEYS = [
  ...MONITORING_SERVICE_KEYS,
  'tv',
  'radio',
  'relatorio',
  'midias_sociais',
  'alertas_web',
  'api',
  'stories',
  'destaques',
  'envios',
] as const
export type ServiceValueKey = (typeof SERVICE_VALUE_KEYS)[number]

export type ServiceValues = Record<ServiceValueKey, number>

export interface SectionConfig {
  keywords: string[]
  volume: number
  services: Record<MonitoringServiceKey, boolean>
}

export type ProposalSections = Record<SectionKey, SectionConfig>

export interface BroadcastState {
  tvEnabled: boolean
  tvRegion: '' | 'sp_rj' | 'nacional'
  radioEnabled: boolean
  radioRegion: '' | 'sp_rj' | 'nacional'
  relatorioEnabled: boolean
  relatorioFreq: '' | 'mensal' | 'semanal'
}

export interface AdditionalsState {
  midiasSociais: boolean
  alertasWeb: boolean
  api: boolean
  stories: boolean
  destaques: boolean
}

export interface OperationalState {
  enviosDiarios: number
  numDestinatarios: number
  /** Newsletter dias úteis vs 30 dias + modificador +25% no preço */
  envioFeriadosFds: boolean
  aprovacaoAutomatica: boolean
}

export interface CalculationInput {
  sections: ProposalSections
  broadcast: BroadcastState
  additionals: AdditionalsState
  operational: OperationalState
  precoBaseMensal: number
}

export interface PriceBreakdownLine {
  key: string
  label: string
  amount: number
}

export interface CalculationResult {
  totalKeywords: number
  totalVolume: number
  hasActiveServices: boolean
  serviceValues: ServiceValues
  /** PB = totalVolume * volumePrice */
  volumeMonetaryBase: number
  /** Soma de todos os campos em serviceValues */
  sumServiceValues: number
  /** PB + S (sem preço base mensal, antes dos modificadores) */
  subtotalBeforeModifiers: number
  /** Multiplicador fins de semana/feriados (1 ou 1.25) */
  factorWeekend: number
  /** Multiplicador aprovação automática (1 ou 0.6) */
  factorAutoApproval: number
  /** (PB + S) * fatores, ainda sem preço base mensal */
  priceAfterModifiersBeforeMonthlyBase: number
  valorAcrescimoFimDeSemana: number
  valorImpactoAprovacaoAutomatica: number
  /** Preço final numérico */
  finalPrice: number
  selectedMonitoringLabels: string[]
  breakdownGroups: {
    precoBaseMensal: number
    servicosMonitoramento: number
    servicosAdicionais: number
    relatorioAnalitico: number
  }
}
