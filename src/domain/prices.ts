import type {
  BillingMode,
  MatterServiceKey,
  ReportFrequency,
  SectionKey,
} from './types'
import { REPORT_FREQUENCIES } from './types'

/** Configuração de preço de um Serviço por Matéria (item 5). */
export interface MatterServiceConfig {
  mode: BillingMode
  fixedPrice: number
  variablePrice: number
}

/** Faixa de campos para Classificação Customizada / Avaliação (item 5.1). */
export interface AvaliacaoTier {
  id: string
  label: string
  fieldCount: number
  fixedPrice: number
  variablePrice: number
}

export interface AvaliacaoConfig {
  mode: BillingMode
  tiers: AvaliacaoTier[]
}

/** Faixa genérica para Mídias Sociais, Stories e Destinatários Adicionais. */
export interface RangeTier {
  id: string
  label: string
  upTo: number
  price: number
}

export interface ReportFrequencyPrices {
  byFrequency: Record<ReportFrequency, number>
}

export interface BiPrices {
  setupPrice: number
  monthlyMaintenance: number
}

export interface ReportsPrices {
  executivo: ReportFrequencyPrices
  estrategico: ReportFrequencyPrices
  bi: BiPrices
}

export interface AdditionalsPrices {
  radio: { spRj: number; nacional: number }
  tv: { spRj: number; nacional: number }
  midiasSociais: { tiers: RangeTier[] }
  storiesInstagram: { tiers: RangeTier[] }
  alertasWebRealtime: number
  apiCService: number
  newsletterWhatsApp: number
  newsletterExtraEnvio: number
  destinatariosExtras: { tiers: RangeTier[] }
  /** Percentual configurável aplicado como acréscimo sobre o total (item 7.11). */
  plantaoPercent: number
  curadoriaAprovacaoManual: number
  /** Percentual configurável aplicado como desconto sobre o total (item 7.13). */
  aprovacaoAutomaticaPercent: number
}

/** Catálogo completo de preços configurável pelo administrador. */
export interface Prices {
  matterServices: {
    centimetragem: MatterServiceConfig
    grifo: MatterServiceConfig
    score: MatterServiceConfig
    ia: MatterServiceConfig
    screenshot: MatterServiceConfig
    avaliacao: AvaliacaoConfig
  }
  reports: ReportsPrices
  additionals: AdditionalsPrices
  /** Opções de validade em dias que o comercial pode escolher (item 8). */
  validadeOptions: number[]
}

function makeMatter(
  mode: BillingMode,
  fixedPrice: number,
  variablePrice: number,
): MatterServiceConfig {
  return { mode, fixedPrice, variablePrice }
}

function makeFreq(prices: Record<ReportFrequency, number>): ReportFrequencyPrices {
  const byFrequency = {} as Record<ReportFrequency, number>
  for (const f of REPORT_FREQUENCIES) byFrequency[f] = prices[f] ?? 0
  return { byFrequency }
}

export const DEFAULT_PRICES: Prices = {
  matterServices: {
    centimetragem: makeMatter('both', 350, 0.85),
    grifo: makeMatter('both', 220, 0.45),
    score: makeMatter('variable', 0, 0.65),
    ia: makeMatter('both', 480, 2.1),
    screenshot: makeMatter('variable', 0, 0.95),
    avaliacao: {
      mode: 'both',
      tiers: [
        {
          id: 'aval-2',
          label: 'Até 2 campos',
          fieldCount: 2,
          fixedPrice: 300,
          variablePrice: 1.2,
        },
        {
          id: 'aval-5',
          label: 'Até 5 campos',
          fieldCount: 5,
          fixedPrice: 520,
          variablePrice: 1.8,
        },
        {
          id: 'aval-7',
          label: 'Até 7 campos',
          fieldCount: 7,
          fixedPrice: 740,
          variablePrice: 2.4,
        },
      ],
    },
  },
  reports: {
    executivo: makeFreq({
      semanal: 1800,
      quinzenal: 1500,
      mensal: 1200,
      trimestral: 1000,
      semestral: 850,
      anual: 700,
    }),
    estrategico: makeFreq({
      semanal: 1600,
      quinzenal: 1350,
      mensal: 1100,
      trimestral: 900,
      semestral: 780,
      anual: 650,
    }),
    bi: { setupPrice: 4500, monthlyMaintenance: 900 },
  },
  additionals: {
    radio: { spRj: 320, nacional: 950 },
    tv: { spRj: 500, nacional: 1800 },
    midiasSociais: {
      tiers: [
        { id: 'ms-100', label: 'Até 100 posts', upTo: 100, price: 250 },
        { id: 'ms-250', label: 'Até 250 posts', upTo: 250, price: 500 },
        { id: 'ms-500', label: 'Até 500 posts', upTo: 500, price: 900 },
      ],
    },
    storiesInstagram: {
      tiers: [
        { id: 'sg-100', label: 'Até 100 perfis', upTo: 100, price: 220 },
        { id: 'sg-250', label: 'Até 250 perfis', upTo: 250, price: 450 },
        { id: 'sg-500', label: 'Até 500 perfis', upTo: 500, price: 800 },
      ],
    },
    alertasWebRealtime: 400,
    apiCService: 600,
    newsletterWhatsApp: 350,
    newsletterExtraEnvio: 120,
    destinatariosExtras: {
      tiers: [
        { id: 'de-10', label: '+10 destinatários', upTo: 10, price: 80 },
        { id: 'de-25', label: '+25 destinatários', upTo: 25, price: 180 },
        { id: 'de-50', label: '+50 destinatários', upTo: 50, price: 320 },
        { id: 'de-100', label: '+100 destinatários', upTo: 100, price: 600 },
      ],
    },
    plantaoPercent: 25,
    curadoriaAprovacaoManual: 350,
    aprovacaoAutomaticaPercent: 10,
  },
  validadeOptions: [15, 30, 60, 90],
}

/** Preço base mensal inicial (item 4). */
export const DEFAULT_PRECO_BASE_MENSAL = 1500

export const MATTER_SERVICE_LABELS: Record<MatterServiceKey, string> = {
  centimetragem: 'Centimetragem / Valoração',
  grifo: 'Destaque de Termos / Grifo',
  score: 'CService Score',
  ia: 'Enriquecimento Inteligente por IA',
  screenshot: 'Captura de Tela / Screenshot',
  avaliacao: 'Classificação Customizada / Avaliação',
}

export const MATTER_SERVICE_SHORT_LABELS: Record<MatterServiceKey, string> = {
  centimetragem: 'Centimetragem',
  grifo: 'Grifo',
  score: 'Score',
  ia: 'IA',
  screenshot: 'Screenshot',
  avaliacao: 'Avaliação',
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  marcas: 'Marcas',
  concorrentes: 'Concorrentes',
  setor: 'Setor',
}

export const REPORT_FREQUENCY_LABELS: Record<ReportFrequency, string> = {
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
}

export const REGION_LABELS: Record<'spRj' | 'nacional', string> = {
  spRj: 'SP + RJ',
  nacional: 'Nacional',
}

export const BILLING_MODE_LABELS: Record<BillingMode, string> = {
  fixed: 'Preço fixo',
  variable: 'Preço por volume',
  both: 'Fixo e variável',
}
